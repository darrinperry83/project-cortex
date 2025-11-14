import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { produce } from "immer";
import { formatISO } from "date-fns";

export type BlockType = "heading" | "todo" | "paragraph" | "view";

export type PropKind = "string" | "number" | "boolean" | "date" | "datetime" | "taglist" | "json";

export type PropValue =
  | { kind: "string"; s: string }
  | { kind: "number"; n: number }
  | { kind: "boolean"; b: boolean }
  | { kind: "date"; d: string } // YYYY-MM-DD
  | { kind: "datetime"; t: string } // ISO
  | { kind: "taglist"; s: string } // comma-separated
  | { kind: "json"; j: unknown };

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
  key: string; // normalized (slugified)
  label: string; // original label
  value: PropValue;
}

export interface Slice {
  id: string;
  name: string;
  scope: { kind: "global" } | { kind: "subtree"; rootBlockId: string };
  dsl: string;
  columns: string[];
  sort?: { by: string; dir: "asc" | "desc" } | null;
}

export interface State {
  blocks: Record<string, Block>;
  props: Record<string, Prop>;
  slices: Record<string, Slice>;
  rootOrder: string[]; // top-level block ids (siblings ordered)
  children: Record<string, string[]>; // parentId -> ordered children ids
  selection: string | null; // selected block for vision pages

  // CRUD
  addBlock(
    _input: Partial<Block> & {
      type: BlockType;
      title?: string;
      content?: string;
      parentId?: string | null;
    }
  ): string;
  updateBlock(_id: string, _patch: Partial<Block>): void;
  removeBlock(_id: string): void;

  // Outline ops
  setSelection(_id: string | null): void;
  moveBlock(_id: string, _newParentId: string | null, _newIndex?: number): void;
  indentBlock(_id: string): void;
  outdentBlock(_id: string): void;
  toggleTodo(_id: string): void;

  // Props
  upsertProp(_blockId: string, _label: string, _value: PropValue): void;
  removeProp(_blockId: string, _key: string): void;

  // Slices
  saveSlice(_s: Omit<Slice, "id"> & { id?: string }): string;

  // Path helpers (set by path.ts at runtime)
  ensurePath: (_path: string) => string; // returns deepest blockId
  buildPath: (_blockId: string) => string;
}

const now = () => formatISO(new Date());

function pushChild(state: State, parentId: string | null, id: string, atIndex?: number) {
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

function removeChild(state: State, parentId: string | null, id: string) {
  const arr = parentId ? (state.children[parentId] ?? []) : state.rootOrder;
  const idx = arr.indexOf(id);
  if (idx >= 0) arr.splice(idx, 1);
}

export const useStore = create<State>()(
  persist(
    (set, _get) => ({
      blocks: {},
      props: {},
      slices: {},
      rootOrder: [],
      children: {},
      selection: null,
      ensurePath: () => {
        throw new Error("ensurePath not initialized");
      },
      buildPath: () => "#/",

      addBlock: (input) => {
        const id = nanoid();
        set(
          produce<State>((s) => {
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
              updatedAt: now(),
            };
            pushChild(s, parentId, id);
            s.selection = id;
          })
        );
        return id;
      },

      updateBlock: (id, patch) =>
        set(
          produce<State>((s) => {
            const b = s.blocks[id];
            if (!b) return;
            Object.assign(b, patch);
            b.updatedAt = now();
          })
        ),

      removeBlock: (id) =>
        set(
          produce<State>((s) => {
            const b = s.blocks[id];
            if (!b) return;
            // remove subtree recursively
            const stack = [id];
            while (stack.length) {
              const cur = stack.pop()!;
              const kids = s.children[cur] ?? [];
              stack.push(...kids);
              delete s.children[cur];
              Object.values(s.props).forEach((p) => {
                if (p.blockId === cur) delete s.props[p.id];
              });
              delete s.blocks[cur];
            }
            removeChild(s, b.parentId, id);
          })
        ),

      setSelection: (id) => set({ selection: id }),

      moveBlock: (id, newParentId, newIndex) =>
        set(
          produce<State>((s) => {
            const b = s.blocks[id];
            if (!b) return;
            removeChild(s, b.parentId, id);
            b.parentId = newParentId;
            b.level = newParentId ? (s.blocks[newParentId]?.level ?? 0) + 1 : 1;
            pushChild(s, newParentId, id, newIndex);
            b.updatedAt = now();
          })
        ),

      indentBlock: (id) =>
        set(
          produce<State>((s) => {
            const b = s.blocks[id];
            if (!b) return;
            const siblings = b.parentId ? (s.children[b.parentId] ?? []) : s.rootOrder;
            const idx = siblings.indexOf(id);
            if (idx <= 0) return;
            const newParentId = siblings[idx - 1];
            removeChild(s, b.parentId, id);
            b.parentId = newParentId;
            b.level = (s.blocks[newParentId]?.level ?? 0) + 1;
            pushChild(s, newParentId, id);
            b.updatedAt = now();
          })
        ),

      outdentBlock: (id) =>
        set(
          produce<State>((s) => {
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
          })
        ),

      toggleTodo: (id) =>
        set(
          produce<State>((s) => {
            const b = s.blocks[id];
            if (!b || b.type !== "todo") return;
            // status is a property "status": string
            const existing = Object.values(s.props).find(
              (p) => p.blockId === id && p.key === "status"
            );
            const value =
              existing?.value.kind === "string" && existing.value.s === "done"
                ? ({ kind: "string", s: "todo" } as PropValue)
                : ({ kind: "string", s: "done" } as PropValue);
            if (existing) existing.value = value;
            else {
              const pid = nanoid();
              s.props[pid] = { id: pid, blockId: id, key: "status", label: "status", value };
            }
            b.updatedAt = now();
          })
        ),

      upsertProp: (blockId, label, value) =>
        set(
          produce<State>((s) => {
            const key = label.trim().toLowerCase().replace(/\s+/g, "-");
            const existing = Object.values(s.props).find(
              (p) => p.blockId === blockId && p.key === key
            );
            if (existing) {
              existing.value = value;
              return;
            }
            const id = nanoid();
            s.props[id] = { id, blockId, key, label, value };
          })
        ),

      removeProp: (blockId, key) =>
        set(
          produce<State>((s) => {
            Object.values(s.props).forEach((p) => {
              if (p.blockId === blockId && p.key === key) delete s.props[p.id];
            });
          })
        ),

      saveSlice: (sli) => {
        const id = sli.id ?? nanoid();
        set(
          produce<State>((s) => {
            s.slices[id] = { id, ...sli, sort: sli.sort ?? null };
          })
        );
        return id;
      },
    }),
    { name: "cortex-vision-store" }
  )
);
