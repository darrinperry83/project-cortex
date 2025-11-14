Project-Cortex

## Push 0 — Local PostgreSQL (Docker)

### Quickstart

1. `cp docker/.env.example docker/.env` (set a strong `POSTGRES_PASSWORD`)
2. `make db-up` (or `make db-up-sandbox` for Adminer at http://localhost:8080)
3. `make db-psql DB=dev` to open a psql shell

### Backups

- `make db-backup DB=dev` → dumps to `backups/`
- `make db-restore FILE=backups/dev-YYYYmmdd-HHMM.sql DB=dev`

### Notes

- Three databases are created on first run: `sandbox`, `dev`, `prod`.
- No application schema yet—this is infra only.

## Push 1 — Next.js PWA Shell

- Install: `npm install` (or `pnpm install`)
- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build && npm start`
- PWA: Manifest included; SW generated in production via next-pwa.
- Command Palette: ⌘/Ctrl + K
- Pages: /agenda, /projects, /notes, /travel, /habits

## Push 1.01 — Flexible Outline + Properties + Slices

A domain-agnostic, Org-mode-inspired system for hierarchical notes with typed properties and saved queries.

### Core Concepts

**Outline**: Everything is a **Block** in a hierarchical tree. Create headings anywhere using slash-paths (e.g., `#Cities/Tokyo`, `#Trading/Strategies`).

**Properties**: Attach typed key-value pairs to any block:

- Types: string, number, boolean, date, datetime, taglist, json
- Examples: `category=coffee`, `visited=false`, `risk_reward=2.5`

**Slices**: Saved queries that render as interactive tables. Filter and display blocks based on type, tags, path, or properties.

### Getting Started

1. **Visit the Editor**: http://localhost:3000/editor
   - Automatically seeds demo data on first load
   - Use keyboard shortcuts to navigate and edit (see below)

2. **Create Headings**: Press ⌘/Ctrl + K → "New heading at path…"
   - Enter a path like `#Projects/Q1/Launch` or `Books/Fiction/Austen`
   - Missing intermediate headings are created automatically

3. **Add Properties**: Hover over a block and click "+ Add property"
   - Or press `:` when a block is selected
   - Choose a key, type, and value

4. **Create Slices**: Press ⌘/Ctrl + K → "New Slice"
   - Choose scope (Global or specific subtree)
   - Enter a query (see Query DSL below)
   - Select columns to display
   - View at /slices

### Keyboard Shortcuts (Editor)

| Key           | Action                                        |
| ------------- | --------------------------------------------- |
| ↑ / ↓         | Navigate between blocks                       |
| Enter         | Create sibling block                          |
| Shift + Enter | Create child block                            |
| Tab           | Indent block (make child of previous sibling) |
| Shift + Tab   | Outdent block                                 |
| Alt + ↑ / ↓   | Move block up/down                            |
| Space         | Toggle TODO/DONE state (for todo blocks)      |
| M             | Open refile dialog (move block to new path)   |
| :             | Add/edit properties                           |
| Double-click  | Edit block title                              |

### Query DSL

Create powerful queries to filter blocks:

**Basic Queries**:

- `type:heading` - All headings
- `tag:coffee` - Blocks tagged with "coffee"
- `path:/Cities/*` - All blocks under Cities (glob matching)

**Property Queries**:

- `prop.category=coffee` - Exact match
- `prop.visited=false` - Boolean check
- `prop.rating>=4` - Numeric comparison (>=, <=, >, <, =)

**Combined Queries**:

- `path:/Cities/* AND prop.category=coffee AND prop.visited=false`
- `path:/Trading/* AND prop.setup=volume-profile AND prop.risk_reward>=2`

### Example Workflows

**Travel Planning**:

1. Create structure: `#Cities/Tokyo`, `#Cities/Kyoto`
2. Add coffee shops as child blocks
3. Add properties: `category=coffee`, `visited=false`, `rating=4.5`
4. Create slice: `path:/Cities/* AND prop.category=coffee AND prop.visited=false`
5. View unvisited coffee shops in a sortable table

**Trading Journal**:

1. Create structure: `#Trading/Strategies/Volume-Profile`
2. Add properties: `setup=volume-profile`, `risk_reward=2.5`, `winrate=65`
3. Create slice: `path:/Trading/* AND prop.risk_reward>=2`
4. Analyze high R:R setups

### Pages

- **/editor** - Outliner with fold/zoom/indent/refile
- **/slices** - Manage saved queries/views
- **/blocks/[id]** - View individual blocks (renders slices for view blocks)
- **/agenda**, **/projects**, **/notes**, **/habits** - Coming soon

### Data Storage

- **Client-side only**: Uses Dexie (IndexedDB) for persistence
- **No backend yet**: Push 1.01 focuses on UX validation
- **Seed data**: Cities and Trading examples provided
- **Reset database**: Click "Reset Database" button in /editor

### Technical Notes

- Built with Next.js 14 (App Router), TypeScript, Tailwind
- Radix UI for accessible dialogs and components
- cmdk for command palette
- Service Worker in production builds only

## Push 1.02 — End-State UI Vision

Interactive prototypes demonstrating the complete UI vision: Org-grade outline power, Zettelkasten knowledge flow, and modern PWA UX.

### Vision Prototypes

Visit **http://localhost:3000/vision/overview** to explore all interactive prototypes.

**Available Prototypes**:

- **/vision/capture** - NLP-powered quick capture with smart parsing
- **/vision/refile** - Fuzzy search path picker with Drop/Anchor modes
- **/vision/outline** - Org-mode style editor with fold/zoom/properties
- **/vision/slices** - Query builder with live table preview
- **/vision/agenda** - Task views with scoring and filtering
- **/vision/meeting** - Meeting mode with pre-flight and action harvesting
- **/vision/collections** - Low-code type/field builder
- **/vision/settings** - Theme, density, keyboard, and i18n controls

### Design System

**Tokens**: CSS custom properties for colors, typography, spacing, motion
**Components**: 7 base components in `components/ui/` (Button, Input, Card, Dialog, Pill, Toolbar, Textarea)
**Themes**: Automatic dark/light mode via `prefers-color-scheme`

Test the design system at **http://localhost:3000/\_test-design-system**

### Documentation

- **`/docs/ui-vision.md`** - Complete UI vision narrative with screen-by-screen walkthrough
- **`/docs/ux-keyboard-map.md`** - Comprehensive keyboard shortcuts reference
- **`/docs/ux-components.md`** - Component API documentation and usage patterns

### Key Features

- **Keyboard-First**: All interactions operable via keyboard (see `/docs/ux-keyboard-map.md`)
- **Accessible**: WCAG AA+ compliant, proper ARIA, focus management
- **Responsive**: Mobile-first with 44px touch targets
- **Themeable**: CSS variables support dark/light modes
- **Performant**: Virtualized lists, optimized bundle sizes

### Design Principles

1. **Keyboard-First** - Power users can navigate entirely without mouse
2. **Progressive Disclosure** - Complexity revealed only when needed
3. **Consistent Visual Language** - Predictable patterns across the app
4. **Fast Feedback** - Real-time updates, instant responses
5. **Accessible by Default** - Screen reader support, reduced motion, high contrast

### Technical Stack

- **Design Tokens**: CSS custom properties in `/styles/tokens.css`
- **Tailwind Config**: Token mappings in `tailwind.config.ts`
- **Base Components**: TypeScript + Radix UI primitives
- **Mock Data**: Realistic demo data in `lib/mock-data.ts`
- **No Persistence**: Prototypes are frontend-only for UX validation
