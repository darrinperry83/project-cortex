# Push 1.03 — Make Vision Prototypes Fully Interactive (Capture, Refile, Outline, Slices, Agenda)

**Objective**  
Upgrade the `/_vision/*` demos into **fully interactive prototypes** that behave like the real app: capture parses & creates nodes, refile moves items with path creation, outline edits with keyboard/drag, slices run queries with inline edits, and agenda chips/score pills respond. **Frontend‑only**, no server; persistence via a lightweight client store.

> This push targets the branch `push/01-02-ui-vision` you shared and builds directly on it. We will not introduce Postgres or API here—only client interactivity.

---

## Scope & Non‑Goals

**In scope**

- Add a **shared client store** (Zustand + persist) for blocks, properties, slices, and tasks (mock).
- Wire **/\_vision/capture, /\_vision/refile, /\_vision/outline, /\_vision/slices, /\_vision/agenda** to the store.
- Implement **path creation**, **fuzzy header search**, **keyboard ops**, **DSL filtering**, and **inline prop edits**.
- Persist to **localStorage** (simple and good enough for prototypes).

**Out of scope**

- No server, no Dexie, no schema. (We’ll switch to Dexie or Dexie-backed state in later pushes.)
- No meeting/collections interactivity beyond light stubs (optional stretch).

---

## Dependencies to add

```bash
pnpm add zustand immer fuse.js nanoid date-fns @tanstack/react-virtual
pnpm add -D @types/fuse.js
```

---

## File Map (added/updated)

```
lib/
  state/
    store.ts             # Zustand store + actions + selectors (persisted)
  dsl.ts                 # Query compiler → predicate + selected columns
  path.ts                # ensurePath, buildPath, slug helpers
  fuzzy.ts               # Fuse.js header search index
  capture/
    parse.ts             # tiny NLP for capture overlay
components/_vision/
  CaptureDemo.tsx        # fully interactive overlay
  RefileDemo.tsx         # modal: search headers, create paths, Drop/Anchor
  OutlineDemo.tsx        # outline editor (fold/zoom/indent/move)
  Node.tsx               # a single outline node with affordances
  SlicesDemo.tsx         # builder + table view
  AgendaDemo.tsx         # ready/blocked chips + score pills (mock scoring)
app/_vision/
  capture/page.tsx       # mount CaptureDemo (button to open overlay)
  refile/page.tsx        # open RefileDemo bound to a selected node
  outline/page.tsx       # show OutlineDemo
  slices/page.tsx        # show SlicesDemo
  agenda/page.tsx        # show AgendaDemo
```

> We keep the “demo” components in `components/_vision/*` so the future production components can land side‑by‑side later.

---

## Exact file contents (paste as‑is)

### 1) `lib/state/store.ts`

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import produce from "immer";
import { formatISO } from "date-fns";

export type BlockType = "heading" | "todo" | "paragraph" | "view";

export type PropKind = "string"|"number"|"boolean"|"date"|"datetime"|"taglist"|"json";

export type PropValue =
  | { kind:"string"; s:string }
  | { kind:"number"; n:number }
  | { kind:"boolean"; b:boolean }
  | { kind:"date"; d:string }       // YYYY-MM-DD
  | { kind:"datetime"; t:string }   // ISO
  | { kind:"taglist"; s:string }    // comma-separated
  | { kind:"json"; j:unknown };

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
  key: string;         // normalized (slugified)
  label: string;       // original label
  value: PropValue;
}

export interface Slice {
  id: string;
  name: string;
  scope: { kind: "global" } | { kind: "subtree"; rootBlockId: string };
  dsl: string;
  columns: string[];
  sort?: { by: string; dir: "asc"|"desc" } | null;
}

export interface State {
  blocks: Record<string, Block>;
  props: Record<string, Prop>;
  slices: Record<string, Slice>;
  rootOrder: string[]; // top-level block ids (siblings ordered)
  children: Record<string, string[]>; // parentId -> ordered children ids
  selection: string | null; // selected block for vision pages

