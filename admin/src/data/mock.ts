/**
 * Demo data for the mockup. Replace with API calls later (see src/services/).
 * Prices are computed by the real engine (lib/pricing.ts), so every screen shows the same numbers.
 */
import type {
  Configuration,
  LibraryItem,
  Order,
  OrderStatus,
  PriceGrid,
  Product,
  Promotion,
  Rule,
  Step,
} from '@/types/domain';
import { computeQuote, defaultConfiguration } from '@/lib/pricing';

const round10 = (n: number) => Math.round(n / 10) * 10;
const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

function makeGrid(
  id: string,
  panels: number,
  widths: number[],
  heights: number[],
  offset: number,
  missing: Array<[number, number]> = [],
): PriceGrid {
  const prices = heights.map((h) =>
    widths.map((w) => (missing.some(([mw, mh]) => mw === w && mh === h) ? null : round10(offset + 1.08 * w + 1.2 * h))),
  );
  return {
    id,
    label: `${panels} vantaux`,
    panels,
    widths,
    heights,
    prices,
    minWidth: widths[0],
    maxWidth: widths[widths.length - 1],
    minHeight: heights[0],
    maxHeight: heights[heights.length - 1],
  };
}

export const promotions: Promotion[] = [
  { id: 'promo-automne', label: 'Offre automne 2026', percent: 15, active: true },
  { id: 'promo-quantite', label: 'Remise quantité (3+ produits)', percent: 5, active: false },
];

const WOOD = {
  pin: '#E9B872',
  sapin: '#E2A55C',
  meranti: '#B5652F',
  eucalyptus: '#A0522D',
  chene: '#C8955B',
  meleze: '#D8A878',
};

