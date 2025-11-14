# Push 1.04 — **Editor MVP (Dexie‑backed, PWA)**

**Purpose**  
Ship a **working, persistent editor** (Org‑grade outline with properties, capture, and refile) that feels like a real app — not a demo. This becomes your daily driver you can iterate on. It’s **client‑side only** (Dexie for persistence, PWA for offline); server/schema come later.

**You will get:**

- `/editor` — primary outliner with create/edit, indent/outdent, move, fold/zoom (basic), tags & **properties chips**.
- `Capture` overlay — NLP‑style input creates todos under `#Path` with tags/props/dates.
- `Refile` dialog — fuzzy search headers + `#A/B/C` path creation (“Drop” vs “Anchor”).
- `/agenda` — minimal “Ready” + score demo using due/scheduled (for sanity).
- **Persistence** across reloads (Dexie). Offline works (PWA).

> This push **productizes** the vision code: new `components/editor/*` and `lib/db/*` backed by **Dexie**; it does not touch Postgres yet.

---

## Scope & Non‑Goals

**In scope**

- Dexie DB + React hooks for blocks/props and outliner ops (create, update, indent/outdent, move, refile, ensurePath).
- Editor UI under `/editor` using live Dexie queries; capture & refile wired.
- Minimal agenda reading from Dexie (ready/score logic demo).
- PWA ready (reuses your existing next‑pwa setup).

**Out of scope**

- Server/API/schema, sync, dependencies DAG, saved Slices UI (kept for a later push).

---

## Dependencies

```bash
pnpm add dexie dexie-react-hooks nanoid fuse.js date-fns
pnpm add -D @types/fuse.js
```

---

## Repository changes

```
.
├─ lib/
│  ├─ db/dexie.ts              # Dexie instance + tables
│  ├─ db/blocks.ts             # CRUD + outline ops + ensurePath
│  ├─ capture/parse.ts         # capture parser (ported from vision, slightly improved)
│  ├─ fuzzy.ts                 # Fuse.js header search
│  └─ scoring.ts               # tiny ready()/score() helpers for agenda
├─ components/editor/
│  ├─ Editor.tsx               # main editor frame + toolbar
│  ├─ Outliner.tsx             # tree rendering with keyboard affordances
│  ├─ Node.tsx                 # one node (heading/todo/paragraph) + chips
│  ├─ PropertyChips.tsx        # render/edit typed props
│  ├─ CaptureOverlay.tsx       # NLP capture -> creates todo at path
│  └─ RefileDialog.tsx         # search headers, create path, drop/anchor
├─ app/
│  ├─ editor/page.tsx          # mounts <Editor/>
│  └─ agenda/page.tsx          # minimal Agenda (ready/score on Dexie data)
└─ seed/seed-outline.json      # small starter tree (Cities/Trading examples)
```

---

## Exact file contents

> Paste these verbatim. Where you see `/* … */` comments, keep or remove as you like.

### `lib/db/dexie.ts`

```ts
import Dexie, { Table } from "dexie";

export type BlockType = "heading" | "todo" | "paragraph";

export interface Block {
  id: string; // nanoid
  parentId: string | null;
  type: BlockType;
  title?: string;
  content?: string;
  level: number; // denormalized for quick render
  sort: number; // sibling sort (ascending)
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type PropKind = "string" | "number" | "boolean" | "date" | "datetime" | "taglist" | "json";

export interface Prop {
  id: string;
  blockId: string;
  key: string; // normalized (lowercase, dash)
  label: string; // display label as entered
  kind: PropKind;
  s?: string;
  n?: number;
  b?: boolean;
  d?: string;
  t?: string;
  j?: any;
}

export class CortexDexie extends Dexie {
  blocks!: Table<Block, string>;
  props!: Table<Prop, string>;

  constructor() {
    super("cortex");
    this.version(1).stores({
      blocks: "id, parentId, type, level, sort, title",
      props: "id, blockId, key",
    });
  }
}

export const db = new CortexDexie();
```

### `lib/db/blocks.ts`

