# Push 1.02 — End‑State UI Vision (Org‑grade, Zettelkasten‑friendly, PWA‑first)

**Objective**  
Define the **end‑state user interface** and ship **clickable prototypes** that reflect the full vision: Org‑grade outline power, Zettelkasten knowledge flow, and a modern PWA UX that’s fast, accessible, and beautiful. This push is **frontend‑only**: no backend or schema—prototypes run on mocked/local data.

---

## Scope & Non‑Goals

**In scope**

- A **UI Vision Doc** and **interactive prototypes** for core flows.
- A **design system** with tokens (color, type, space, radius, shadow, motion) and base components.
- High‑fidelity **screen frames** and **navigation** patterns (desktop & mobile).
- Keyboard model, command palette, capture, refile, outline, properties, slices, agenda, meeting mode, notifications UI, offline banners.
- Accessibility and internationalization guidelines; dark & light themes.

**Out of scope**

- Server, database schema, sync, or notifications backend.
- Real auth. (Use mocked state.)

---

## Deliverables

1. **Docs**
   - `/docs/ui-vision.md` — narrative spec (screens, flows, decisions).
   - `/docs/ux-keyboard-map.md` — keyboard reference.
   - `/docs/ux-components.md` — component inventory and API.

2. **Design System**
   - `/styles/tokens.css` — CSS variables (color/type/space/radius/shadow/motion).
   - `tailwind.config.ts` — maps semantic tokens to utilities.
   - Base components in `components/ui/*` with stories (optional Storybook).

3. **Interactive Prototypes (routes under `/_vision/`)**
   - `/_vision/overview` — links to all prototypes.
   - `/_vision/capture` — capture overlay (NLP), quick add to path.
   - `/_vision/refile` — refile modal with path picker (Drop vs Anchor).
   - `/_vision/outline` — outline editor (fold/zoom), props chips/editor.
   - `/_vision/slices` — slice builder + table view (mock query).
   - `/_vision/agenda` — Today, Next 7, Waiting, Unblockers (mock data).
   - `/_vision/meeting` — meeting mode (prep + actions harvest).
   - `/_vision/collections` — neutral “Collections” builder sketch.
   - `/_vision/settings` — theme, density, keyboard, i18n.

4. **Quality bars**
   - Lighthouse: PWA/installable, Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95.
   - Keyboard parity: all dialogs/menus/forms operable without mouse.
   - Screen reader: roles, names, descriptions correct; focus order logical.

---

## Frame Inventory (end‑state)

### 1) Shell & Navigation

- **Topbar**: app title, global search, command button (⌘K), account.
- **Left rail (collapsible)**: pins (Today, Projects, Notes, Slices), recent focus headers, quick filters.
- **Breadcrumbs**: within outline/slices; shows `#/A/B/C` path; click to jump.

### 2) Capture Overlay (global)

- Open with **C** or **⌘/Ctrl+Enter**; single field with NLP:
  - `t <title> #Path/Sub due Fri 4pm @tags after "<other task>"`
  - **Smart suggestions**: path completions, date parsing, tag autocompletion.
- Secondary: micro‑form with fields (title, path, due/scheduled, tags, owner).

### 3) Refile Modal

- Fuzzy search **headers**; breadcrumb preview.
- Toggle **Drop here** / **Anchor as subproject** (Alt toggles).
- Path input accepts `#A/B/C`; auto‑creates missing headings (preview shows what will be created).

### 4) Outline Editor

- Virtual indent (Org feel), fold/zoom, drag or keyboard move.
- Node affordances: status toggle (todo/next/wip/waiting/done), tags, **property chips**, links.
- Inline **Property Editor** opens with `:` on a node; typed fields.

### 5) Slices (Saved Views)

- **Builder**: scope (global or subtree), DSL input with chips, column chooser, sort/group.
- **Table view**: virtualized rows, resizable columns, per‑row actions (open, reveal in outline).
- Saved views show under **Slices**; can be pinned to nav.

### 6) Agenda

- Views: Today, Next 7, Waiting, Unblockers, Payments 30d, Bookings 14d, Habits Today.
- Chips: Ready, Blocked, Kind, Tag, Project, Context (item/note).
- Score pills show contributions (due, scheduled, priority, blocked, tags).

### 7) Meeting Mode