function accordionSteps(): Step[] {
  return [
    {
      id: 'variant',
      title: 'Variante',
      subtitle: 'Le système d’ouverture de la baie.',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'accordeon', name: 'Porte accordéon', description: 'Panneaux pliants, grande ouverture.', visual: { type: 'window', panels: 3, opening: 'fold' }, price: { kind: 'included' }, isDefault: true, promo: true },
        { id: 'accordeon-pmr', name: 'Accordéon seuil PMR', description: 'Seuil plat accessible.', visual: { type: 'window', panels: 3, opening: 'fold' }, price: { kind: 'fixed', value: 180 } },
      ],
    },
    {
      id: 'material',
      title: 'Matière',
      subtitle: 'Le matériau du cadre.',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'bois-alu', name: 'Bois-Aluminium', description: 'Bois à l’intérieur, alu à l’extérieur.', visual: { type: 'icon', name: 'material' }, price: { kind: 'included' }, isDefault: true },
        { id: 'bois', name: 'Bois', description: 'Bois massif intérieur et extérieur.', visual: { type: 'wood', tone: WOOD.chene }, price: { kind: 'included' } },
      ],
    },
    {
      id: 'profile',
      title: 'Profilé',
      subtitle: 'Épaisseur et performance thermique.',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'p68', name: 'IDEALU 68 mm', description: 'Uw ≥ 0,86 · design à pan décalé.', visual: { type: 'icon', name: 'profile' }, price: { kind: 'included' } },
        { id: 'p78', name: 'IDEALU 78 mm', description: 'Uw ≥ 0,78 · isolation renforcée.', visual: { type: 'icon', name: 'profile' }, price: { kind: 'percent', value: 25 }, isDefault: true },
      ],
    },
    {
      id: 'wood',
      title: 'Choix du bois',
      subtitle: 'L’essence de bois pour l’intérieur.',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'pin', name: 'Pin', description: 'Bois clair, économique et durable.', visual: { type: 'wood', tone: WOOD.pin }, price: { kind: 'included' }, libraryId: 'wood-pin' },
        { id: 'sapin', name: 'Sapin', description: 'Aspect naturel, bon rapport qualité/prix.', visual: { type: 'wood', tone: WOOD.sapin }, price: { kind: 'percent', value: 10 }, isDefault: true, libraryId: 'wood-sapin' },
        { id: 'meranti', name: 'Meranti', description: 'Bois exotique, stable et chaleureux.', visual: { type: 'wood', tone: WOOD.meranti }, price: { kind: 'percent', value: 20 }, libraryId: 'wood-meranti' },
        { id: 'eucalyptus', name: 'Eucalyptus', description: 'Excellente stabilité et résistance.', visual: { type: 'wood', tone: WOOD.eucalyptus }, price: { kind: 'percent', value: 40 }, libraryId: 'wood-eucalyptus' },
        { id: 'chene', name: 'Chêne', description: 'Noble et intemporel.', visual: { type: 'wood', tone: WOOD.chene }, price: { kind: 'percent', value: 50 }, libraryId: 'wood-chene' },
      ],
    },
    {
      id: 'alu',
      title: 'Couleur aluminium',
      subtitle: 'La couleur de l’alu à l’extérieur.',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'ral9016', name: 'RAL 9016 Blanc trafic', visual: { type: 'color', hex: '#F1F0EA' }, price: { kind: 'included' }, libraryId: 'ral-9016' },
        { id: 'ral7016', name: 'RAL 7016 Gris anthracite', visual: { type: 'color', hex: '#383E42' }, price: { kind: 'included' }, libraryId: 'ral-7016' },
        { id: 'ral3003', name: 'RAL 3003 Rouge rubis', visual: { type: 'color', hex: '#8D1D2C' }, price: { kind: 'percent', value: 10 }, libraryId: 'ral-3003' },
        { id: 'alpha', name: 'Métallique Alpha', visual: { type: 'color', hex: '#A5A9AD' }, price: { kind: 'percent', value: 20 }, isDefault: true, libraryId: 'met-alpha' },
      ],
    },
    {
      id: 'panels',
      title: 'Type de baie',
      subtitle: 'Le nombre de vantaux (choisit la grille de prix).',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'v2', name: '2 vantaux', visual: { type: 'window', panels: 2, opening: 'fold' }, price: { kind: 'included' }, panels: 2 },
        { id: 'v3', name: '3 vantaux', visual: { type: 'window', panels: 3, opening: 'fold' }, price: { kind: 'included' }, panels: 3, isDefault: true },
        { id: 'v4', name: '4 vantaux', visual: { type: 'window', panels: 4, opening: 'fold' }, price: { kind: 'included' }, panels: 4 },
      ],
    },
    {
      id: 'opening',
      title: 'Type d’ouverture',
      subtitle: 'Le sens de pliage des vantaux.',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'o321', name: 'Pliant-coulissant 321', visual: { type: 'window', panels: 3, opening: 'fold' }, price: { kind: 'included' }, isDefault: true },
        { id: 'o303', name: 'Pliant-coulissant 303', visual: { type: 'window', panels: 3, opening: 'fold' }, price: { kind: 'included' } },
        { id: 'o330', name: 'Pliant-coulissant 330', visual: { type: 'window', panels: 3, opening: 'fold' }, price: { kind: 'included' } },
      ],
    },
    { id: 'dimensions', title: 'Dimensions', subtitle: 'Largeur × hauteur hors tout, en mm.', kind: 'dimensions', enabled: true, options: [] },
    {
      id: 'glazing',
      title: 'Vitrage',
      subtitle: 'Isolation selon NF EN 673.',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'ug11', name: 'Double vitrage Ug 1,1', visual: { type: 'glazing', layers: 2 }, price: { kind: 'included' } },
        { id: 'ug07', name: 'Triple vitrage Ug 0,7', visual: { type: 'glazing', layers: 3 }, price: { kind: 'perM2', value: 43.08 }, isDefault: true, libraryId: 'glz-ug07' },
        { id: 'ug06', name: 'Triple vitrage Ug 0,6', visual: { type: 'glazing', layers: 3 }, price: { kind: 'perM2', value: 50.48 }, libraryId: 'glz-ug06' },
      ],
    },
    {
      id: 'shutter',
      title: 'Volet roulant',
      subtitle: 'Le caisson est compris dans la hauteur totale.',
      kind: 'toggle',
      enabled: true,
      options: [
        { id: 'non', name: 'Non', visual: { type: 'icon', name: 'none' }, price: { kind: 'included' }, isDefault: true },
        { id: 'oui', name: 'Oui', visual: { type: 'icon', name: 'shutter' }, price: { kind: 'fixed', value: 690 } },
      ],
    },
    {
      id: 'handle',
      title: 'Poignées',
      subtitle: 'Couleur et type de poignée.',
      kind: 'choice',
      enabled: true,
      options: [
        { id: 'standard', name: 'Poignée standard', description: 'Couleur argent.', visual: { type: 'icon', name: 'handle' }, price: { kind: 'included' }, isDefault: true, libraryId: 'hdl-standard' },
        { id: 'cle', name: 'Poignée condamnable à clé', visual: { type: 'icon', name: 'handle' }, price: { kind: 'fixed', value: 74.48 }, libraryId: 'hdl-cle' },
        { id: 'inox', name: 'Poignée design inox', visual: { type: 'icon', name: 'handle' }, price: { kind: 'fixed', value: 85.56 }, libraryId: 'hdl-inox' },
      ],
    },
    {
      id: 'extras',
      title: 'Accessoires',
      subtitle: 'Options complémentaires (plusieurs choix possibles).',
      kind: 'choice',
      enabled: true,
      multi: true,
      options: [
        { id: 'dormant', name: 'Élargissement du dormant', visual: { type: 'icon', name: 'frame' }, price: { kind: 'fixed', value: 65 } },
        { id: 'kit', name: 'Kit d’entretien', visual: { type: 'icon', name: 'kit' }, price: { kind: 'fixed', value: 28.48 }, libraryId: 'acc-kit' },
      ],
    },
  ];
}

