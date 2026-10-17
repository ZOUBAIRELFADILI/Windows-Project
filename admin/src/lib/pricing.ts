import type { Configuration, Option, PriceGrid, PriceLine, Product, Promotion } from '@/types/domain';
import { evaluateRules, optionKey, type RuleEffects } from './rules';

const round2 = (n: number) => Math.round(n * 100) / 100;
const STRUCTURAL_STEPS = new Set(['variant', 'material', 'panels', 'opening']);

export const surfaceM2 = (width: number, height: number) => round2((width * height) / 1_000_000);

export type GridLookup =
  | { ok: true; price: number; width: number; height: number }
  | { ok: false; reason: 'out-of-range' | 'missing-price'; width?: number; height?: number };

/**
 * Finds the base price in a width × height grid.
 * Industry practice: round UP to the next grid step (2450 mm → 2500 mm column).
 */
export function lookupGrid(grid: PriceGrid, width: number, height: number): GridLookup {
  if (width < grid.minWidth || width > grid.maxWidth || height < grid.minHeight || height > grid.maxHeight) {
    return { ok: false, reason: 'out-of-range' };
  }
  const wi = grid.widths.findIndex((w) => w >= width);
  const hi = grid.heights.findIndex((h) => h >= height);
  if (wi === -1 || hi === -1) return { ok: false, reason: 'out-of-range' };
  const price = grid.prices[hi][wi];
  if (price == null) return { ok: false, reason: 'missing-price', width: grid.widths[wi], height: grid.heights[hi] };
  return { ok: true, price, width: grid.widths[wi], height: grid.heights[hi] };
}

/** Linear interpolation of missing cells from their row neighbours (then column neighbours). */
export function fillMissing(grid: PriceGrid): PriceGrid {
  const prices = grid.prices.map((row) => [...row]);
  const interp = (line: (number | null)[], i: number) => {
    let l = i - 1;
    while (l >= 0 && line[l] == null) l--;
    let r = i + 1;
    while (r < line.length && line[r] == null) r++;
    const lv = l >= 0 ? line[l] : null;
    const rv = r < line.length ? line[r] : null;
    if (lv != null && rv != null) return Math.round((lv + ((rv - lv) * (i - l)) / (r - l)) / 10) * 10;
    return lv ?? rv;
  };
  prices.forEach((row, hi) =>
    row.forEach((cell, wi) => {
      if (cell != null) return;
      const v = interp(row, wi) ?? interp(prices.map((r) => r[wi]), hi);
      prices[hi][wi] = v;
    }),
  );
  return { ...grid, prices };
}

export const countMissing = (grid: PriceGrid) => grid.prices.flat().filter((p) => p == null).length;

export function optionAmount(option: Option, base: number, width: number, height: number): number {
  const p = option.price;
  switch (p.kind) {
    case 'included':
      return 0;
    case 'percent':
      return round2((base * p.value) / 100);
    case 'fixed':
      return round2(p.value);
    case 'perM2':
      return round2(p.value * surfaceM2(width, height));
  }
}

export interface Quote {
  ok: boolean;
  grid?: PriceGrid;
  base: number;
  lines: PriceLine[];
  subtotal: number;
  discount: number;
  promotion?: Promotion;
  total: number;
  errors: string[];
  effects: RuleEffects;
}

export function gridForConfig(product: Product, config: Configuration): PriceGrid | undefined {
  const panelsStep = product.steps.find((s) => s.id === 'panels');
  const selected = panelsStep?.options.find((o) => config.selections.panels?.includes(o.id));
  return product.grids.find((g) => g.panels === selected?.panels) ?? product.grids[0];
}

/**
 * The price engine. Deterministic and pure: the backend must run this same
 * code again at checkout — never trust a price sent by the browser.
 */