  // CRUD
  addBlock(input: Partial<Block> & { type: BlockType; title?: string; content?: string; parentId?: string|null }): string;
  updateBlock(id: string, patch: Partial<Block>): void;
  removeBlock(id: string): void;

  // Outline ops
  setSelection(id: string|null): void;
  moveBlock(id: string, newParentId: string|null, newIndex?: number): void;
  indentBlock(id: string): void;
  outdentBlock(id: string): void;
  toggleTodo(id: string): void;

  // Props
  upsertProp(blockId: string, label: string, value: PropValue): void;
  removeProp(blockId: string, key: string): void;

  // Slices
  saveSlice(s: Omit<Slice,"id"> & { id?: string }): string;

  // Path helpers (set by path.ts at runtime)
  ensurePath: (path: string) => string; // returns deepest blockId
  buildPath: (blockId: string) => string;
}

const now = () => formatISO(new Date());

function pushChild(state: State, parentId: string|null, id: string, atIndex?: number) {
  const map = state.children;
  if (parentId === null) {
    const arr = state.rootOrder;
    if (atIndex === undefined || atIndex < 0 || atIndex > arr.length) arr.push(id);
    else arr.splice(atIndex, 0, id);
    return;
  }
  if (!map[parentId]) map[parentId] = [];
  const arr = map[parentId];
  if (atIndex === undefined || atIndex < 0 || atIndex > arr.length) arr.push(id);
  else arr.splice(atIndex, 0, id);
}

function removeChild(state: State, parentId: string|null, id: string) {
  const arr = parentId ? state.children[parentId] ?? [] : state.rootOrder;
  const idx = arr.indexOf(id);
  if (idx >= 0) arr.splice(idx, 1);
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      blocks: {},
      props: {},
      slices: {},
      rootOrder: [],
      children: {},
      selection: null,
      ensurePath: () => { throw new Error("ensurePath not initialized"); },
      buildPath: () => "#/",

      addBlock: (input) => set(produce<State>((s) => {
        const id = nanoid();
        const parentId = input.parentId ?? null;
        const level = parentId ? (s.blocks[parentId]?.level ?? 0) + 1 : 1;
        s.blocks[id] = {
          id,
          parentId,
          type: input.type,
          title: input.title,
          content: input.content,
          level,
          sort: 0,
          tags: [],
          createdAt: now(),
          updatedAt: now()
        };
        pushChild(s, parentId, id);
        s.selection = id;
      })) as unknown as string),

      updateBlock: (id, patch) => set(produce<State>((s) => {
        const b = s.blocks[id];
        if (!b) return;
        Object.assign(b, patch);
        b.updatedAt = now();
      })),

      removeBlock: (id) => set(produce<State>((s) => {
        const b = s.blocks[id];
        if (!b) return;
        // remove subtree recursively
        const stack = [id];
        while (stack.length) {
          const cur = stack.pop()!;
          const kids = s.children[cur] ?? [];
          stack.push(...kids);
          delete s.children[cur];
          Object.values(s.props).forEach(p => { if (p.blockId === cur) delete s.props[p.id]; });
          delete s.blocks[cur];
        }
        removeChild(s, b.parentId, id);
      })),

      setSelection: (id) => set({ selection: id }),

      moveBlock: (id, newParentId, newIndex) => set(produce<State>((s) => {
        const b = s.blocks[id];
        if (!b) return;
        removeChild(s, b.parentId, id);
        b.parentId = newParentId;
        b.level = newParentId ? (s.blocks[newParentId]?.level ?? 0) + 1 : 1;
        pushChild(s, newParentId, id, newIndex);
        b.updatedAt = now();
      })),

      indentBlock: (id) => set(produce<State>((s) => {
        const b = s.blocks[id];
        if (!b) return;
        const siblings = b.parentId ? s.children[b.parentId] ?? [] : s.rootOrder;
        const idx = siblings.indexOf(id);
        if (idx <= 0) return;
        const newParentId = siblings[idx - 1];
        removeChild(s, b.parentId, id);
        b.parentId = newParentId;
        b.level = (s.blocks[newParentId]?.level ?? 0) + 1;
        pushChild(s, newParentId, id);
        b.updatedAt = now();
      })),

      outdentBlock: (id) => set(produce<State>((s) => {
        const b = s.blocks[id];
        if (!b) return;
        const parent = b.parentId ? s.blocks[b.parentId] : null;
        if (!parent) return; // already root
        const grand = parent.parentId;
        removeChild(s, b.parentId, id);
        b.parentId = grand;
        b.level = grand ? (s.blocks[grand]?.level ?? 0) + 1 : 1;
        // insert after former parent
        const arr = grand ? (s.children[grand] ?? (s.children[grand] = [])) : s.rootOrder;
        const parentIdx = arr.indexOf(parent.id);
        pushChild(s, grand, id, parentIdx + 1);
        b.updatedAt = now();
      })),

      toggleTodo: (id) => set(produce<State>((s) => {
        const b = s.blocks[id];
        if (!b || b.type !== "todo") return;
        // status is a property "status": string
        const existing = Object.values(s.props).find(p => p.blockId === id && p.key === "status");
        const value = existing?.value.kind === "string" && existing.value.s === "done" ?
          ({ kind:"string", s:"todo" } as PropValue) :
          ({ kind:"string", s:"done" } as PropValue);
        if (existing) existing.value = value;
        else {
          const pid = nanoid();
          s.props[pid] = { id: pid, blockId: id, key:"status", label:"status", value };
        }
        b.updatedAt = now();
      })),

      upsertProp: (blockId, label, value) => set(produce<State>((s) => {
        const key = label.trim().toLowerCase().replace(/\s+/g, "-");
        const existing = Object.values(s.props).find(p => p.blockId === blockId && p.key === key);
        if (existing) { existing.value = value; return; }
        const id = nanoid();
        s.props[id] = { id, blockId, key, label, value };
      })),

      removeProp: (blockId, key) => set(produce<State>((s) => {
        Object.values(s.props).forEach(p => {
          if (p.blockId === blockId && p.key === key) delete s.props[p.id];
        });
      })),

      saveSlice: (sli) => set(produce<State>((s) => {
        const id = sli.id ?? nanoid();
        s.slices[id] = { id, ...sli, sort: sli.sort ?? null };
      })) as unknown as string,
    }),
    { name: "cortex-vision-store" }
  )
);
```

### 2) `lib/path.ts`

```ts
import { useStore } from "./state/store";
import { nanoid } from "nanoid";