- Pre‑flight panel (objective, attendees, links, related tasks).
- Two‑pane: left note, right **Actions**; hitting Enter on `[ ]` action creates a task with a `#Project/Sub` path.
- “Harvest Actions” validates owners/dates and creates follow‑ups (waiting).

### 8) Collections Builder (neutral)

- Define types, fields, and relationships (reference fields) with a simple wizard.
- Preview table/gallery/calendar views for a type; save as a **Slice** underneath.

### 9) Notifications & Offline

- **Notifications center** overlay with grouped reminders (mock).
- **Offline banner** with queued changes count and “Retry” action.

### 10) Settings

- Theme (dark/light/system), density, monospace for outline, show line guides.
- Keyboard: choose Emacs‑style bindings (optional), customize some hotkeys.
- i18n: locale, 24h/12h time, week start, number/date formats.

---

## Design System

### Tokens (`/styles/tokens.css`)

```css
:root {
  /* Color Baseline */
  --color-bg: #0b0f14; /* neutral-950 */
  --color-surface: #0f141b; /* neutral-900 */
  --color-text: #e6eaf2; /* neutral-100 */
  --color-muted: #9aa4b2; /* neutral-400 */
  --color-border: #222935; /* neutral-800 */

  /* Brand / Accents */
  --brand-500: #2e90fa;
  --brand-600: #1b6fd8;
  --brand-700: #1459ae;

  /* Semantic */
  --ok-500: #22c55e;
  --warn-500: #f59e0b;
  --danger-500: #ef4444;
  --info-500: #38bdf8;

  /* Typography */
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial,
    "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;

  /* Type scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Radius & Shadow */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-2: 0 6px 18px rgba(0, 0, 0, 0.35);

  /* Motion */
  --ease-emph: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-fast: 120ms;
  --dur-med: 200ms;
  --dur-slow: 300ms;
}

@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #ffffff;
    --color-surface: #fbfbfc;
    --color-text: #0c1116;
    --color-muted: #475569;
    --color-border: #e2e8f0;
  }
}
```

### Tailwind Mapping (excerpt)

```ts
// tailwind.config.ts (extend)
theme: {
  extend: {
    colors: {
      bg: "var(--color-bg)",
      surface: "var(--color-surface)",
      text: "var(--color-text)",
      muted: "var(--color-muted)",
      brand: { 500: "var(--brand-500)", 600: "var(--brand-600)", 700: "var(--brand-700)" },
      ok: { 500: "var(--ok-500)" }, warn: { 500: "var(--warn-500)" }, danger: { 500: "var(--danger-500)" }, info: { 500: "var(--info-500)" }
    },
    borderRadius: { sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)" },
    boxShadow: { sm: "var(--shadow-1)", md: "var(--shadow-2)" }
  }
}
```

### Base Components (`components/ui/*`)

- **Button** (sizes, variants), **Input**, **Textarea**, **Select**, **Checkbox** (Radix).
- **Dialog**, **Popover**, **Tooltip**, **Dropdown**, **Tabs** (Radix).
- **Pill** (score/flags), **TagChip**, **Card**, **Toolbar**, **Panel**, **Table** (virtualized).
- **Icon** set via Lucide; wrapper maps names to icons.

---

## Interaction & Keyboard Model (end‑state)

- **Global**: ⌘K palette, ⌘/Ctrl+Enter capture, `/` focus search, `g t` go to Today, `g p` Projects, `g s` Slices.
- **Outline**: `Tab/Shift+Tab` indent/outdent; `Alt+↑/↓` move; `Enter` sibling; `Shift+Enter` child; `Space` toggle todo; `:` edit properties; `M` refile; `Z` zoom.
- **Slices/Table**: `↑/↓` rows; `Enter` open; `e` edit cell; `Cmd/Ctrl+f` filter; `Cmd/Ctrl+s` save view.
- **Refile**: `M` opens modal; `Alt+Enter` toggles Drop/Anchor.
- **Meeting**: `Cmd/Ctrl+m` in a meeting task opens meeting mode; `Enter` on `[ ]` line creates task.

A full map is documented in `/docs/ux-keyboard-map.md` (generated in this push).

---

## Accessibility & i18n

- **A11y**: ARIA roles for tree, listbox, dialog; focus trap in overlays; labelled inputs; visible focus; 44px targets on mobile; reduced motion support; color‑contrast AA+.
- **i18n**: locale switch, 24h/12h, week start, LTR/RTL flipping for layout; date/number formats localized. Text and icons have accessible names; palette items announce group and position.