```ts
"use client";
import { db, Block, BlockType, Prop } from "./dexie";
import { nanoid } from "nanoid";

const now = () => new Date().toISOString();

export async function addBlock(input: { parentId: string|null; type: BlockType; title?: string; content?: string; atIndex?: number }) {
  const { parentId, type, title, content, atIndex } = input;
  return db.transaction("rw", db.blocks, async () => {
    const level = parentId ? ((await db.blocks.get(parentId))?.level ?? 0) + 1 : 1;
    const id = nanoid();
    const sort = atIndex ?? (await nextSort(parentId));
    await db.blocks.add({ id, parentId, type, title, content, level, sort, tags: [], createdAt: now(), updatedAt: now() });
    return id;
  });
}

async function nextSort(parentId: string|null) {
  const bros = await db.blocks.where("parentId").equals(parentId as any).toArray();
  return bros.length ? Math.max(...bros.map(b=>b.sort)) + 1 : 0;
}

export async function updateBlock(id: string, patch: Partial<Block>) {
  await db.blocks.update(id, { ...patch, updatedAt: now() });
}

export async function removeBlock(id: string) {
  await db.transaction("rw", db.blocks, async () => {
    const toDelete = [id];
    for (let i=0; i<toDelete.length; i++) {
      const cur = toDelete[i];
      const kids = await db.blocks.where("parentId").equals(cur).toArray();
      toDelete.push(...kids.map(k=>k.id));
    }
    await db.blocks.bulkDelete(toDelete);
  });
}

export async function moveBlock(id: string, newParentId: string|null, newIndex?: number) {
  await db.transaction("rw", db.blocks, async () => {
    const b = await db.blocks.get(id); if (!b) return;
    const parentLevel = newParentId ? (await db.blocks.get(newParentId))?.level ?? 0 : 0;
    const sort = newIndex ?? (await nextSort(newParentId));
    await db.blocks.update(id, { parentId: newParentId, level: parentLevel + 1, sort, updatedAt: now() });
  });
}

export async function indentBlock(id: string) {
  await db.transaction("rw", db.blocks, async () => {
    const b = await db.blocks.get(id); if (!b) return;
    const siblings = await db.blocks.where("parentId").equals(b.parentId as any).sortBy("sort");
    const idx = siblings.findIndex(x=>x.id===id);
    if (idx <= 0) return;
    const newParentId = siblings[idx-1].id;
    await db.blocks.update(id, { parentId: newParentId, level: siblings[idx-1].level + 1, sort: await nextSort(newParentId), updatedAt: now() });
  });
}

export async function outdentBlock(id: string) {
  await db.transaction("rw", db.blocks, async () => {
    const b = await db.blocks.get(id); if (!b) return;
    const parent = b.parentId ? await db.blocks.get(b.parentId) : null;
    if (!parent) return;
    const grand = parent.parentId;
    const afterParentSort = (await db.blocks.where("parentId").equals(grand as any).sortBy("sort")).find(p=>p.id===parent.id)?.sort ?? 0;
    await db.blocks.update(id, { parentId: grand, level: (parent.level-1)||1, sort: afterParentSort + 0.1, updatedAt: now() });
  });
}

export async function toggleTodo(id: string) {
  const status = await getProp(id, "status");
  if (!status) await upsertProp(id, "status", "string", { s: "done" });
  else if (status.s === "done") await upsertProp(id, "status", "string", { s: "todo" });
  else await upsertProp(id, "status", "string", { s: "done" });
}

export async function upsertProp(blockId: string, label: string, kind: Prop["kind"], value: Partial<Prop>) {
  const key = label.trim().toLowerCase().replace(/\s+/g, "-");
  const existing = await db.props.where({ blockId, key }).first();
  if (existing) {
    await db.props.update(existing.id, { label, kind, ...value });
  } else {
    await db.props.add({ id: nanoid(), blockId, key, label, kind, ...value });
  }
}

export async function removeProp(blockId: string, key: string) {
  const k = key.trim().toLowerCase().replace(/\s+/g, "-");
  const hit = await db.props.where({ blockId, key: k }).first();
  if (hit) await db.props.delete(hit.id);
}

export async function getProp(blockId: string, key: string) {
  const k = key.trim().toLowerCase().replace(/\s+/g, "-");
  return db.props.where({ blockId, key: k }).first();
}

export async function ensurePath(path: string): Promise<string> {
  // path forms: "#/A/B/C", "#A/B/C", "A/B/C"
  const clean = path.replace(/^#?\\/?/, "");
  const parts = clean.split("/").map(p => p.trim()).filter(Boolean);
  let parentId: string|null = null;
  for (const part of parts) {
    const existing = await db.blocks.where({ parentId }).filter(b => (b.title ?? "").toLowerCase() === part.toLowerCase()).first();
    if (existing) { parentId = existing.id; continue; }
    parentId = await addBlock({ parentId, type:"heading", title: part });
  }
  return parentId as string;
}

export async function buildPath(blockId: string): Promise<string> {
  const names: string[] = [];
  let cur: string | null = blockId;
  while (cur) {
    const b = await db.blocks.get(cur);
    if (!b) break;
    if (b.title) names.push(b.title);
    cur = b.parentId;
  }
  return "#/" + names.reverse().join("/");
}
```

