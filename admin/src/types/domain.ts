/**
 * Domain model for the made-to-measure configurator.
 * The same types will be shared with the backend API later.
 */

/** How an option changes the price. Plain-language labels live in `lib/labels.ts`. */
export type PriceRule =
  | { kind: 'included' }
  | { kind: 'percent'; value: number } // % of the grid base price
  | { kind: 'fixed'; value: number } // € per product
  | { kind: 'perM2'; value: number }; // € × surface (m²)

/** What the customer sees on the option card. Rendered locally, no external images. */
export type Visual =
  | { type: 'color'; hex: string }
  | { type: 'wood'; tone: string }
  | { type: 'window'; panels: number; opening?: 'fold' | 'slide' }
  | { type: 'glazing'; layers: 2 | 3 }
  | { type: 'icon'; name: 'handle' | 'shutter' | 'kit' | 'frame' | 'none' | 'profile' | 'material' };

export interface Option {
  id: string;
  name: string;
  description?: string;
  visual: Visual;
  price: PriceRule;
  isDefault?: boolean;
  promo?: boolean;
  /** Set when the option comes from the shared library; the price can still be overridden per product. */
  libraryId?: string;
  /** For "panels" options: which price grid to use. */
  panels?: number;
}

export type StepKind = 'choice' | 'toggle' | 'dimensions';

export interface Step {
  id: string;
  title: string;
  subtitle: string;
  kind: StepKind;
  enabled: boolean;
  multi?: boolean;
  options: Option[];
}

export interface PriceGrid {
  id: string;
  label: string;
  panels: number;
  widths: number[]; // mm, ascending
  heights: number[]; // mm, ascending
  /** prices[heightIndex][widthIndex]; null = missing price */
  prices: (number | null)[][];
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export type RuleCondition =
  | { type: 'option'; stepId: string; optionId: string }
  | { type: 'measure'; field: 'width' | 'height' | 'altitude'; op: 'gt' | 'lt'; value: number };

export type RuleAction =
  | { type: 'hide' | 'disable' | 'require' | 'autoAdd'; stepId: string; optionId: string }
  | { type: 'limitWidth'; min: number; max: number }
  | { type: 'message'; text: string };

export interface Rule {
  id: string;
  enabled: boolean;
  when: RuleCondition;
  then: RuleAction;
  note: string;
}

export interface Promotion {
  id: string;
  label: string;
  percent: number;
  active: boolean;
}

export type ProductStatus = 'draft' | 'published';

export interface Product {
  id: string;
  name: string;
  family: string;
  description: string;
  status: ProductStatus;
  visual: Visual;
  steps: Step[];
  grids: PriceGrid[];
  rules: Rule[];
  promotionId?: string;
  configurationsCount: number;
  updatedAt: string;
}

/** A customer's configuration: selected option ids per step + measures. */
export interface Configuration {
  selections: Record<string, string[]>;
  width: number;
  height: number;
  altitude: number;
}

export type OrderStatus = 'new' | 'production' | 'manufacturing' | 'shipped' | 'delivered';

export interface PriceLine {
  label: string;
  detail: string;
  amount: number;
  visual?: Visual;
}

export interface Order {
  id: string;
  date: string;
  customer: { name: string; city: string; email: string; phone: string; address: string };
  productId: string;
  productName: string;
  status: OrderStatus;
  configuration?: Configuration;
  /** Price frozen at order time — later price changes never alter past orders. */
  snapshot: { lines: PriceLine[]; subtotal: number; discount: number; total: number; promotion?: Promotion };
}

export type LibraryCategory = 'colors' | 'woods' | 'glazing' | 'handles' | 'hardware' | 'accessories';

export interface LibraryItem {
  id: string;
  category: LibraryCategory;
  code?: string;
  name: string;
  description?: string;
  visual: Visual;
  price: PriceRule;
  usedIn: number;
  hasImage: boolean;
}
