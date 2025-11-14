# Push 1.01 — Flexible “Outline + Properties + Slices” (Org‑grade, Domain‑agnostic, No Backend)

**Purpose**  
Reframe the early app to be **as flexible as Org‑mode**: users can create _any_ hierarchy (`Cities/Tokyo`, `Trading/Volume‑Profile`, `Books/Fiction/Austen`) without predefined domains. We do this by making **Outline + Properties + Slices (saved views)** first‑class **in the client only** (no server, no Postgres schema yet).

This push replaces the earlier “/travel” example with a **generic system**:

- Everything is a **Block** in an **Outline**.
- Blocks can have **Properties** (key/value, typed).
- Users create **Slices** (saved queries) that render as **table views** across any scope (global or subtree).
- Tasks still exist as a block type, but execution logic stays minimal in this push.

> We keep to “infrastructure first” at the server level by not introducing DB schema yet. Persistence is **Dexie (IndexedDB)** only, so we can validate the UX before wiring Postgres later.

---

## Scope & Non‑Goals

**In scope**

- Replace domain‑specific “Travel” with **domain‑agnostic Slices**.
- Implement **Outline editor** (Org‑like): headings, nesting, fold/zoom, refile to path.
- Add **Properties** to any block (EAV model in Dexie), property chips + editor UI.
- Implement **Slices**: a **View Builder** (filters & columns) and a **Table view** (list, group optional).
- Add a minimal **Query DSL v0** for properties, tags, types, and path scope.
- Save Slices as **blocks** in the outline (ViewBlock), so views are portable and linkable.
- Update Topbar/Palette to use **/slices** (neutral) and let users create views ad‑hoc.

**Out of scope (future pushes)**

- No Postgres schema or server API.
- No board/gallery/calendar views (table only for now).
- No heavy task semantics (dependencies/ready) yet.
- No auth/workspaces. Single‑user dev only.

---

## Repository Changes (on top of Push 1 / 01b neutral nav)

```
.
├─ app/
│  ├─ slices/page.tsx                 # Slices home (list, “New Slice”)
│  ├─ editor/page.tsx                 # Scratch editor page (debug/test the Outliner)
│  ├─ blocks/[id]/page.tsx            # Open a specific block (including ViewBlock)
│  ├─ api/ (none yet)
│  └─ ... (agenda, projects, notes remain)
├─ components/
│  ├─ outliner/
│  │  ├─ Outliner.tsx                 # Fold/zoom/indent/move, render headings & todos
│  │  ├─ Node.tsx                     # One block node with affordances
│  │  └─ PathPicker.tsx               # Refile to path (#A/B/C) with fuzzy search
│  ├─ properties/
│  │  ├─ PropertyChips.tsx            # Chips display for props
│  │  └─ PropertyEditor.tsx           # Inline add/edit: key, type, value
│  ├─ slices/
│  │  ├─ SliceList.tsx                # List + actions
│  │  ├─ SliceBuilder.tsx             # Form to define filters/columns/scope
│  │  └─ TableView.tsx                # Render results, sort, hide/show columns
│  └─ QueryBar.tsx                    # DSL input with chips (optional UI)
├─ lib/
│  ├─ dexie.ts                        # Dexie schema for blocks, props, tags, slices
│  ├─ dsl.ts                          # Tiny parser for v0 DSL → predicates
│  ├─ path.ts                         # Parse/build “#A/B/C” paths; slug helpers
│  ├─ refile.ts                       # Client-only refile op (move, anchor path)
│  └─ types.ts                        # Shared TS types (Block, Property, Slice, Query)
└─ seed/
   └─ seed-outline.json               # Small demo tree (Cities/Trading examples)
```

---

## Data Model (Client‑side only, Dexie)

> EAV properties at the **block** level; Slices saved as **blocks** too.

### Tables (Dexie)

- **blocks**: `{ id, parentId, noteId, type, level, title, content, sort, tags[], createdAt, updatedAt }`
  - `type`: `"heading" | "todo" | "paragraph" | "view"` (extend later)
  - `title` for headings/todos; `content` for paragraphs; view blocks use `content` for description
- **props**: `{ id, blockId, key, kind, s?, n?, b?, d?, t?, j? }`
  - `kind`: `"string" | "number" | "boolean" | "date" | "datetime" | "taglist" | "json"`
  - Only one value field used per row (`s` string, `n` number, `b` boolean, `d` date, `t` datetime, `j` json)
  - Unique `(blockId, key)`
- **slices**: `{ id, blockId, name, scope, dsl, columns[], sort?, groupBy? }`
  - `scope`: `"global"` or `{ rootBlockId }` (subtree view)
  - `dsl`: textual query (see DSL below)
  - `columns`: `["title","type","path","prop.category","prop.visited", ...]`

