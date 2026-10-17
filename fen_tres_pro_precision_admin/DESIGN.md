---
name: Fenêtres Pro Precision Admin
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  code:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system is engineered for high-precision B2B manufacturing, configuration, and order administration. It conveys authority, operational efficiency, and deep architectural clarity. The experience caters to technical product managers, fabricators, and administrative staff managing intricate multi-variant physical products (custom joinery, windows, sliding glass bays).

The design aesthetic combines **Corporate Modern** with **Technical Precision Minimalist**:
- High structure and information density without visual chaos.
- High-contrast visual anchoring using a dark slate sidebar (`#0F172A`) against an airy, soft-slate work canvas (`#F8FAFC`).
- High utility with immediate feedback: vibrant actionable accents, real-time live preview framing (desktop, tablet, mobile viewports), clear step sequencing, and granular status badges.
- Strict visual hierarchy through sharp contrast, micro-borders, clean alignment, and subtle ambient lift rather than aggressive shadows.

## Colors

The palette leverages a precise functional role distribution designed for long working hours and low eye fatigue, while maintaining pinpoint clarity for actions and statuses:

- **Primary (`#2563EB`)**: Used exclusively for top-tier calls-to-action ("Publier", "Nouvelle commande", "Étape suivante"), active navigation items, selected interactive states, and active tab highlights.
- **Secondary (`#0F172A`)**: Anchor tone dedicated to the persistent navigation rail, primary headlines, active stepper items, and dark UI foundations.
- **Tertiary (`#10B981`)**: Positive confirmation, saved states, growth percentages, and completed milestones ("Complète", "Livrée", "En ligne").
- **Neutral (`#64748B`)**: Secondary text, subtle metadata, step numbering, inactive icons, and structural boundaries.

### Semantic Status & Badge Tokens
- **Brouillon / Draft**: Text `#059669`, background `#ECFDF5`, border `#A7F3D0` (or subtle slate badge `#F1F5F9` / `#475569`).
- **Nouvelle / Info**: Text `#1D4ED8`, background `#EFF6FF`, border `#BFDBFE`.
- **En production / Processing**: Text `#D97706`, background `#FFFBEB`, border `#FDE68A`.
- **En fabrication**: Text `#7C3AED`, background `#F5F3FF`, border `#DDD6FE`.
- **Expédiée / Livrée**: Text `#059669`, background `#ECFDF5`, border `#A7F3D0`.
- **Alerte / Conflit**: Text `#DC2626`, background `#FEF2F2`, border `#FECACA`.

### Surfaces & Borders
- **App Canvas**: `#F8FAFC`
- **Surface Card**: `#FFFFFF`
- **Surface Muted / Hover**: `#F1F5F9`
- **Surface Sidebar**: `#0F172A`
- **Surface Sidebar Active Item**: `#2563EB`
- **Card & Divider Border**: `#E2E8F0`
- **Input Border**: `#CBD5E1`

## Typography

The typography is built around **Inter**, optimized for screen legibility at high data densities, tabular layouts, and multi-tier administrative configurations.

- **Numbers & Metrics**: Tabular figures (`font-variant-numeric: tabular-nums`) must be enforced across all pricing tables, dimensions, statistics badges, and order rows to prevent layout jitter on live updates.
- **Heirarchy Guidelines**:
  - `display-lg`: Dashboard KPI totals and master view titles (`30px / 700`).
  - `headline-lg`: Top page headers ("Baie accordéon Bois-Alu", "Commandes").
  - `headline-md`: Card module titles and step headers ("1. Informations générales", "3. Choisissez le profilé").
  - `body-md`: Standard configuration descriptions, table cells, form labels.
  - `label-md` / `label-sm`: Status pills, stepper counters, table header tags, and form micro-hints.

## Layout & Spacing

The layout model is organized around a dual-pane administrative master-detail workflow with a persistent sidebar:

- **Sidebar Rail**: Fixed 260px width on desktop (`#0F172A`), collapsible to 72px icon-rail on intermediate views, hidden off-canvas on mobile viewports.
- **Main Canvas**: Fluid horizontal area with a standard 32px (`margin`) outer padding, conforming to a structured 12-column grid or dual/triple split panes (e.g. 60% Form builder / 40% Live client configurator preview).
- **Split Views & Drawers**:
  - **Left / Center Pane**: Form controls, steps lists, and option tiles spaced with `space-lg` (24px) container gaps.
  - **Right Pane**: Fixed or sticky interactive client preview container (sticky top: 24px) providing real-time visual output of chosen configurations.
  - **Right-Hand Slide Drawers**: 480px width for quick editing of sub-options, parameter sets, and rule definitions without leaving the master context.
