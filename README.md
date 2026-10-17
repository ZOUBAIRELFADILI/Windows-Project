# Fenêtres Pro — made-to-measure windows configurator

E-commerce for made-to-measure windows and bay windows ("sur mesure"): the customer configures the product step by step and the price is calculated automatically.

## Repository layout

```
.
├── admin/          ← Admin panel (React + TypeScript + Vite + Tailwind) — clickable mockup with a real price engine
├── design/
│   ├── DESIGN.md   ← Design system (colors, typography, components) exported from Google Stitch
│   └── stitch/     ← Original Stitch exports (static HTML + screenshot per screen), kept as reference
└── README.md
```

Planned next to `admin/`: `shop/` (customer configurator) and `api/` (backend). The price engine in
`admin/src/lib/pricing.ts` is written to be shared with them — the backend must recompute every price at checkout.

## Run the admin panel

Requirements: Node.js 18+.

```bash
cd admin
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm test           # unit tests of the price + rules engines
npm run typecheck
npm run build      # production build in admin/dist
```

See [`admin/README.md`](admin/README.md) for the architecture.
