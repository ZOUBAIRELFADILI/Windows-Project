/**
 * App state for the mockup: a single reducer + context, persisted in localStorage.
 * When the backend exists, each action becomes an API call (see src/services/api.ts).
 */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { LibraryItem, Option, Order, OrderStatus, Product, Promotion, Rule } from '@/types/domain';
import * as mock from '@/data/mock';
import { fillMissing } from '@/lib/pricing';

interface State {
  products: Product[];
  library: LibraryItem[];
  orders: Order[];
  promotions: Promotion[];
}

type Action =
  | { type: 'option/save'; productId: string; stepId: string; option: Option }
  | { type: 'option/remove'; productId: string; stepId: string; optionId: string }
  | { type: 'step/toggle'; productId: string; stepId: string }
  | { type: 'step/move'; productId: string; stepId: string; dir: -1 | 1 }
  | { type: 'grid/cell'; productId: string; gridId: string; hi: number; wi: number; value: number | null }
  | { type: 'grid/increase'; productId: string; gridId: string; percent: number }
  | { type: 'grid/fill'; productId: string; gridId: string }
  | { type: 'rule/toggle'; productId: string; ruleId: string }
  | { type: 'rule/add'; productId: string; rule: Rule }
  | { type: 'product/create'; product: Product }
  | { type: 'product/publish'; productId: string }
  | { type: 'library/save'; item: LibraryItem }
  | { type: 'library/bulkPrice'; ids: string[]; percent: number }
  | { type: 'order/status'; orderId: string; status: OrderStatus }
  | { type: 'reset' };

const STORAGE_KEY = 'fenetres-pro-admin:v2';

const initialState = (): State => ({
  products: structuredClone(mock.products),
  library: structuredClone(mock.library),
  orders: structuredClone(mock.orders),
  promotions: structuredClone(mock.promotions),
});

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    /* storage unavailable: fall back to demo data */
  }
  return initialState();
}

const touch = (p: Product): Product => ({ ...p, updatedAt: new Date().toISOString(), status: p.status });

function mapProduct(state: State, id: string, fn: (p: Product) => Product): State {
  return { ...state, products: state.products.map((p) => (p.id === id ? touch(fn(p)) : p)) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'option/save':
      return mapProduct(state, action.productId, (p) => ({
        ...p,
        steps: p.steps.map((s) => {
          if (s.id !== action.stepId) return s;
          const exists = s.options.some((o) => o.id === action.option.id);
          let options = exists
            ? s.options.map((o) => (o.id === action.option.id ? action.option : o))
            : [...s.options, action.option];
          if (action.option.isDefault && !s.multi) {
            options = options.map((o) => ({ ...o, isDefault: o.id === action.option.id }));
          }
          return { ...s, options };
        }),
      }));
    case 'option/remove':
      return mapProduct(state, action.productId, (p) => ({
        ...p,
        steps: p.steps.map((s) => (s.id === action.stepId ? { ...s, options: s.options.filter((o) => o.id !== action.optionId) } : s)),
      }));
    case 'step/toggle':
      return mapProduct(state, action.productId, (p) => ({
        ...p,
        steps: p.steps.map((s) => (s.id === action.stepId ? { ...s, enabled: !s.enabled } : s)),
      }));
    case 'step/move':
      return mapProduct(state, action.productId, (p) => {
        const steps = [...p.steps];
        const i = steps.findIndex((s) => s.id === action.stepId);
        const j = i + action.dir;
        if (i < 0 || j < 0 || j >= steps.length) return p;
        [steps[i], steps[j]] = [steps[j], steps[i]];
        return { ...p, steps };
      });
    case 'grid/cell':
      return mapProduct(state, action.productId, (p) => ({
        ...p,
        grids: p.grids.map((g) =>
          g.id === action.gridId
            ? { ...g, prices: g.prices.map((row, hi) => row.map((v, wi) => (hi === action.hi && wi === action.wi ? action.value : v))) }
            : g,
        ),
      }));
    case 'grid/increase':
      return mapProduct(state, action.productId, (p) => ({
        ...p,
        grids: p.grids.map((g) =>
          g.id === action.gridId
            ? { ...g, prices: g.prices.map((row) => row.map((v) => (v == null ? v : Math.round((v * (1 + action.percent / 100)) / 10) * 10))) }
            : g,
        ),
      }));
    case 'grid/fill':
      return mapProduct(state, action.productId, (p) => ({
        ...p,
        grids: p.grids.map((g) => (g.id === action.gridId ? fillMissing(g) : g)),
      }));
    case 'rule/toggle':
      return mapProduct(state, action.productId, (p) => ({
        ...p,
        rules: p.rules.map((r) => (r.id === action.ruleId ? { ...r, enabled: !r.enabled } : r)),
      }));
    case 'rule/add':
      return mapProduct(state, action.productId, (p) => ({ ...p, rules: [...p.rules, action.rule] }));
    case 'product/create':
      return { ...state, products: [action.product, ...state.products] };
    case 'product/publish':
      return { ...state, products: state.products.map((p) => (p.id === action.productId ? { ...p, status: 'published' } : p)) };
    case 'library/save':
      return { ...state, library: state.library.map((i) => (i.id === action.item.id ? action.item : i)) };
    case 'library/bulkPrice':
      return {
        ...state,
        library: state.library.map((i) => {
          if (!action.ids.includes(i.id) || i.price.kind === 'included') return i;
          const v = i.price.value;
          const next = i.price.kind === 'percent' ? Math.round(v * (1 + action.percent / 100)) : Math.round(v * (1 + action.percent / 100) * 100) / 100;
          return { ...i, price: { ...i.price, value: next } };
        }),
      };
    case 'order/status':
      return { ...state, orders: state.orders.map((o) => (o.id === action.orderId ? { ...o, status: action.status } : o)) };
    case 'reset':
      return initialState();
  }
}

interface Store extends State {
  dispatch: React.Dispatch<Action>;
  getProduct: (id: string) => Product | undefined;
}

const AdminContext = createContext<Store | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
  }, [state]);

  const value = useMemo<Store>(
    () => ({ ...state, dispatch, getProduct: (id) => state.products.find((p) => p.id === id) }),
    [state],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): Store {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminStoreProvider>');
  return ctx;
}