Indexes for Dexie:

- `blocks`: by `parentId`, `type`, `title`, `tags`
- `props`: by `blockId`, `key`, and compound `key+kind`
- `slices`: by `name`

**Paths (client)**  
A block’s **path** is derived by walking ancestors’ slugs (e.g., `#/Cities/Tokyo`). This is computed in memory and cached in a map for fast fuzzy search. Refile changes parentId and re-sorts siblings.

---

## Query DSL v0 (small but useful)

**Grammar (subset)**

```
expr      := term ( "AND" term )*
term      := key ":" value | key "=" value | "-" key ":" value | "(" expr ")"
key       := "type" | "tag" | "path" | "prop.<key>"
value     := string | boolean | number | date | glob
```

**Behavior**

- `type:heading|todo|paragraph|view`
- `tag:coffee` (in `tags[]`)
- `path:/Cities/*` or `path:/Trading/Volume-Profile`
- `prop.category=coffee`, `prop.visited=false`, `prop.rating>=4` (numbers supported)
- Case‑insensitive by default for strings; `*` glob on path.

**Examples**

- Unvisited coffee places under Cities:  
  `path:/Cities/* AND prop.category=coffee AND prop.visited=false`
- Trading setups with a threshold:  
  `path:/Trading/* AND prop.setup="volume-profile" AND prop.risk_reward>=2`

**Columns**

- Users pick which columns to show (title, type, path, tags, and any `prop.*`).
- Table supports sorting by any column; numbers/dates sort correctly.

---

## UX Details

### Outliner

- **Keys**: Tab/Shift‑Tab indent/outdent; Enter/Shift‑Enter sibling/child; Alt+↑/↓ move; Space toggles todo state.
- **Fold/Zoom**: click chevron to fold; click heading to zoom into subtree (breadcrumb to go back).
- **Refile to path**: Press `M` to open **PathPicker**. Type `#Cities/Tokyo` (creates intermediate headings if missing). Choose **Drop here** (move only) or **Anchor to path** (sets a “canonical path” chip—client‑only hint for now).
- **Properties**: `:` opens **PropertyEditor**; tab through key/kind/value. Chips render under the title; click to edit.

### Slices

- `/slices` shows a list of saved views (from `slices` table). Button: **New Slice**.
- **Slice Builder**: set a **scope** (Global or choose a Root heading via a path picker), enter a **Query**, choose **Columns**, pick **Sort**. Save → creates a **ViewBlock** under the chosen root (or a default “Views” area).
- **TableView**: interactive columns, inline edits for props (writes through to props), row actions “Open Block”, “Reveal in Outline”.

### Command Palette

- New commands:
  - “New heading at path…” → prompts `#Path/To/Heading`
  - “New Slice” → opens Slice Builder
  - “Add property to current block”
  - “Refile to path…”

### Seed data

- `seed/seed-outline.json` contains two small demo trees so QA can feel flexibility:
  - `Cities` → `Tokyo`, `Kyoto`, each with blocks tagged and props (`category=coffee`, `visited=false`).
  - `Trading` → `Strategies` → `Volume‑Profile`, `Breakout`, with props (`setup=volume-profile`, `risk_reward=2.5`).

---

## Implementation Tasks (Claude Code agents)

**Branch**: `push/01-01-flex-outline-slices`

### Web Agent

1. Add **Dexie** & schema (`lib/dexie.ts`) with the three tables (blocks, props, slices) and seed loader.
2. Implement **Outliner** with fold/zoom/indent/move; render chips for tags/props; PathPicker with fuzzy search and slash‑path creation.
3. Add `/editor` page wired to the Outliner (for testing) and `/blocks/[id]` to open any block.
4. Build **PropertyEditor** and **PropertyChips**.
5. Create **SliceBuilder** + **TableView**, and `/slices` listing.
6. Save Slices as blocks of type `view` (create a “Views” root on first run).

### UI Agent

1. Polish keyboard interactions and focus rings; ensure `aria-*` on editable fields and dialogs.
2. TableView: resizable columns, text truncation, basic empty‑state and error states.
3. PathPicker: breadcrumb preview and create‑path affordance (shows “will create Cities/Tokyo”).
4. Chips: colors by kind; boolean props render as toggles.

### Docs Agent

1. Update README: explain Outline, Properties, and Slices; show 3 example queries.
2. Add a short “Getting started” for creating a heading path and a slice.

### QA Agent

- Acceptance checklist (below). Provide screenshots & short gifs.

---

## File Stubs (exact names; content is up to agents unless specified)