function accordionRules(): Rule[] {
  return [
    { id: 'r1', enabled: true, when: { type: 'option', stepId: 'panels', optionId: 'v4' }, then: { type: 'hide', stepId: 'shutter', optionId: 'oui' }, note: 'Le volet roulant n’existe pas en 4 vantaux.' },
    { id: 'r2', enabled: true, when: { type: 'option', stepId: 'shutter', optionId: 'oui' }, then: { type: 'autoAdd', stepId: 'extras', optionId: 'dormant' }, note: 'Le volet roulant nécessite l’élargissement du dormant.' },
    { id: 'r3', enabled: true, when: { type: 'option', stepId: 'panels', optionId: 'v3' }, then: { type: 'limitWidth', min: 2010, max: 2760 }, note: 'Pour 3 vantaux, la largeur doit être entre 2010 et 2760 mm.' },
    { id: 'r4', enabled: true, when: { type: 'measure', field: 'altitude', op: 'gt', value: 800 }, then: { type: 'message', text: 'Au-dessus de 800 m d’altitude, nous recommandons une valve de dépressurisation et un vitrage trempé.' }, note: 'Message de recommandation au client.' },
    { id: 'r5', enabled: false, when: { type: 'option', stepId: 'wood', optionId: 'chene' }, then: { type: 'disable', stepId: 'profile', optionId: 'p68' }, note: 'Le profilé 68 mm n’est pas compatible avec le chêne.' },
    { id: 'r6', enabled: true, when: { type: 'measure', field: 'width', op: 'gt', value: 2700 }, then: { type: 'message', text: 'Pour une largeur supérieure à 2700 mm, un renfort supplémentaire est posé en usine.' }, note: 'Information pour les grandes dimensions.' },
  ];
}