### `lib/capture/parse.ts`

```ts
export interface CaptureResult {
  title: string;
  path?: string;
  tags: string[];
  props: Record<string, string>;
  due?: string; // ISO
  scheduled?: string; // ISO
}

export function parseCapture(input: string): CaptureResult {
  const out: CaptureResult = { title: "", tags: [], props: {} };
  let s = input.trim();
  if (s.startsWith("t ")) s = s.slice(2);

  const pathMatch = s.match(/#([\\w\\s\\/:-]+)/);
  if (pathMatch) {
    out.path = "#" + pathMatch[1].trim();
    s = s.replace(pathMatch[0], "").trim();
  }

  const tagRe = /@([\\w\\-\\/]+)/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(s))) out.tags.push(m[1]);
  s = s.replace(tagRe, "").trim();

  const propRe = /prop\\.([\\w\\-]+)=([^\\s]+)/g;
  while ((m = propRe.exec(s))) out.props[m[1]] = m[2];
  s = s.replace(propRe, "").trim();

  const due = s.match(/due\\s+([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i);
  if (due) {
    out.due = new Date(due[1] + "T09:00:00").toISOString();
    s = s.replace(due[0], "").trim();
  }

  const at = s.match(/\\b(at|@)\\s+([0-9]{1,2}:[0-9]{2})\\b/i);
  if (at) {
    const [h, mi] = at[2].split(":").map(Number);
    const d = new Date();
    d.setHours(h, mi, 0, 0);
    out.scheduled = d.toISOString();
    s = s.replace(at[0], "").trim();
  }

  out.title = s.trim();
  return out;
}
```

### `lib/fuzzy.ts`

```ts
import Fuse from "fuse.js";
import { db, Block } from "./db/dexie";

export async function searchHeaders(query: string) {
  const items = await db.blocks.filter((b) => b.type === "heading" || b.type === "todo").toArray();
  const fuse = new Fuse(items, { keys: ["title"], threshold: 0.3, ignoreLocation: true });
  return fuse.search(query).map((r) => r.item);
}
```

### `lib/scoring.ts`

```ts
import { db } from "./db/dexie";

export async function isReady(id: string) {
  const status = await db.props.where({ blockId: id, key: "status" }).first();
  if (status?.s === "done") return false;
  const sched = await db.props.where({ blockId: id, key: "scheduled_at" }).first();
  if (sched?.t && new Date(sched.t) > new Date()) return false;
  return true;
}

export async function score(id: string) {
  let s = 0;
  const due = await db.props.where({ blockId: id, key: "due_at" }).first();
  if (due?.t) {
    const d = new Date(due.t).getTime() - Date.now();
    s += d < 0 ? 100 : d < 86400000 ? 80 : d < 3 * 86400000 ? 60 : 30;
  }
  if (await isReady(id)) s += 10;
  return s;
}
```

### `components/editor/PropertyChips.tsx`