---

## Motion Guidelines

- Small elements: `--dur-fast` with `--ease-emph`.
- Dialogs/sheets: `--dur-med` + fade/scale 0.96 → 1.
- Navigation transitions: subtle crossfade; no large parallax.
- **Reduced motion**: disable nonessential transitions; keep focus and state changes instant.

---

## Prototypes to build (/\_vision)

Each prototype uses **mock data** (local arrays) and shows the final interaction.

1. `/_vision/capture` — overlay with NLP examples; path autocomplete; quick fields drawer.
2. `/_vision/refile` — modal with fuzzy search, path creation preview, Drop vs Anchor toggle, recent targets.
3. `/_vision/outline` — 80–120 nodes list; fold/zoom, properties on nodes, refile demo.
4. `/_vision/slices` — builder + table; queries like:
   - `path:/Cities/* AND prop.category=coffee AND prop.visited=false`
   - `path:/Trading/* AND prop.setup=volume-profile AND prop.risk_reward>=2`
5. `/_vision/agenda` — mock Today, Next 7; score pills; ready/blocked chips.
6. `/_vision/meeting` — timed prep + actions; harvesting UX.
7. `/_vision/collections` — type/field wizard (no persistence), preview panel.
8. `/_vision/settings` — theme switcher, density, keyboard layout toggles.

---

## Implementation Tasks (Claude Code agents)

**Branch**: `push/01-02-ui-vision`

### Web Agent

- Create routes and scaffolds under `/_vision/*` with mocked data providers.
- Add `/styles/tokens.css`, wire into Tailwind. Update `Topbar` to link `/_vision/overview` (hidden behind dev flag).
- Implement `components/ui/*` base set; reuse Radix primitives.

### UI/UX Agent

- Build Capture, Refile, Outline, Slices, Agenda, Meeting prototypes with realistic interactions and motion.
- Ensure keyboard parity and accessible labels per spec.

### A11y/Perf Agent

- Add `aria-*` roles, focus management, and skip links.
- Virtualize table rows and long outline lists.
- Lighthouse run and report scores.

### Docs Agent

- Author `/docs/ui-vision.md`, `/docs/ux-keyboard-map.md`, `/docs/ux-components.md`.
- Include screenshots/gifs from prototypes (or describe flows if screenshot automation is unavailable).

### QA Agent

- Execute acceptance checklist; attach Lighthouse report; validate reduced‑motion and dark/light switching.

---

## Acceptance Criteria

- [ ] All `/_vision/*` routes are present and interactive with mock data.
- [ ] Tokens and Tailwind mapping theme the prototypes; dark/light work.
- [ ] Capture overlay parses sample phrases and shows correct chips/previews.
- [ ] Refile modal supports search, path creation preview, Drop/Anchor toggle.
- [ ] Outline is keyboard‑operable and performant (virtualized if needed).
- [ ] Slice builder composes filters; table renders correct columns and permits inline prop edits.
- [ ] Agenda prototypes show score pills and ready/blocked chips.
- [ ] Meeting mode demonstrates prep and action harvesting.
- [ ] A11y pass (tab order, roles, labels); reduced motion respected.
- [ ] Lighthouse PWA/Perf/A11y/Best Practices thresholds met.

---

## README Addition (suggested)

```md
## Push 1.02 — End‑State UI Vision

- Visit `/_vision/overview` to explore interactive prototypes.
- Dark/light theme toggle and density controls are in `/_vision/settings`.
- Keyboard reference: `/docs/ux-keyboard-map.md`.
```

---

## Orchestrator Prompt (multi‑agent)

```text
You are the coordinator for **Project Cortex — Push 1.02 (End‑State UI Vision)**. Spawn agents (Web, UI/UX, A11y/Perf, Docs, QA) and implement exactly as specified.

Branch: `push/01-02-ui-vision`

Constraints:
- Frontend‑only; use mocked data.
- Implement design tokens, base components, and the `/_vision/*` prototypes.
- Meet the acceptance criteria and attach a Lighthouse report.

Deliverables:
- Interactive prototypes at `/_vision/*`.
- Docs: `/docs/ui-vision.md`, `/docs/ux-keyboard-map.md`, `/docs/ux-components.md`.
- PR with screenshots/gifs and Lighthouse scores.
```