const accordion: Product = {
  id: 'baie-accordeon-bois-alu',
  name: 'Baie accordéon Bois-Alu',
  family: 'Baies vitrées',
  description: 'Baie vitrée pliante sur mesure en bois et aluminium. Idéale pour les grandes ouvertures.',
  status: 'draft',
  visual: { type: 'window', panels: 3, opening: 'fold' },
  steps: accordionSteps(),
  grids: [
    makeGrid('g2', 2, range(1400, 2000, 100), range(1800, 2300, 100), 520),
    makeGrid('g3', 3, range(2000, 2800, 100), range(1800, 2300, 100), 780, [[2600, 1900], [2800, 2100], [2200, 2300]]),
    makeGrid('g4', 4, range(2600, 3600, 100), range(1800, 2300, 100), 1150),
  ],
  rules: accordionRules(),
  promotionId: 'promo-automne',
  configurationsCount: 42,
  updatedAt: '2026-10-17T10:24:00',
};

function derive(base: Product, patch: Partial<Product>, dropSteps: string[] = []): Product {
  const product: Product = {
    ...structuredClone(base),
    ...patch,
    steps: structuredClone(base.steps).filter((s) => !dropSteps.includes(s.id)),
  };
  // Keep only the panel counts that have a price grid.
  const panels = product.steps.find((s) => s.id === 'panels');
  if (panels) {
    panels.options = panels.options.filter((o) => product.grids.some((g) => g.panels === o.panels));
    panels.options.forEach((o, i) => (o.isDefault = i === 0));
  }
  return product;
}

export const products: Product[] = [
  accordion,
  derive(
    accordion,
    {
      id: 'smart-slide-pvc',
      name: 'Smart-Slide PVC',
      family: 'Baies vitrées',
      description: 'Baie coulissante PVC à mécanisme Smart-Slide, très facile à manœuvrer.',
      status: 'published',
      visual: { type: 'window', panels: 2, opening: 'slide' },
      grids: [makeGrid('g2', 2, range(1400, 2400, 100), range(1800, 2300, 100), -200), makeGrid('g3', 3, range(2000, 3000, 100), range(1800, 2300, 100), 100)],
      rules: [],
      promotionId: undefined,
      configurationsCount: 31,
      updatedAt: '2026-10-12T16:02:00',
    },
    ['wood', 'material'],
  ),
  derive(
    accordion,
    {
      id: 'coulissante-translation',
      name: 'Coulissante à translation',
      family: 'Baies vitrées',
      description: 'Le meilleur rapport qualité/prix, disponible dans les quatre matériaux.',
      status: 'published',
      visual: { type: 'window', panels: 2, opening: 'slide' },
      grids: [makeGrid('g2', 2, range(1400, 2400, 100), range(1800, 2300, 100), -500)],
      rules: [],
      promotionId: 'promo-automne',
      configurationsCount: 24,
      updatedAt: '2026-10-09T09:15:00',
    },
    ['opening'],
  ),
  derive(
    accordion,
    {
      id: 'fenetre-frappe',
      name: 'Fenêtre à frappe',
      family: 'Fenêtres',
      description: 'Fenêtre ouvrant à la française, oscillo-battante en option.',
      status: 'draft',
      visual: { type: 'window', panels: 2 },
      grids: [makeGrid('g2', 2, range(600, 1600, 100), range(600, 1600, 100), -1900, [[900, 1100], [1200, 1400]])],
      rules: [],
      promotionId: undefined,
      configurationsCount: 18,
      updatedAt: '2026-10-15T11:40:00',
    },
    ['opening', 'shutter'],
  ),
];