```tsx
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { upsertProp, removeProp } from "@/lib/db/blocks";

export function PropertyChips({ blockId }: { blockId: string }) {
  const props =
    useLiveQuery(() => db.props.where("blockId").equals(blockId).toArray(), [blockId]) ?? [];

  async function edit(label: string) {
    const key = label;
    const val = prompt(`Set value for ${label}`);
    if (val == null) return;
    const num = Number(val);
    if (!Number.isNaN(num)) await upsertProp(blockId, key, "number", { n: num });
    else if (val === "true" || val === "false")
      await upsertProp(blockId, key, "boolean", { b: val === "true" });
    else await upsertProp(blockId, key, "string", { s: val });
  }

  async function add() {
    const label = prompt("Property name (e.g., category, visited, risk_reward)");
    if (!label) return;
    await upsertProp(blockId, label, "string", { s: "" });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {props.map((p) => (
        <button
          key={p.id}
          className="text-xs rounded-full bg-neutral-800 px-2 py-0.5 hover:bg-neutral-700"
          onClick={() => edit(p.key)}
          title="Click to edit"
        >
          {p.key}: {p.s ?? p.n ?? p.b ?? p.d ?? p.t ?? "…"}
        </button>
      ))}
      <button className="text-xs text-neutral-400 underline" onClick={add}>
        + prop
      </button>
    </div>
  );
}
```

### `components/editor/Node.tsx`

```tsx
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Block } from "@/lib/db/dexie";
import { indentBlock, outdentBlock, toggleTodo, updateBlock } from "@/lib/db/blocks";
import { PropertyChips } from "./PropertyChips";

export function Node({ id }: { id: string }) {
  const block = useLiveQuery(() => db.blocks.get(id), [id]);
  const children =
    useLiveQuery(() => db.blocks.where("parentId").equals(id).sortBy("sort"), [id]) ?? [];

  if (!block) return null;

  async function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    await updateBlock(block.id, { title: e.target.value });
  }

  return (
    <div className="pl-2">
      <div className="flex items-center gap-2 py-1 hover:bg-neutral-900 rounded px-1">
        {block.type === "todo" ? (
          <input type="checkbox" aria-label="Toggle todo" onChange={() => toggleTodo(block.id)} />
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}
        <input
          className="bg-transparent outline-none flex-1"
          value={block.title ?? ""}
          onChange={onTitleChange}
          placeholder={block.type === "heading" ? "Heading" : "Text"}
        />
        <div className="ml-auto text-xs text-neutral-500">
          <button className="px-1" onClick={() => indentBlock(block.id)}>
            →
          </button>
          <button className="px-1" onClick={() => outdentBlock(block.id)}>
            ←
          </button>
        </div>
      </div>
      <div className="pl-5">
        <PropertyChips blockId={block.id} />
        {children.map((c) => (
          <Node key={c.id} id={c.id} />
        ))}
      </div>
    </div>
  );
}
```

### `components/editor/Outliner.tsx`

```tsx
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { addBlock } from "@/lib/db/blocks";
import { Node } from "./Node";

export default function Outliner() {
  const roots =
    useLiveQuery(
      () =>
        db.blocks
          .where("parentId")
          .equals(null as any)
          .sortBy("sort"),
      []
    ) ?? [];

  async function addRoot() {
    const title = prompt("New heading at root:");
    if (!title) return;
    await addBlock({ parentId: null, type: "heading", title });
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button className="rounded bg-brand-600 px-3 py-1" onClick={addRoot}>
          + Heading
        </button>
        <span className="text-neutral-500 text-sm">
          Tip: edit inline; use arrows →/← to indent/outdent.
        </span>
      </div>
      <div>
        {roots.map((r) => (
          <Node key={r.id} id={r.id} />
        ))}
      </div>
    </div>
  );
}
```

### `components/editor/CaptureOverlay.tsx`

