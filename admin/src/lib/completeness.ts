import type { Product } from '@/types/domain';
import { countMissing } from './pricing';
import { findConflicts } from './rules';

export interface ProductHealth {
  score: number; // 0–100
  missingPrices: number;
  emptySteps: string[];
  conflicts: number;
  issues: string[];
}

/** "Prêt à 80 % — il manque 3 prix" : what blocks a product from being published. */
export function productHealth(product: Product): ProductHealth {
  const missingPrices = product.grids.reduce((n, g) => n + countMissing(g), 0);
  const emptySteps = product.steps.filter((s) => s.enabled && s.kind !== 'dimensions' && s.options.length === 0).map((s) => s.title);
  const conflicts = findConflicts(product.rules).length;

  const checks = [
    product.description.trim().length > 0,
    product.grids.length > 0,
    missingPrices === 0,
    emptySteps.length === 0,
    conflicts === 0,
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const issues: string[] = [];
  if (missingPrices) issues.push(`${missingPrices} prix manquant${missingPrices > 1 ? 's' : ''}`);
  if (emptySteps.length) issues.push(`${emptySteps.length} étape${emptySteps.length > 1 ? 's' : ''} sans option`);
  if (conflicts) issues.push(`${conflicts} règle${conflicts > 1 ? 's' : ''} en conflit`);
  if (!product.grids.length) issues.push('aucune grille de prix');

  return { score, missingPrices, emptySteps, conflicts, issues };
}