export const library: LibraryItem[] = [
  { id: 'ral-9016', category: 'colors', code: 'RAL 9016', name: 'Blanc trafic', visual: { type: 'color', hex: '#F1F0EA' }, price: { kind: 'included' }, usedIn: 12, hasImage: true },
  { id: 'ral-7016', category: 'colors', code: 'RAL 7016', name: 'Gris anthracite', visual: { type: 'color', hex: '#383E42' }, price: { kind: 'included' }, usedIn: 15, hasImage: true },
  { id: 'ral-3003', category: 'colors', code: 'RAL 3003', name: 'Rouge rubis', visual: { type: 'color', hex: '#8D1D2C' }, price: { kind: 'percent', value: 10 }, usedIn: 8, hasImage: true },
  { id: 'met-alpha', category: 'colors', code: 'Métallique', name: 'Alpha · gris métallisé', visual: { type: 'color', hex: '#A5A9AD' }, price: { kind: 'percent', value: 20 }, usedIn: 7, hasImage: true },
  { id: 'ral-9005', category: 'colors', code: 'RAL 9005', name: 'Noir profond', visual: { type: 'color', hex: '#0E0E10' }, price: { kind: 'percent', value: 10 }, usedIn: 6, hasImage: true },
  { id: 'ral-1015', category: 'colors', code: 'RAL 1015', name: 'Ivoire clair', visual: { type: 'color', hex: '#E6D2B5' }, price: { kind: 'percent', value: 10 }, usedIn: 5, hasImage: true },
  { id: 'ral-6005', category: 'colors', code: 'RAL 6005', name: 'Vert mousse', visual: { type: 'color', hex: '#0F4336' }, price: { kind: 'percent', value: 10 }, usedIn: 4, hasImage: true },
  { id: 'ral-5003', category: 'colors', code: 'RAL 5003', name: 'Bleu saphir', visual: { type: 'color', hex: '#1F3855' }, price: { kind: 'percent', value: 10 }, usedIn: 4, hasImage: true },
  { id: 'ral-8017', category: 'colors', code: 'RAL 8017', name: 'Brun chocolat', visual: { type: 'color', hex: '#44322D' }, price: { kind: 'percent', value: 10 }, usedIn: 3, hasImage: true },
  { id: 'ral-7040', category: 'colors', code: 'RAL 7040', name: 'Gris fenêtre', visual: { type: 'color', hex: '#9DA3A6' }, price: { kind: 'percent', value: 10 }, usedIn: 3, hasImage: true },
  { id: 'wood-pin', category: 'woods', name: 'Pin', visual: { type: 'wood', tone: WOOD.pin }, price: { kind: 'included' }, usedIn: 3, hasImage: true },
  { id: 'wood-sapin', category: 'woods', name: 'Sapin', visual: { type: 'wood', tone: WOOD.sapin }, price: { kind: 'percent', value: 10 }, usedIn: 3, hasImage: true },
  { id: 'wood-meranti', category: 'woods', name: 'Meranti', visual: { type: 'wood', tone: WOOD.meranti }, price: { kind: 'percent', value: 20 }, usedIn: 2, hasImage: true },
  { id: 'wood-eucalyptus', category: 'woods', name: 'Eucalyptus', visual: { type: 'wood', tone: WOOD.eucalyptus }, price: { kind: 'percent', value: 40 }, usedIn: 2, hasImage: true },
  { id: 'wood-chene', category: 'woods', name: 'Chêne', visual: { type: 'wood', tone: WOOD.chene }, price: { kind: 'percent', value: 50 }, usedIn: 2, hasImage: true },
  { id: 'wood-meleze', category: 'woods', name: 'Mélèze', visual: { type: 'wood', tone: WOOD.meleze }, price: { kind: 'percent', value: 50 }, usedIn: 1, hasImage: true },
  { id: 'glz-ug07', category: 'glazing', name: 'Triple vitrage Ug 0,7', visual: { type: 'glazing', layers: 3 }, price: { kind: 'perM2', value: 43.08 }, usedIn: 9, hasImage: true },
  { id: 'glz-ug06', category: 'glazing', name: 'Triple vitrage Ug 0,6', visual: { type: 'glazing', layers: 3 }, price: { kind: 'perM2', value: 50.48 }, usedIn: 6, hasImage: true },
  { id: 'hdl-standard', category: 'handles', name: 'Poignée standard', description: 'Couleur argent', visual: { type: 'icon', name: 'handle' }, price: { kind: 'included' }, usedIn: 14, hasImage: true },
  { id: 'hdl-cle', category: 'handles', name: 'Poignée condamnable à clé', visual: { type: 'icon', name: 'handle' }, price: { kind: 'fixed', value: 74.48 }, usedIn: 9, hasImage: true },
  { id: 'hdl-inox', category: 'handles', name: 'Poignée design inox', visual: { type: 'icon', name: 'handle' }, price: { kind: 'fixed', value: 85.56 }, usedIn: 5, hasImage: false },
  { id: 'hw-base', category: 'hardware', name: 'Sécurité de base', visual: { type: 'icon', name: 'frame' }, price: { kind: 'included' }, usedIn: 14, hasImage: true },
  { id: 'acc-kit', category: 'accessories', name: 'Kit d’entretien', visual: { type: 'icon', name: 'kit' }, price: { kind: 'fixed', value: 28.48 }, usedIn: 11, hasImage: true },
];

