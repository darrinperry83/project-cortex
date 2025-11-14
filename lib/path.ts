import { useStore } from "./state/store";
import { nanoid } from "nanoid";

function slugify(x: string) {
  return x
    .trim()
    .replace(/[/#?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function initPathHelpers() {
  const set = useStore.setState;
  set({
    ensurePath: (path: string) => {
      // path like "#/A/B/C" or "#A/B/C" or "A/B/C"
      const clean = path.replace(/^#?\/?/, "");
      const parts = clean.split("/").map(slugify).filter(Boolean);
      let parentId: string | null = null;
      const state = useStore.getState();
      for (const part of parts) {
        // find child with same title under parent
        const children = parentId ? (state.children[parentId] ?? []) : state.rootOrder;
        let found: string | undefined;
        for (const id of children) {
          const b = state.blocks[id];
          if (b?.title?.toLowerCase() === part.toLowerCase()) {
            found = id;
            break;
          }
        }
        if (found) {
          parentId = found;
          continue;
        }
        // create new heading
        const id = nanoid();
        const level = parentId ? (state.blocks[parentId]?.level ?? 0) + 1 : 1;
        state.blocks[id] = {
          id,
          parentId,
          type: "heading",
          title: part,
          content: "",
          level,
          sort: 0,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
        const b: (typeof st.blocks)[string] | undefined = st.blocks[cur];
        if (!b) break;
        if (b.title) names.push(b.title);
        cur = b.parentId;
      }
      return "#/" + names.reverse().join("/");
    },
  } as any);
}

// Backward compatibility exports for Push 1.01 components
export { slugify };

export function buildPath(blockId: string): string {
  return useStore.getState().buildPath(blockId);
}

export function ensurePath(path: string): string {
  return useStore.getState().ensurePath(path);
}

export function parsePathString(path: string): string[] {
  const clean = path.replace(/^#?\/?/, "");
  return clean.split("/").map(slugify).filter(Boolean);
}
