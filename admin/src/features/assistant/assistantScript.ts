/**
 * Mockup brain of the assistant: keyword matching + the real engines.
 * In production this is replaced by an LLM with tool calling against the admin API
 * (same validations as the UI). The contract stays the same: the AI PROPOSES a change set,
 * a human VALIDATES it, and the price itself is always computed by lib/pricing.ts.
 */
import type { Option, Product, Promotion } from '@/types/domain';
import { computeQuote, defaultConfiguration } from '@/lib/pricing';
import { productHealth } from '@/lib/completeness';
import { formatEuro, priceBadge } from '@/lib/format';

export interface ChangeSet {
  title: string;
  productId: string;
  stepId: string;
  changes: Array<{ before: Option; after: Option }>;
}

export interface Reply {
  text: string;
  bullets?: string[];
  proposal?: ChangeSet;
}

export const SUGGESTIONS = [
  'Pourquoi cette baie coûte ce prix ?',
  'Augmente tous les bois de 5 points sauf le pin',
  'Vérifier les erreurs',
  'Créer un produit depuis un catalogue fournisseur',
  'Comment ajouter une nouvelle couleur ?',
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function answer(question: string, products: Product[], promotions: Promotion[]): Reply {
  const q = norm(question);
  const product = products.find((p) => p.id === 'baie-accordeon-bois-alu') ?? products[0];

  if (q.includes('pourquoi') || q.includes('prix') || q.includes('coute')) {
    const quote = computeQuote(product, defaultConfiguration(product), promotions);
    return {
      text: `Voici le calcul pour « ${product.name} » dans sa configuration par défaut :`,
      bullets: [
        ...quote.lines.map((l) => `${l.label} : ${l.amount === 0 ? 'inclus' : formatEuro(l.amount)}${l.label.startsWith('Prix de base') ? ` (${l.detail})` : ''}`),
        `Sous-total : ${formatEuro(quote.subtotal)}`,
        ...(quote.promotion ? [`${quote.promotion.label} (−${quote.promotion.percent} %) : −${formatEuro(quote.discount)}`] : []),
        `Total TTC : ${formatEuro(quote.total)}`,
      ],
    };
  }

  if (q.includes('augmente') || q.includes('hausse')) {
    const step = product.steps.find((s) => s.id === 'wood');
    if (!step) return { text: 'Ce produit n’a pas d’étape « bois ».' };
    const changes = step.options
      .filter((o) => o.price.kind === 'percent' && !norm(o.name).includes('pin'))
      .map((o) => ({
        before: o,
        after: { ...o, price: { kind: 'percent' as const, value: (o.price.kind === 'percent' ? o.price.value : 0) + 5 } },
      }));
    return {
      text: `Je propose ${changes.length} modifications sur « ${product.name} ». Rien n’est appliqué tant que vous n’avez pas validé.`,
      proposal: { title: 'Bois +5 points (sauf pin)', productId: product.id, stepId: step.id, changes },
    };
  }

  if (q.includes('erreur') || q.includes('verifier') || q.includes('probleme')) {
    const lines = products.map((p) => {
      const h = productHealth(p);
      return `${p.name} : ${h.issues.length ? h.issues.join(', ') : 'aucun problème'} (prêt à ${h.score} %)`;
    });
    return { text: 'J’ai vérifié tous vos produits :', bullets: lines };
  }

  if (q.includes('catalogue') || q.includes('fournisseur') || q.includes('pdf') || q.includes('excel')) {
    return {
      text: 'Déposez le catalogue PDF et la liste de prix Excel du fournisseur. Je créerai un BROUILLON avec :',
      bullets: ['les étapes et les options (noms, images, descriptions)', 'les grilles de prix largeur × hauteur', 'les règles d’incompatibilité trouvées dans le catalogue', 'la liste de ce que je n’ai pas pu lire, à compléter par vous'],
    };
  }

  if (q.includes('couleur') || q.includes('ral') || q.includes('comment')) {
    return {
      text: 'Pour ajouter une couleur :',
      bullets: ['Ouvrez « Bibliothèque d’options » → onglet « Couleurs ».', 'Cliquez « Nouvelle couleur », saisissez le code RAL : l’aperçu se remplit tout seul.', 'Choisissez comment elle change le prix (inclus, %, montant fixe).', 'Ajoutez-la à un produit avec « Ajouter à un produit ».'],
    };
  }

  return { text: 'Je peux expliquer un prix, proposer des modifications en masse, vérifier les erreurs ou vous guider. Essayez une des suggestions ci-dessous.' };
}

export const describeChange = (c: { before: Option; after: Option }) => `${c.before.name} : ${priceBadge(c.before.price)} → ${priceBadge(c.after.price)}`;