- **Adaptive Breakpoints**:
  - `Desktop (> 1280px)`: Sidebar + Configuration Columns + Interactive Device Preview frame.
  - `Tablet (768px - 1279px)`: Sidebar collapses to 72px; Configurator and Preview stack into segmented tabs or vertical arrangements.
  - `Mobile (< 768px)`: Single column flow; preview available via top modal action button ("Aperçu").

## Elevation & Depth

Visual hierarchy avoids heavy drop shadows, relying instead on clean surface tints, hairline borders (`#E2E8F0`), and gentle ambient diffusion.

- **Level 0 (Base Canvas)**: `#F8FAFC`, flat.
- **Level 1 (Cards, Form Containers, Config Sections)**: Background `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Active Tiles, Hover States, Dropdowns)**: Background `#FFFFFF`, border `1px solid #CBD5E1` (or `#2563EB` if selected), shadow `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Modals, Slide-over Drawers, Floating Bars)**: Background `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`. Backdrop overlay: `#0F172A` at 40% opacity with `backdrop-filter: blur(4px)`.
- **Selected Element Outline**: High-contrast blue highlight: border `2px solid #2563EB`, background tinted with `#EFF6FF` on hover/selection.

## Shapes

The interface balances sharp industrial precision with modern software ergonomics:
- **Base Rounding (0.5rem / 8px)**: Used for buttons, text input fields, status chips, option cards, table containers, and step indicator nodes.
- **Large Containers (1rem / 16px)**: Used for primary application cards, interactive preview mockups, drawer panels, and modal dialogues.
- **Full Pill (`9999px`)**: Used strictly for numbered circular indicators (`w-6 h-6` or `w-8 h-8`), segmented device switchers (Mobile/Tablet/Desktop), and status dot tags.

## Components

### Buttons
- **Primary**: Solid `#2563EB`, text `#FFFFFF`, rounded 8px, font-weight 600. Hover: `#1D4ED8`. Active: `#1E40AF`. Focus: ring 2px `#93C5FD`.
- **Secondary / Outline**: Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#1E293B`. Hover: `#F8FAFC` and border `#CBD5E1`.
- **Destructive**: Background `#FEF2F2`, border `1px solid #FEE2E2`, text `#DC2626`. Hover: `#FEE2E2`.
- **Dark Utility (Top Bar Preview)**: Background `#0F172A`, text `#FFFFFF`. Hover: `#1E293B`.

### Option Selection Cards
- Square or 4:3 aspect ratio product asset container with a subtle gray surface `#F8FAFC`.
- Default: Border `1px solid #E2E8F0`, padding 12px, rounded 8px.
- Selected: Border `2px solid #2563EB`, top-right badge checkmark icon with blue circle background (`#2563EB`) and white check.
- Content: Thumbnail image, bold title (`14px`), price modification pill (`+ 10 %`, `+ 80 € / m²` or `Inclus`), and three-dot context trigger.

### Status Badges & Chips
- Padding: `2px 8px`, rounded `9999px` (pill), text size `11px - 12px`, font-weight 600.
- Variants:
  - *Brouillon*: Soft green or slate pill with small colored dot (`#059669`).
  - *En production*: Yellow/Amber (`#FFFBEB`, text `#B45309`, border `#FDE68A`).
  - *Nouvelle*: Soft blue (`#EFF6FF`, text `#1D4ED8`, border `#BFDBFE`).
  - *Livrée*: Emerald (`#ECFDF5`, text `#047857`, border `#A7F3D0`).

### Form Controls & Inputs
- Height: 40px for single inputs, rounded 8px.
- Border: `1px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`.
- Focus state: Border `#2563EB`, box-shadow `0 0 0 3px rgba(37, 99, 235, 0.15)`.
- Helper label: `12px` neutral `#64748B`, positioned below the input (`Ex. : Baie accordéon Bois-Alu`).

### Reorderable Step List Items
- Container: Background `#FFFFFF`, border `1px solid #E2E8F0`, padding `10px 16px`, rounded 8px.
- Layout: Left drag handle icon (`#94A3B8`), circular step index (`1, 2, 3...`), thumbnail preview, step title, right-aligned status indicator (check in green, alert triangle in orange), and slide-toggle switch.

### Interactive Preview Frame
- Container with light gray header containing a segmented device switch (`Ordinateur`, `Tablette`, `Mobile`).
- Realistic phone chassis wrapper option (`w-[360px]`, rounded `36px`, border `8px solid #0F172A`) or full-bleed desktop canvas simulating the customer-facing configurator step-by-step UI with live calculated totals (`TTC`).

### Drawers & Modals
- Slide-over Right Drawer: Anchored to viewport right, width 480px–560px, header with dismiss `X`, divided content zones, and fixed bottom action bar containing "Annuler" and "Enregistrer les modifications".