// ---------- Orders: priced by the engine, then frozen as a snapshot ----------

function priced(product: Product, patch: Partial<Configuration> & { pick?: Record<string, string[]> }) {
  const base = defaultConfiguration(product);
  const config: Configuration = {
    ...base,
    ...patch,
    selections: { ...base.selections, ...(patch.pick ?? {}) },
  };
  const q = computeQuote(product, config, promotions);
  return { configuration: config, snapshot: { lines: q.lines, subtotal: q.subtotal, discount: q.discount, total: q.total, promotion: q.promotion } };
}

const people: Array<[string, string, OrderStatus, string, number, Partial<Configuration> & { pick?: Record<string, string[]> }]> = [
  ['Sophie Martin', 'Paris (75011)', 'new', '2026-10-15T14:32', 0, {}],
  ['Ahmed Benali', 'Lyon (69003)', 'production', '2026-10-15T09:10', 2, { width: 2000, height: 2100 }],
  ['Julie Bernard', 'Bordeaux (33000)', 'manufacturing', '2026-10-14T17:45', 1, { width: 2200, height: 2000 }],
  ['Karim El Amrani', 'Marseille (13008)', 'shipped', '2026-10-14T11:02', 3, { width: 1200, height: 1300, pick: { panels: ['v2'] } }],
  ['Nadia Rossi', 'Nice (06000)', 'delivered', '2026-10-13T15:20', 0, { width: 2700, pick: { wood: ['chene'], glazing: ['ug06'] } }],
  ['Thomas Dubois', 'Nantes (44000)', 'delivered', '2026-10-12T10:05', 2, { width: 2300, height: 2200 }],
  ['Leila Haddad', 'Toulouse (31000)', 'production', '2026-10-12T08:48', 1, { width: 2400, height: 2200 }],
  ['Marc Petit', 'Lille (59000)', 'delivered', '2026-10-11T16:30', 3, { width: 1000, height: 1200, pick: { panels: ['v2'] } }],
  ['Émilie Laurent', 'Rennes (35000)', 'manufacturing', '2026-10-11T13:12', 0, { width: 2600, height: 2100, pick: { wood: ['meranti'] } }],
  ['Rachid Amine', 'Strasbourg (67000)', 'delivered', '2026-10-10T09:55', 2, { width: 2100, height: 2000 }],
];

export const orders: Order[] = people.map(([name, city, status, date, productIndex, patch], i) => {
  const product = products[productIndex];
  const p = priced(product, patch);
  return {
    id: `CMD-2026-${String(152 - i).padStart(4, '0')}`,
    date,
    customer: {
      name,
      city,
      email: `${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.')}@exemple.fr`,
      phone: '+33 6 12 34 56 78',
      address: `12 rue des Lauriers, ${city}`,
    },
    productId: product.id,
    productName: product.name,
    status,
    ...p,
  };
});

export const dashboardStats = {
  ordersToday: 8,
  ordersYesterday: 6,
  revenueMonth: 48371,
  revenueLastMonth: 43180,
  averageCart: 4837,
  abandoned: 27,
  dailyOrders: [4, 6, 3, 7, 12, 5, 8, 4, 9, 6, 7, 10, 13, 5, 6, 8, 11, 7, 6, 9, 17, 8, 14, 6, 9, 11, 7, 15, 10, 8, 12],
};