- `lib/types.ts` — defines:

  ```ts
  export type BlockType = "heading" | "todo" | "paragraph" | "view";
  export interface Block {
    id: string;
    parentId: string | null;
    type: BlockType;
    title?: string;
    content?: string;
    level: number;
    sort: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }
  export interface Prop {
    id: string;
    blockId: string;
    key: string;
    kind: "string" | "number" | "boolean" | "date" | "datetime" | "taglist" | "json";
    s?: string;
    n?: number;
    b?: boolean;
    d?: string;
    t?: string;
    j?: any;
  }
  export interface Slice {
    id: string;
    blockId: string | null;
    name: string;
    scope: "global" | { rootBlockId: string };
    dsl: string;
    columns: string[];
    sort?: { by: string; dir: "asc" | "desc" } | null;
    groupBy?: string | null;
  }
  ```

- `lib/dsl.ts` — parser that supports:
  - `type:`, `tag:`, `path:`, `prop.<key>=<value>` and `AND` conjunctions.
  - Returns a predicate function `(row) => boolean` + column metadata.

- `lib/path.ts` — helpers:
  - `slugify(title)`, `buildPath(blockId)`, `ensurePath("#A/B/C")` (create headings if missing).

- `lib/refile.ts` — `refile(blockId, targetPath, mode)`: moves block under target, creates path if needed.

- `lib/dexie.ts` — Dexie schema & seed loader.

- `components/outliner/*` — editor + node + path picker.

- `components/properties/*` — chips & editor.

- `components/slices/*` — list, builder, table view.

- `app/slices/page.tsx` — list + “New Slice”.

- `app/blocks/[id]/page.tsx` — view a block and, if `type=view`, render the Slice in place.

---

## Acceptance Criteria (QA Checklist)

- [ ] **Create arbitrary hierarchies** from the command palette (e.g., `#Cities/Tokyo`, `#Trading/Volume-Profile`); refile an existing block to this path; paths auto‑create missing headings.
- [ ] **Add properties** to any block (`category=coffee`, `visited=false`, `risk_reward=2.5`). Chips render and are editable.
- [ ] **Create a Slice** (global or scoped to a subtree). Enter a query:
  - `path:/Cities/* AND prop.category=coffee AND prop.visited=false`
  - `path:/Trading/* AND prop.setup=volume-profile AND prop.risk_reward>=2`
    Table shows matching rows with chosen columns (`title`, `path`, `prop.category`, etc.).
- [ ] **Open a Slice as a block**: the ViewBlock renders in `/blocks/[id]` and is visible in the outline under “Views” (or chosen root).
- [ ] **Refile a Slice** view block under a different heading; it still works and keeps scope and DSL.
- [ ] **Persist across reloads** (Dexie). Seed can be cleared and reloaded.
- [ ] Accessibility: editable fields announce labels; Tab order is logical; palette and dialogs are keyboard‑navigable.

---

## Troubleshooting Notes

- **Path conflicts**: If multiple headings share the same title under a parent, slug collisions are resolved by suffix (`-2`, `-3`). The PathPicker shows the full breadcrumb to avoid ambiguity.
- **Property key casing**: Normalize to lower‑case slugs for queries; display original casing in UI.
- **Performance**: For large tables, virtualize rows (optional; only needed if >1k items).

---

## README Addition (suggested)

```md
## Outline + Properties + Slices

- Create headings anywhere using the command palette (⌘/Ctrl+K → “New heading at path”). Use `#A/B/C` syntax.
- Add properties to any block (hover → “Add property” or press `:`). Properties are typed (string, number, boolean, date, json).
- Build **Slices**: saved queries that render as tables. Scope them globally or to a subtree. Examples:
  - `path:/Cities/* AND prop.category=coffee AND prop.visited=false`
  - `path:/Trading/* AND prop.setup=volume-profile AND prop.risk_reward>=2`
```

---

## Orchestrator Prompt (Multi‑Agent, minimal thinking)

```text
You are the coordinator for **Project Cortex — Push 1.01 (Flexible Outline + Properties + Slices)**. Spawn agents (Web, UI, Docs, QA) and implement exactly as specified.

Branch: `push/01-01-flex-outline-slices`

Constraints:
- No backend, no Postgres schema. Client-only via Dexie.
- Replace any domain-specific pages with neutral Slices and Outline features.
- Table view only; board/gallery come later.

Tasks by role: (see “Implementation Tasks” section). Ensure stubs are created with file names exactly as listed. Use the seed data to demonstrate Cities and Trading examples.

Deliverables:
- A running app with: Outline editor, Property editor, Slices list, Slice builder, Table view, and seed data.
- README updated with usage and examples.
- QA checklist completed with screenshots/gifs.
```
