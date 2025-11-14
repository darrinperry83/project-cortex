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
