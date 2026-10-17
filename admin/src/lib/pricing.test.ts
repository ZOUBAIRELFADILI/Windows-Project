import { describe, expect, it } from 'vitest';
import { products, promotions } from '@/data/mock';
import { computeQuote, countMissing, defaultConfiguration, fillMissing, lookupGrid, surfaceM2 } from './pricing';
import { evaluateRules, findConflicts } from './rules';
import type { Configuration } from '@/types/domain';

const accordion = products[0];
const grid3 = accordion.grids.find((g) => g.panels === 3)!;
const withPick = (pick: Record<string, string[]>, patch: Partial<Configuration> = {}): Configuration => {
  const c = defaultConfiguration(accordion);
  return { ...c, ...patch, selections: { ...c.selections, ...pick } };
};

describe('price grid', () => {
  it('reads the exact cell', () => {
    expect(lookupGrid(grid3, 2500, 2200)).toMatchObject({ ok: true, price: 6120 });
  });
  it('rounds up to the next step', () => {
    expect(lookupGrid(grid3, 2450, 2150)).toMatchObject({ ok: true, width: 2500, height: 2200, price: 6120 });
  });
  it('reports missing prices and out-of-range sizes', () => {
    expect(lookupGrid(grid3, 2600, 1900)).toMatchObject({ ok: false, reason: 'missing-price' });
    expect(lookupGrid(grid3, 3000, 2200)).toMatchObject({ ok: false, reason: 'out-of-range' });
  });
  it('fills missing cells by interpolation', () => {
    expect(countMissing(grid3)).toBe(3);
    const filled = fillMissing(grid3);
    expect(countMissing(filled)).toBe(0);
    const hi = grid3.heights.indexOf(1900);
    const wi = grid3.widths.indexOf(2600);
    expect(filled.prices[hi][wi]).toBe(Math.round(((grid3.prices[hi][wi - 1]! + grid3.prices[hi][wi + 1]!) / 2) / 10) * 10);
  });
});

describe('quote', () => {
  it('computes the reference configuration line by line', () => {
    const q = computeQuote(accordion, defaultConfiguration(accordion), promotions);
    expect(q.ok).toBe(true);
    expect(surfaceM2(2500, 2200)).toBe(5.5);
    expect(q.lines.map((l) => [l.label, l.amount])).toEqual([
      ['Prix de base (grille)', 6120],
      ['IDEALU 78 mm', 1530], // +25 %
      ['Sapin', 612], // +10 %
      ['Métallique Alpha', 1224], // +20 %
      ['Triple vitrage Ug 0,7', 236.94], // 43,08 €/m² × 5,5 m²
      ['Poignée standard', 0], // shown as "Inclus"
    ]);
    expect(q.subtotal).toBe(9722.94);
    expect(q.discount).toBe(1458.44); // -15 %
    expect(q.total).toBe(8264.5);
  });

  it('adds fixed prices and auto-added options from rules', () => {
    const q = computeQuote(accordion, withPick({ shutter: ['oui'] }), promotions);
    expect(q.lines.find((l) => l.label === 'Oui')?.amount).toBe(690);
    expect(q.lines.find((l) => l.label === 'Élargissement du dormant')?.amount).toBe(65);
  });

  it('blocks a hidden option and a width outside the rule limit', () => {
    const hidden = computeQuote(accordion, withPick({ panels: ['v4'], shutter: ['oui'] }, { width: 3000 }), promotions);
    expect(hidden.ok).toBe(false);
    expect(hidden.errors.some((e) => e.includes('pas disponible'))).toBe(true);

    const tooWide = computeQuote(accordion, withPick({}, { width: 2800 }), promotions);
    expect(tooWide.errors[0]).toContain('2010 et 2760');
  });
});

describe('rules', () => {
  it('fires the altitude message', () => {
    const fx = evaluateRules(accordion.rules, withPick({}, { altitude: 900 }));
    expect(fx.messages.some((m) => m.includes('800 m'))).toBe(true);
  });
  it('detects contradictory rules', () => {
    const rules = [
      ...accordion.rules,
      { id: 'x', enabled: true, note: '', when: { type: 'option' as const, stepId: 'wood', optionId: 'pin' }, then: { type: 'hide' as const, stepId: 'extras', optionId: 'dormant' } },
    ];
    expect(findConflicts(rules)).toHaveLength(1);
  });
});