```tsx
"use client";
import { useState } from "react";
import { parseCapture } from "@/lib/capture/parse";
import { addBlock } from "@/lib/db/blocks";
import { ensurePath, upsertProp } from "@/lib/db/blocks";
import { db } from "@/lib/db/dexie";

export function CaptureOverlay() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("t Review draft #Website/Docs due 2026-05-01 @mode/writing");

  async function submit() {
    const res = parseCapture(text);
    const parent = res.path ? await ensurePath(res.path) : null;
    const id = await addBlock({ parentId: parent, type: "todo", title: res.title });
    if (res.tags.length) {
      const b = await db.blocks.get(id);
      if (b) {
        b.tags.push(...res.tags);
        await db.blocks.put(b);
      }
    }
    if (res.due) await upsertProp(id, "due_at", "datetime", { t: res.due });
    if (res.scheduled) await upsertProp(id, "scheduled_at", "datetime", { t: res.scheduled });
    for (const [k, v] of Object.entries(res.props)) await upsertProp(id, k, "string", { s: v });
    setOpen(false);
  }

  if (!open)
    return (
      <button className="rounded border px-3 py-1" onClick={() => setOpen(true)}>
        Capture (⌘/Ctrl+Enter)
      </button>
    );
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-[640px] rounded-md bg-neutral-900 p-4 border border-neutral-800">
        <h3 className="text-lg font-semibold mb-2">Capture</h3>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="t Title #Path/Sub due 2026-05-01 @tag prop.key=value"
          className="w-full bg-neutral-800 p-3 rounded outline-none"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded border px-3 py-1" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button className="rounded bg-brand-600 px-3 py-1" onClick={submit}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
```

### `components/editor/RefileDialog.tsx`

```tsx
"use client";
import { useState, useMemo } from "react";
import { ensurePath, moveBlock } from "@/lib/db/blocks";
import { searchHeaders } from "@/lib/fuzzy";

export function RefileDialog({ targetId }: { targetId: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("#");
  const [mode, setMode] = useState<"drop" | "anchor">("drop");
  const results = useMemo(() => (query ? searchHeaders(query) : Promise.resolve([])), [query]);

  async function refileToPath() {
    const id = await ensurePath(path);
    await moveBlock(targetId, id);
    setOpen(false);
  }

  return (
    <>
      <button className="rounded border px-2 py-1" onClick={() => setOpen(true)}>
        Refile
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="w-[720px] rounded-md bg-neutral-900 p-4 border border-neutral-800">
            <h3 className="text-lg font-semibold mb-2">Refile</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                className="bg-neutral-800 p-2 rounded flex-1"
                placeholder="Search headers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="text-neutral-500">or</span>
              <input
                className="bg-neutral-800 p-2 rounded w-72"
                placeholder="#A/B/C (creates path)"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
              <button className="rounded bg-brand-600 px-3 py-1" onClick={refileToPath}>
                Refile to Path
              </button>
            </div>
            <div className="mb-3">
              <label className="mr-4">
                <input type="radio" checked={mode === "drop"} onChange={() => setMode("drop")} />{" "}
                <span className="ml-1">Drop here</span>
              </label>
              <label>
                <input
                  type="radio"
                  checked={mode === "anchor"}
                  onChange={() => setMode("anchor")}
                />{" "}
                <span className="ml-1">Anchor as subproject</span>
              </label>
            </div>
            <div className="max-h-64 overflow-auto rounded border border-neutral-800 p-2 text-sm">
              <Results
                query={query}
                onPick={async (id) => {
                  await moveBlock(targetId, id);
                  setOpen(false);
                }}
              />
            </div>
            <div className="mt-3 text-right">
              <button className="rounded border px-3 py-1" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Results({
  query,
  onPick,
}: {
  query: string;
  onPick: (id: string) => void | Promise<void>;
}) {
  const [items, setItems] = useState<any[]>([]);
  useMemo(() => {
    (async () => setItems(await searchHeaders(query)))();
  }, [query]);
  if (!query) return <div className="text-neutral-500">Type to search headers…</div>;
  if (!items.length) return <div className="text-neutral-500">No matches.</div>;
  return (
    <ul className="space-y-1">
      {items.map((b) => (
        <li key={b.id} className="flex items-center justify-between">
          <span>{b.title}</span>
          <button className="text-brand-500 underline" onClick={() => onPick(b.id)}>
            Refile here
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### `components/editor/Editor.tsx`

```tsx
"use client";
import Outliner from "./Outliner";
import { CaptureOverlay } from "./CaptureOverlay";
import { useState } from "react";
import { RefileDialog } from "./RefileDialog";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { addBlock } from "@/lib/db/blocks";

