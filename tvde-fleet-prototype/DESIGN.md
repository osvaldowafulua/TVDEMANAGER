# TVDE Fleet — Design System

## Color (OKLCH)

### Light Theme (Admin Default)
- **Background**: `oklch(0.98 0.003 250)` — near-white tinted cool
- **Surface**: `oklch(1 0 0)` — pure white
- **Surface-2**: `oklch(0.97 0.003 250)` — subtle tint
- **Border**: `oklch(0.9 0.005 250)`
- **Text**: `oklch(0.15 0.005 250)` — near-black tinted
- **Muted**: `oklch(0.5 0.01 250)`
- **Muted-2**: `oklch(0.65 0.01 250)`

### Dark Theme (User Panel Default — night driving context)
- **Background**: `oklch(0.08 0.005 250)`
- **Surface**: `oklch(0.11 0.005 250)`
- **Surface-2**: `oklch(0.14 0.005 250)`
- **Border**: `oklch(0.22 0.005 250)`
- **Text**: `oklch(0.95 0.003 250)`
- **Muted**: `oklch(0.6 0.01 250)`
- **Muted-2**: `oklch(0.45 0.01 250)`

### Accent (Single — Emerald)
- **Primary**: `oklch(0.52 0.18 160)` — used ≤10% surface (Restrained strategy)
- **Primary-hover**: `oklch(0.46 0.18 160)`
- **Primary-bg**: `oklch(0.93 0.05 160)` / `oklch(0.18 0.05 160)` dark

### Semantic
- **Success**: `oklch(0.55 0.15 150)`
- **Warning**: `oklch(0.65 0.18 85)`
- **Danger**: `oklch(0.55 0.2 25)`
- **Info**: `oklch(0.55 0.15 240)`

## Typography
- **Display/UI**: `Geist Variable` (wght 400-800) — headlines, numbers, UI labels
- **Mono**: `Geist Mono Variable` — tabular numbers, VIN, IBAN, matrículas, código
- **Scale** (clamp-based, fluid):
  - `--text-xs`: `clamp(0.7rem, 0.68rem + 0.1vw, 0.75rem)` — 11/12px
  - `--text-sm`: `clamp(0.8125rem, 0.78rem + 0.16vw, 0.875rem)` — 13/14px
  - `--text-base`: `clamp(0.9375rem, 0.89rem + 0.24vw, 1rem)` — 15/16px
  - `--text-lg`: `clamp(1.0625rem, 1rem + 0.32vw, 1.125rem)` — 17/18px
  - `--text-xl`: `clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)` — 20/24px
  - `--text-2xl`: `clamp(1.5rem, 1.35rem + 0.75vw, 2rem)` — 24/32px
  - `--text-3xl`: `clamp(2rem, 1.7rem + 1.5vw, 3rem)` — 32/48px
- **Line lengths**: Body ≤65ch; Tables use tabular-nums

## Spacing & Rhythm
- **Base unit**: 4px (`--space-1`)
- **Scale**: 1–24 (4–96px) — use consistently
- **Section gap**: `--space-10` (40px) mobile / `--space-14` (56px) desktop
- **Card padding**: `--space-6` (24px) — never nest cards
- **Grid gap**: `--space-6` (24px)

## Elevation
- **Level 0**: none
- **Level 1**: `0 1px 2px oklch(0.15 0.005 250 / 0.05)` — subtle separation
- **Level 2**: `0 8px 30px oklch(0.15 0.005 250 / 0.08)` — modals, dropdowns
- **Level 3**: `0 20px 60px oklch(0.15 0.005 250 / 0.15)` — overlays
- **Inner refraction** (glass): `inset 0 1px 0 oklch(1 0 0 / 0.1)`, `border: 1px solid oklch(1 0 0 / 0.08)`

## Radius
- `--radius-sm`: 6px — inputs, badges
- `--radius-md`: 10px — buttons, cards
- `--radius-lg`: 16px — panels, modals
- `--radius-xl`: 24px — major containers

## Motion
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- **Duration**: 150ms (micro), 250ms (standard), 350ms (macro)
- **No bounce, no elastic**
- **Reduced motion**: respect `prefers-reduced-motion`

## Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1440px

## Component Conventions
- **Buttons**: `height: 40px` (mobile 44px), `padding: 0 16px`, `font-weight: 500`, `gap: 8px`
- **Inputs**: `height: 44px`, `padding: 0 12px`, `border: 1px solid var(--border)`, `background: var(--surface)`
- **Tables**: `divide-y` only, no card wrapper. Sticky header on scroll.
- **Badges**: `font-size: var(--text-xs)`, `font-weight: 600`, `padding: 2px 8px`, `border-radius: var(--radius-sm)`
- **Avatars**: 32px (sm), 40px (md), 56px (lg) — initials fallback, no generic user icon
- **Icons**: Phosphor Icons, `stroke-width: 1.5`, `size: 18px` (default), `20px` (nav), `24px` (feature)

## Layout
- **Admin**: Fixed sidebar (250px) + fluid main. Max content width 1400px centered.
- **User Panel**: Single column, stacked sections. Bottom nav on mobile (<768px).
- **No hero-metric template**. No 3-col card grids. Use asymmetric bento or data tables.

## Icons
`@phosphor-icons/react` — `weight: "light"` default, `"fill"` for active states, `"bold"` for emphasis.

## Images
- Vehicle illustrations: SVG in `/public/vehicles/`
- User uploads: Object URLs (session only), max 10MB, JPEG/PNG/WebP
- Placeholders: `https://picsum.photos/seed/{id}/400/300`

## Accessibility
- Focus ring: `3px solid oklch(0.52 0.18 160 / 0.4)` offset 2px
- Skip link on every page
- ARIA labels on all icon-only buttons
- Tables: `<th scope="col">`, row `tabIndex=0` + Enter/Space to open
- Modals: focus trap, inert background, ESC to close
- Color never sole carrier of meaning (badges have text + icon)

## Copy Rules
- PT-PT: "viatura", "matrícula", "proprietário", "motorista", "apuramento", "factura"
- NIF: 9 dígitos. IBAN: PT50 + 21 chars.
- Datas: `dd/mm/aaaa`. Moeda: `€1.234,56` (Intl.NumberFormat pt-PT)
- Sem em dashes. Sem emojis.
- Empty states: actionable ("Adicione a primeira viatura", "Importe um documento")