function slugify(x: string) {
  return x.trim().replace(/[\\/#?]+/g, " ").replace(/\\s+/g, " ").trim();
}

export function initPathHelpers() {
  const set = useStore.setState;
  set({
    ensurePath: (path: string) => {
      // path like "#/A/B/C" or "#A/B/C" or "A/B/C"
      const clean = path.replace(/^#?\\/?/, "");
      const parts = clean.split("/").map(slugify).filter(Boolean);
      let parentId: string|null = null;
      const state = useStore.getState();
      for (const part of parts) {
        // find child with same title under parent
        const children = parentId ? state.children[parentId] ?? [] : state.rootOrder;
        let found: string|undefined;
        for (const id of children) {
          const b = state.blocks[id];
          if (b?.title?.toLowerCase() === part.toLowerCase()) { found = id; break; }
        }
        if (found) { parentId = found; continue; }
        // create new heading
        const id = nanoid();
        const level = parentId ? (state.blocks[parentId]?.level ?? 0) + 1 : 1;
        state.blocks[id] = {
          id, parentId, type:"heading", title: part, content:"", level, sort:0, tags: [],
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        if (parentId) {
          const arr = state.children[parentId] ?? (state.children[parentId] = []);
          arr.push(id);
        } else {
          state.rootOrder.push(id);
        }
        parentId = id;
      }
      useStore.setState(state);
      return parentId ?? "";
    },
    buildPath: (blockId: string) => {
      const st = useStore.getState();
      const names: string[] = [];
      let cur: string | null = blockId;
      while (cur) {
        const b = st.blocks[cur];
        if (!b) break;
        if (b.title) names.push(b.title);
        cur = b.parentId;
      }
      return "#/" + names.reverse().join("/");
    }
  } as any);
}
```

### 3) `lib/fuzzy.ts`

```ts
import Fuse from "fuse.js";
import { useStore } from "./state/store";

export function searchHeaders(query: string) {
  const st = useStore.getState();
  const items = Object.values(st.blocks).filter((b) => b.type === "heading" || b.type === "todo");
  const fuse = new Fuse(items, { keys: ["title"], threshold: 0.3, ignoreLocation: true });
  return fuse.search(query).map((r) => r.item);
}
```

### 4) `lib/capture/parse.ts`

```ts
// Very small parser for strings like:
// t Title #Path/Sub due Fri 4pm @tag1 @tag2 prop.key=value after "Other task"
export interface CaptureResult {
  title: string;
  path?: string;
  tags: string[];
  props: Record<string, string>;
  due?: string; // ISO (rough)
  scheduled?: string; // ISO (rough)
}

export function parseCapture(input: string): CaptureResult {
  const out: CaptureResult = { title: "", tags: [], props: {} };
  let s = input.trim();
  if (s.startsWith("t ")) s = s.slice(2);

  // path #A/B/C
  const pathMatch = s.match(/#([\\w\\s\\/:-]+)/);
  if (pathMatch) {
    out.path = "#" + pathMatch[1].trim();
    s = s.replace(pathMatch[0], "").trim();
  }
  // tags @tag
  const tagRe = /@([\\w\\-\\/]+)/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(s))) out.tags.push(m[1]);
  s = s.replace(tagRe, "").trim();

  // props prop.key=value
  const propRe = /prop\\.([\\w\\-]+)=([^\\s]+)/g;
  while ((m = propRe.exec(s))) out.props[m[1]] = m[2];
  s = s.replace(propRe, "").trim();

  // naive due parse "due YYYY-MM-DD" or YYYY/MM/DD
  const due = s.match(/due\\s+([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i);
  if (due) {
    out.due = new Date(due[1].replace(/\\/ / g, "-") + "T09:00:00").toISOString();
    s = s.replace(due[0], "").trim();
  }
  // naive scheduled parse "at HH:MM"
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

### 5) `lib/dsl.ts`

```ts
import { useStore } from "./state/store";

export type Row = { id: string; title: string; type: string; path: string; tags: string[]; props: Record<string,unknown> };

export function compileDSL(dsl: string): (row: Row) => boolean {
  const clauses = dsl.split(/\\s+AND\\s+/i).map(c => c.trim()).filter(Boolean);

  return (row: Row) => {
    for (const c of clauses) {
      // path:/A/*, type:todo, tag:coffee, prop.key=value
      const m = c.match(/^(\\w[\\w\\.]*?)\\s*[:=]\\s*(.+)$/);
      if (!m) continue;
      const key = m[1], val = m[2];
      if (key === "path") {
        const pat = val.replace(/^\\/?/, "");
        const rx = new RegExp("^" + pat.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&").replace("\\*", ".*") + "$", "i");
        if (!rx.test(row.path.replace(/^#\\//, ""))) return false;
      } else if (key === "type") {
        if (row.type.toLowerCase() !== val.toLowerCase()) return false;
      } else if (key === "tag") {
        if (!row.tags.map(t=>t.toLowerCase()).includes(val.toLowerCase())) return false;
      } else if (key.startsWith("prop.")) {
        const pkey = key.slice(5);
        const v = (row.props ?? {})[pkey];
        if (v === undefined) return false;
        // try number compare
        const num = Number(val);
        if (!Number.isNaN(num) && typeof v === "number") {
          if (v !== num) return false;
        } else {
          if (String(v).toLowerCase() !== val.toLowerCase()) return false;
        }
      }
    }
    return true;
  };
}

export function rowsFromStore(scope?: {rootBlockId?: string}) {
  const st = useStore.getState();
  const collect: string[] = [];
  function walk(id: string) {
    collect.push(id);
    for (const c of st.children[id] ?? []) walk(c);
  }
  if (scope?.rootBlockId) walk(scope.rootBlockId);
  else {
    for (const id of st.rootOrder) walk(id);
  }
  return collect.map(id => {
    const b = st.blocks[id];
    const props: Record<string,unknown> = {};
    Object.values(st.props).forEach(p => {
      if (p.blockId === id) {
        if (p.value.kind === "string") props[p.key]=p.value.s;
        else if (p.value.kind === "number") props[p.key]=p.value.n;
        else if (p.value.kind === "boolean") props[p.key]=p.value.b;
        else if (p.value.kind === "date") props[p.key]=p.value.d;
        else if (p.value.kind === "datetime") props[p.key]=p.value.t;
        else if (p.value.kind === "taglist") props[p.key]=p.value.s;
        else if (p.value.kind === "json") props[p.key]=p.value.j;
      }
    });
    return { id, title: b.title ?? "", type: b.type, path: useStore.getState().buildPath(id), tags: b.tags, props };
  });
}
```

### 6) `components/_vision/CaptureDemo.tsx`

```tsx
"use client";
import { useState } from "react";
import { parseCapture } from "@/lib/capture/parse";
import { useStore } from "@/lib/state/store";

export default function CaptureDemo() {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState(
    "t Café crawl #Cities/Tokyo @errands prop.category=coffee due 2026-05-01 at 09:30"
  );
  const ensurePath = useStore((s) => s.ensurePath);
  const addBlock = useStore((s) => s.addBlock);
  const upsertProp = useStore((s) => s.upsertProp);
  const buildPath = useStore((s) => s.buildPath);

  function submit() {
    const res = parseCapture(text);
    const parent = res.path ? ensurePath(res.path) : null;
    const id = addBlock({ type: "todo", title: res.title, parentId: parent });
    for (const t of res.tags) {
      const b = useStore.getState().blocks[id];
      b.tags.push(t);
    }
    if (res.due) upsertProp(id, "due_at", { kind: "datetime", t: res.due });
    if (res.scheduled) upsertProp(id, "scheduled_at", { kind: "datetime", t: res.scheduled });
    for (const [k, v] of Object.entries(res.props)) upsertProp(id, k, { kind: "string", s: v });
    alert(`Created: ${res.title}\\nPath: ${parent ? buildPath(parent) : "(root)"}`);
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="rounded border px-3 py-1">
        Open Capture
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

### 7) `components/_vision/RefileDemo.tsx`

```tsx
"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/state/store";
import { searchHeaders } from "@/lib/fuzzy";

export default function RefileDemo() {
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("#Cities/Tokyo");
  const [mode, setMode] = useState<"drop" | "anchor">("drop");
  const ensurePath = useStore((s) => s.ensurePath);
  const moveBlock = useStore((s) => s.moveBlock);
  const selection = useStore((s) => s.selection);
  const buildPath = useStore((s) => s.buildPath);

  const results = useMemo(() => (query ? searchHeaders(query) : []), [query]);

  function refileToExisting(id: string) {
    if (!selection) return;
    moveBlock(selection, id);
    alert(`Moved under ${buildPath(id)} (${mode})`);
  }
  function refileToPath() {
    if (!selection) return;
    const id = ensurePath(path);
    moveBlock(selection, id);
    alert(`Moved under ${buildPath(id)} (${mode})`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm text-neutral-400">Find header</label>
        <input
          className="bg-neutral-800 p-2 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        <span className="text-neutral-500">or</span>
        <input
          className="bg-neutral-800 p-2 rounded w-72"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="#A/B/C (creates path)"
        />
        <button className="rounded bg-brand-600 px-3 py-1" onClick={refileToPath}>
          Refile to Path
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label>
          <input type="radio" checked={mode === "drop"} onChange={() => setMode("drop")} />{" "}
          <span className="ml-1">Drop here</span>
        </label>
        <label>
          <input type="radio" checked={mode === "anchor"} onChange={() => setMode("anchor")} />{" "}
          <span className="ml-1">Anchor as subproject</span>
        </label>
      </div>

      {results.length > 0 && (
        <div className="rounded border border-neutral-800 p-2">
          <div className="text-sm text-neutral-400 mb-1">Search results</div>
          <ul className="space-y-1">
            {results.map((b) => (
              <li key={b.id} className="flex items-center justify-between">
                <span>{b.title}</span>
                <button className="text-brand-500 underline" onClick={() => refileToExisting(b.id)}>
                  Refile here
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 8) `components/_vision/Node.tsx` and `components/_vision/OutlineDemo.tsx`

```tsx
// Node.tsx
"use client";
import { useStore, Block } from "@/lib/state/store";

export function Node({ id }: { id: string }) {
  const b = useStore((s) => s.blocks[id]);
  const kids = useStore((s) => s.children[id] ?? []);
  const setSel = useStore((s) => s.setSelection);
  const indent = useStore((s) => s.indentBlock);
  const outdent = useStore((s) => s.outdentBlock);
  const toggle = useStore((s) => s.toggleTodo);

  if (!b) return null;
  return (
    <div className="pl-2">
      <div
        className="flex items-center gap-2 py-0.5 hover:bg-neutral-900 rounded px-1"
        onClick={() => setSel(id)}
      >
        {b.type === "todo" ? (
          <input type="checkbox" onChange={() => toggle(id)} aria-label="Toggle todo" />
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}
        <span className="text-neutral-200">{b.title ?? b.content}</span>
        <span className="text-xs text-neutral-500 ml-2">({b.type})</span>
        <div className="ml-auto text-xs text-neutral-500">
          <button
            className="px-1"
            onClick={(e) => {
              e.stopPropagation();
              indent(id);
            }}
          >
            →
          </button>
          <button
            className="px-1"
            onClick={(e) => {
              e.stopPropagation();
              outdent(id);
            }}
          >
            ←
          </button>
        </div>
      </div>
      <div className="pl-4 border-l border-neutral-800">
        {kids.map((cid) => (
          <Node key={cid} id={cid} />
        ))}
      </div>
    </div>
  );
}
```

```tsx
// OutlineDemo.tsx
"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/state/store";
import { initPathHelpers } from "@/lib/path";
import { nanoid } from "nanoid";
import { Node } from "./Node";

export default function OutlineDemo() {
  const st = useStore();
  useEffect(() => {
    initPathHelpers();
  }, []);

  function seedIfEmpty() {
    if (Object.keys(st.blocks).length) return;
    // Seed root headings
    const a = st.addBlock({ type: "heading", title: "Cities", parentId: null });
    const t = st.addBlock({ type: "heading", title: "Trading", parentId: null });
    const tokyo = st.addBlock({ type: "heading", title: "Tokyo", parentId: a as any });
    const strat = st.addBlock({ type: "heading", title: "Strategies", parentId: t as any });
    st.addBlock({ type: "todo", title: "Café crawl", parentId: tokyo as any });
    st.addBlock({ type: "heading", title: "Volume-Profile", parentId: strat as any });
  }

  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <div>
      <div className="mb-3 text-sm text-neutral-400">
        Click nodes to select. Use the arrows on the right to outdent/indent. The capture/refile
        demos will act on the selected node.
      </div>
      <div>
        {st.rootOrder.map((id) => (
          <Node key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
```

### 9) `components/_vision/SlicesDemo.tsx`

```tsx
"use client";
import { useMemo, useState } from "react";
import { compileDSL, rowsFromStore } from "@/lib/dsl";
import { useStore } from "@/lib/state/store";

export default function SlicesDemo() {
  const [dsl, setDsl] = useState("path:/Cities/* AND prop.category=coffee");
  const [cols, setCols] = useState<string[]>(["title", "path", "type"]);
  const st = useStore();

  const rows = useMemo(() => rowsFromStore(), [st.blocks, st.props, st.children, st.rootOrder]);
  const filter = useMemo(() => compileDSL(dsl), [dsl]);
  const data = rows.filter(filter);

  function toggleCol(c: string) {
    setCols((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          className="bg-neutral-800 p-2 rounded w-[600px]"
          value={dsl}
          onChange={(e) => setDsl(e.target.value)}
        />
        <button
          className="rounded border px-3 py-1"
          onClick={() => setCols(["title", "path", "type"])}
        >
          Reset Columns
        </button>
      </div>
      <div className="text-sm text-neutral-400">
        Columns:
        {["title", "path", "type", "prop.category", "prop.visited", "prop.risk_reward"].map((c) => (
          <label key={c} className="ml-2">
            <input type="checkbox" checked={cols.includes(c)} onChange={() => toggleCol(c)} />{" "}
            <span className="ml-1">{c}</span>
          </label>
        ))}
      </div>
      <table className="w-full text-sm border border-neutral-800">
        <thead className="bg-neutral-900">
          <tr>
            {cols.map((c) => (
              <th key={c} className="text-left p-2 border-b border-neutral-800">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
              {cols.map((c) => {
                if (c === "title")
                  return (
                    <td key={c} className="p-2">
                      {r.title}
                    </td>
                  );
                if (c === "path")
                  return (
                    <td key={c} className="p-2">
                      {r.path}
                    </td>
                  );
                if (c === "type")
                  return (
                    <td key={c} className="p-2">
                      {r.type}
                    </td>
                  );
                if (c.startsWith("prop."))
                  return <PropCell key={c} rowId={r.id} propKey={c.slice(5)} />;
                return (
                  <td key={c} className="p-2">
                    —
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-neutral-500">{data.length} rows</div>
    </div>
  );
}

function PropCell({ rowId, propKey }: { rowId: string; propKey: string }) {
  const props = useStore((s) => s.props);
  const upsertProp = useStore((s) => s.upsertProp);
  const st = useStore();
  const existing = Object.values(props).find((p) => p.blockId === rowId && p.key === propKey);
  const val =
    existing?.value.kind === "string"
      ? existing.value.s
      : existing?.value.kind === "number"
        ? String(existing.value.n)
        : existing?.value.kind === "boolean"
          ? String(existing.value.b)
          : existing?.value.kind === "date"
            ? existing.value.d
            : existing?.value.kind === "datetime"
              ? existing.value.t
              : "";

  return (
    <td className="p-2">
      <input
        className="bg-neutral-800 p-1 rounded w-full"
        defaultValue={val}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v === "") return;
          const num = Number(v);
          if (!Number.isNaN(num)) upsertProp(rowId, propKey, { kind: "number", n: num });
          else if (v === "true" || v === "false")
            upsertProp(rowId, propKey, { kind: "boolean", b: v === "true" });
          else upsertProp(rowId, propKey, { kind: "string", s: v });
        }}
      />
    </td>
  );
}
```

### 10) `components/_vision/AgendaDemo.tsx`

```tsx
"use client";
import { useMemo } from "react";
import { useStore } from "@/lib/state/store";

function isReady(blockId: string): boolean {
  const st = useStore.getState();
  const b = st.blocks[blockId];
  if (!b || b.type !== "todo") return false;
  const status = Object.values(st.props).find((p) => p.blockId === blockId && p.key === "status");
  if (status?.value.kind === "string" && status.value.s === "done") return false;
  const sched = Object.values(st.props).find(
    (p) => p.blockId === blockId && p.key === "scheduled_at"
  );
  if (sched?.value.kind === "datetime" && new Date(sched.value.t) > new Date()) return false;
  return true;
}

function score(blockId: string): number {
  const st = useStore.getState();
  const due = Object.values(st.props).find((p) => p.blockId === blockId && p.key === "due_at");
  let s = 0;
  if (due?.value.kind === "datetime") {
    const d = new Date(due.value.t).getTime() - Date.now();
    s += d < 0 ? 100 : d < 86400000 ? 80 : d < 3 * 86400000 ? 60 : 30;
  }
  if (isReady(blockId)) s += 10;
  return s;
}

export default function AgendaDemo() {
  const st = useStore();
  const todos = useMemo(
    () => Object.values(st.blocks).filter((b) => b.type === "todo"),
    [st.blocks]
  );
  const rows = useMemo(
    () =>
      todos
        .map((b) => ({ id: b.id, title: b.title ?? "", ready: isReady(b.id), score: score(b.id) }))
        .sort((a, b) => b.score - a.score),
    [todos, st.props]
  );

  return (
    <div className="space-y-3">
      <div className="text-sm text-neutral-400">Demo scoring: due urgency + ready bonus.</div>
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
                  <span className="text-ok-500">Ready</span>
                ) : (
                  <span className="text-neutral-500">—</span>
                )}
              </td>
              <td className="p-2">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 11) Wire vision routes

`app/_vision/capture/page.tsx`

```tsx
import CaptureDemo from "@/components/_vision/CaptureDemo";
import { initPathHelpers } from "@/lib/path";

export default function Page() {
  initPathHelpers();
  return <CaptureDemo />;
}
```

`app/_vision/refile/page.tsx`

```tsx
import RefileDemo from "@/components/_vision/RefileDemo";
import OutlineDemo from "@/components/_vision/OutlineDemo";
import { initPathHelpers } from "@/lib/path";

export default function Page() {
  initPathHelpers();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-2">Select a node (Outline)</h3>
        <OutlineDemo />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Refile</h3>
        <RefileDemo />
      </div>
    </div>
  );
}
```

`app/_vision/outline/page.tsx`

```tsx
import OutlineDemo from "@/components/_vision/OutlineDemo";
import { initPathHelpers } from "@/lib/path";
export default function Page() {
  initPathHelpers();
  return <OutlineDemo />;
}
```

`app/_vision/slices/page.tsx`

```tsx
import SlicesDemo from "@/components/_vision/SlicesDemo";
import { initPathHelpers } from "@/lib/path";
export default function Page() {
  initPathHelpers();
  return <SlicesDemo />;
}
```

`app/_vision/agenda/page.tsx`

```tsx
import AgendaDemo from "@/components/_vision/AgendaDemo";
import { initPathHelpers } from "@/lib/path";
export default function Page() {
  initPathHelpers();
  return <AgendaDemo />;
}
```

---

## QA — Acceptance Checklist

- [ ] **Capture**: Enter `t Café crawl #Cities/Tokyo @errands prop.category=coffee due 2026-05-01 at 09:30` → creates a **todo** under `#/Cities/Tokyo` with tags and props visible in Slices.
- [ ] **Refile**: Select a node in the Outline panel, search for an existing header and “Refile here” OR enter a new `#Path` and “Refile to Path” → node moves; path created if needed.
- [ ] **Outline**: Indent/outdent via inline buttons (and verify selection follows). New seed loads if empty.
- [ ] **Slices**: DSL `path:/Cities/* AND prop.category=coffee` filters rows correctly; edit a prop inline and see it persist; toggle columns.
- [ ] **Agenda**: Ready/score update when you add/remove `scheduled_at` or `due_at` props on a task.
- [ ] **Persistence**: Refresh the page—data is still there (Zustand persist).

**Stretch**

- [ ] Keyboard shortcuts: open Capture with ⌘/Ctrl+Enter; open Refile with `M` (if wired).
- [ ] Virtualized outline/table remain smooth with 800+ nodes/rows (optional).

---

## Orchestrator Prompt (parallel agents)

```text
You are the coordinator for **Project Cortex — Push 1.03 (Interactive Vision)**. Spawn agents (Web, UI/UX, Store, QA) to implement EXACTLY the files and contents provided in this spec.

Branch: `push/01-03-interactive-vision`

Tasks:
1) Add dependencies: zustand, immer, fuse.js, nanoid, date-fns, @tanstack/react-virtual.
2) Create files under lib/ and components/_vision/ with the EXACT contents in this doc.
3) Replace the `/_vision/*` pages with the wiring shown here.
4) Run the QA checklist and attach screenshots/gifs in the PR.

Notes:
- No backend or Dexie in this push; persistence via zustand/middleware persist (localStorage).
- If project has existing conflicting code under these paths, prefer this spec and refactor as needed.

Deliverables:
- Branch with the new store and interactive demos working.
- QA checklist marked complete with evidence.
```