export function computeQuote(product: Product, config: Configuration, promotions: Promotion[] = []): Quote {
  const effects = evaluateRules(product.rules, config);
  const errors: string[] = [];
  const grid = gridForConfig(product, config);
  const lines: PriceLine[] = [];
  let base = 0;

  if (effects.widthLimit && (config.width < effects.widthLimit.min || config.width > effects.widthLimit.max)) {
    errors.push(`La largeur doit être comprise entre ${effects.widthLimit.min} et ${effects.widthLimit.max} mm.`);
  }

  if (!grid) {
    errors.push('Aucune grille de prix pour cette configuration.');
  } else {
    const found = lookupGrid(grid, config.width, config.height);
    if (found.ok) {
      base = found.price;
      lines.push({
        label: 'Prix de base (grille)',
        detail: `${config.width} × ${config.height} mm (${surfaceM2(config.width, config.height).toFixed(2).replace('.', ',')} m²)`,
        amount: base,
        visual: product.visual,
      });
    } else if (found.reason === 'missing-price') {
      errors.push(`Prix manquant dans la grille « ${grid.label} » pour ${found.width} × ${found.height} mm.`);
    } else {
      errors.push(`Dimensions hors limites (${grid.minWidth}–${grid.maxWidth} × ${grid.minHeight}–${grid.maxHeight} mm).`);
    }
  }

  for (const step of product.steps) {
    if (!step.enabled || step.kind === 'dimensions') continue;
    const chosen = new Set(config.selections[step.id] ?? []);
    for (const o of step.options) {
      if (effects.autoAdded.has(optionKey(step.id, o.id))) chosen.add(o.id);
    }
    for (const option of step.options) {
      if (!chosen.has(option.id)) continue;
      const key = optionKey(step.id, option.id);
      if (effects.hidden.has(key) || effects.disabled.has(key)) {
        errors.push(`« ${option.name} » n'est pas disponible avec cette configuration.`);
        continue;
      }
      const amount = optionAmount(option, base, config.width, config.height);
      // Structural choices at no extra cost don't need their own price line.
      if (amount === 0 && (STRUCTURAL_STEPS.has(step.id) || step.kind === 'toggle')) continue;
      lines.push({ label: option.name, detail: `${step.title} · ${describePrice(option, config)}`, amount, visual: option.visual });
    }
    for (const req of effects.required) {
      const [sid, oid] = req.split(':');
      if (sid === step.id && !chosen.has(oid)) {
        const name = step.options.find((o) => o.id === oid)?.name ?? oid;
        errors.push(`« ${name} » est obligatoire avec cette configuration.`);
      }
    }
  }

  const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  const promotion = promotions.find((p) => p.id === product.promotionId && p.active);
  const discount = promotion ? round2((subtotal * promotion.percent) / 100) : 0;
  const total = round2(subtotal - discount);

  return { ok: errors.length === 0, grid, base, lines, subtotal, discount, promotion, total, errors, effects };
}

export function describePrice(option: Option, config?: Pick<Configuration, 'width' | 'height'>): string {
  const p = option.price;
  switch (p.kind) {
    case 'included':
      return 'Inclus';
    case 'percent':
      return `+ ${p.value} % sur le prix de base`;
    case 'fixed':
      return `+ ${p.value.toFixed(2).replace('.', ',')} € par produit`;
    case 'perM2':
      return config
        ? `${p.value.toFixed(2).replace('.', ',')} €/m² × ${surfaceM2(config.width, config.height).toFixed(2).replace('.', ',')} m²`
        : `${p.value.toFixed(2).replace('.', ',')} €/m²`;
  }
}

/** Default configuration = the default option of each step (or the first one). */
export function defaultConfiguration(product: Product): Configuration {
  const selections: Record<string, string[]> = {};
  for (const step of product.steps) {
    if (step.kind === 'dimensions') continue;
    const def = step.options.filter((o) => o.isDefault);
    selections[step.id] = def.length ? def.map((o) => o.id) : step.multi ? [] : step.options[0] ? [step.options[0].id] : [];
  }
  const config: Configuration = { selections, width: 2500, height: 2200, altitude: 200 };
  // Fall back to a size that fits the product's grid (e.g. small windows).
  const grid = gridForConfig(product, config);
  if (grid && !lookupGrid(grid, config.width, config.height).ok) {
    config.width = grid.widths[Math.floor(grid.widths.length / 2)];
    config.height = grid.heights[Math.floor(grid.heights.length / 2)];
  }
  return config;
}