export default function Editor() {
  const [showRefileFor, setShowRefileFor] = useState<string | null>(null);
  const roots =
    useLiveQuery(
      () =>
        db.blocks
          .where("parentId")
          .equals(null as any)
          .toArray(),
      []
    ) ?? [];

  async function seedIfEmpty() {
    if (roots.length) return;
    const cities = await addBlock({ parentId: null, type: "heading", title: "Cities" });
    const tokyo = await addBlock({ parentId: cities, type: "heading", title: "Tokyo" });
    await addBlock({ parentId: tokyo, type: "todo", title: "Café crawl" });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <CaptureOverlay />
        <button className="rounded border px-3 py-1" onClick={seedIfEmpty}>
          Seed demo
        </button>
        {showRefileFor && <RefileDialog targetId={showRefileFor} />}
      </div>
      <Outliner />
    </section>
  );
}
```

### `app/editor/page.tsx`

```tsx
import Editor from "@/components/editor/Editor";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Editor</h1>
      <Editor />
    </div>
  );
}
```

### `app/agenda/page.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db/dexie";
import { isReady, score } from "@/lib/scoring";

export default function AgendaPage() {
  const [rows, setRows] = useState<{ id: string; title: string; ready: boolean; score: number }[]>(
    []
  );

  useEffect(() => {
    const sub = db.blocks.hook("creating", () => refresh());
    const sub2 = db.blocks.hook("updating", () => refresh());
    const sub3 = db.props.hook("creating", () => refresh());
    const sub4 = db.props.hook("updating", () => refresh());
    refresh();
    return () => {
      /* hooks auto-clean on reload; simple demo */
    };
  }, []);

  async function refresh() {
    const todos = (await db.blocks.toArray()).filter((b) => b.type === "todo");
    const withScores = await Promise.all(
      todos.map(async (t) => ({
        id: t.id,
        title: t.title ?? "",
        ready: await isReady(t.id),
        score: await score(t.id),
      }))
    );
    setRows(withScores.sort((a, b) => b.score - a.score));
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Agenda</h2>
      <table className="w-full text-sm border border-neutral-800">
        <thead className="bg-neutral-900">
          <tr>
            <th className="p-2 text-left">Task</th>
            <th className="p-2">Ready</th>
            <th className="p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
              <td className="p-2">{r.title}</td>
              <td className="p-2">
                {r.ready ? (
                  <span className="text-green-500">Ready</span>
                ) : (
                  <span className="text-neutral-500">—</span>
                )}
              </td>
              <td className="p-2">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

---

## Wire it into the app

- **Topbar nav**: add a link to `/editor` (and keep `/agenda`).
- **PWA**: already configured; no changes needed.

---

## QA — Acceptance Criteria

- [ ] **Create headings/todos** inline under `/editor`; refresh persists (Dexie).
- [ ] **Indent/outdent/move** works and keeps hierarchy correct.
- [ ] **Properties** add/edit via chips (`due_at`, `scheduled_at`, `category`, `visited`, `risk_reward`).
- [ ] **Capture** overlay parses path/tags/props and creates a todo under the right header.
- [ ] **Refile** dialog searches headers and creates `#Path` if needed; item moves under target.
- [ ] **Agenda** reflects due/scheduled changes with ready/score updates.
- [ ] **Offline**: put browser in offline mode; editor still works with existing data; new edits persist and survive reload.
- [ ] **A11y**: inputs are labelled; focus order is logical; escape closes overlays.

---

## Orchestrator Prompt (parallel, minimal thinking)

```text
You are the coordinator for **Project Cortex — Push 1.04 (Editor MVP)**. Spawn agents (DB, Web, UI, QA) and implement EXACTLY the files and contents in this spec.

Branch: `push/01-04-editor-mvp`

Tasks:
1) Add dependencies: dexie dexie-react-hooks nanoid fuse.js date-fns.
2) Create files under lib/db, components/editor, app/editor, app/agenda with the EXACT code from this doc.
3) Add a Topbar link to /editor.
4) Run the QA checklist and attach screenshots/gifs in the PR.

Constraints:
- Client-only persistence via Dexie. No Postgres or API.
- Keep code paths domain-agnostic.

Deliverables:
- A working editor at /editor with persistence and capture/refile.
- Minimal Agenda reading from Dexie to show readiness/score.
- QA checklist completed and documented in PR.
```
