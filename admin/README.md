# Admin panel — Ouvria

Clickable mockup of the admin space. No backend yet: demo data lives in `src/data/mock.ts`, and every change you
make is kept in your browser (localStorage). **Paramètres → Réinitialiser** restores the demo data.

The pricing and rules logic is **real** and unit-tested, so every screen (editor preview, test screen, orders,
AI assistant) shows the same numbers.

## Screens

| Route | Screen |
|---|---|
| `/` | Dashboard: "Mon premier produit" checklist, KPIs, tasks with direct links |
| `/produits` | Products with a readiness score + "Créer un produit" 5-step wizard |
| `/produits/:id?onglet=etapes` | Steps & options: step list, option cards, edit drawer, live customer preview |
| `/produits/:id?onglet=prix` | Price grids width × height: heatmap, edit cells, paste from Excel, +X %, fill empty cells, test a size |
| `/produits/:id?onglet=regles` | Rules written as sentences, conflict detection, rule tester, rule builder |
| `/produits/:id?onglet=tester` | Test as a customer, line-by-line price, warnings |
| `/bibliotheque` | Shared option library, bulk price change |
| `/commandes/:id` | Orders + technical sheet + price snapshot frozen at order time |
| `/promotions`, `/parametres` | Promotions, demo reset, replay the guided tour |

Also: AI assistant side panel (proposes changes, a human validates), first-visit guided tour, "Aide" help on each page.

## Folder structure

```
src/
├── app/                 App root + routes (router.tsx)
├── components/
│   ├── layout/          Sidebar, Topbar, PageHeader, AppLayout
│   ├── ui/              Design-system primitives: Button, Badge, Card, Drawer, Modal, Tabs, Toggle, Field…
│   └── visuals/         Local illustrations (window drawing, colour/wood swatches) — no external images
├── features/            One folder per business area; each owns its pages and components
│   ├── dashboard/
│   ├── products/
│   │   ├── ProductsPage.tsx, CreateProductWizard.tsx
│   │   └── editor/      ProductEditorPage + StepsTab, PricingTab, RulesTab, TestTab, OptionDrawer…
│   ├── library/
│   ├── orders/
│   ├── promotions/
│   ├── assistant/       AI panel (scripted for the mockup)
│   ├── onboarding/      Guided tour, help content, "Aide" button
│   └── misc/            Settings, 404
├── lib/                 Pure logic, no React — pricing.ts, rules.ts, completeness.ts, format.ts (+ tests)
├── store/               AdminStore (data, reducer) and UiStore (panels, toasts)
├── data/mock.ts         Demo data — to be replaced by API calls
├── types/domain.ts      Domain model shared by everything
└── styles/index.css
```

Rules followed:

- **Feature folders**: code that changes together lives together. A screen never imports from another feature's
  internals, except shared building blocks (`PriceSummary` is reused by Orders).
- **Logic out of components**: `lib/` is pure TypeScript, testable without a browser and reusable by the backend.
- **One source of truth for types**: `types/domain.ts`.
- **State through actions**: every change is a reducer action (`option/save`, `grid/cell`, `rule/toggle`…). When
  the API exists, each action becomes an API call; the screens don't change.

## How the price is calculated (`src/lib/pricing.ts`)

```
base      = grid[panels](width, height)          // rounded UP to the next grid step
+ percent options  = base × %                    // profile, wood, special colours
+ fixed options    = € per product               // handles, shutter, kit
+ per m² options   = €/m² × (width × height)     // glazing
= subtotal − promotion % = total TTC
```

Rules (`src/lib/rules.ts`) can hide, disable, require or auto-add an option, limit the width, or show a message.

> Note: the numbers in the Stitch mockups didn't add up (their lines summed to 9 722,94 € but showed 9 848,47 €).
> Here every total is computed by the engine: the reference configuration gives **8 264,50 € TTC**.

## Next steps toward production

1. API (products, options, grids, rules, orders) — move `lib/pricing.ts` + `lib/rules.ts` to a shared package.
2. Replace `data/mock.ts` + localStorage with API calls (e.g. TanStack Query) in `src/services/`.
3. Authentication + roles (an employee prepares drafts, the owner publishes prices).
4. Real image upload for options, real Excel import.
5. Plug the AI assistant into an LLM with tool calling against the admin API (it proposes, a human validates).
