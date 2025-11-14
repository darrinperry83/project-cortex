import { useStore } from "./state/store";

export type Row = {
  id: string;
  title: string;
  type: string;
  path: string;
  tags: string[];
  props: Record<string, unknown>;
};

export function compileDSL(dsl: string): (_row: Row) => boolean {
  const clauses = dsl
    .split(/\s+AND\s+/i)
    .map((c) => c.trim())
    .filter(Boolean);

  return (row: Row) => {
    for (const c of clauses) {
      // path:/A/*, type:todo, tag:coffee, prop.key=value
      const m = c.match(/^(\w[\w.]*?)\s*[:=]\s*(.+)$/);
      if (!m) continue;
      const key = m[1],
        val = m[2];
      if (key === "path") {
        const pat = val.replace(/^\/?/, "");
        const rx = new RegExp(
          "^" + pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("\\*", ".*") + "$",
          "i"
        );
        if (!rx.test(row.path.replace(/^#\//, ""))) return false;
      } else if (key === "type") {
        if (row.type.toLowerCase() !== val.toLowerCase()) return false;
      } else if (key === "tag") {
        if (!row.tags.map((t) => t.toLowerCase()).includes(val.toLowerCase())) return false;
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

export function rowsFromStore(scope?: { rootBlockId?: string }) {
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
  return collect.map((id) => {
    const b = st.blocks[id];
    const props: Record<string, unknown> = {};
    Object.values(st.props).forEach((p) => {
      if (p.blockId === id) {
        if (p.value.kind === "string") props[p.key] = p.value.s;
        else if (p.value.kind === "number") props[p.key] = p.value.n;
        else if (p.value.kind === "boolean") props[p.key] = p.value.b;
        else if (p.value.kind === "date") props[p.key] = p.value.d;
        else if (p.value.kind === "datetime") props[p.key] = p.value.t;
        else if (p.value.kind === "taglist") props[p.key] = p.value.s;
        else if (p.value.kind === "json") props[p.key] = p.value.j;
      }
    });
    return {
      id,
      title: b.title ?? "",
      type: b.type,
      path: useStore.getState().buildPath(id),
      tags: b.tags,
      props,
    };
  });
}

// Backward compatibility for Push 1.01
export function parseDSL(dsl: string) {
  return compileDSL(dsl);
}

export function applyDSL(dsl: string, blocks?: any[], props?: any[]): any[] {
  // If blocks are provided (old Dexie-based code), convert them to Rows and filter
  if (blocks && blocks.length > 0) {
    const st = useStore.getState();
    const rows = blocks.map((b: any) => {
      const blockProps: Record<string, unknown> = {};
      if (props) {
        props
          .filter((p) => p.blockId === b.id)
          .forEach((p) => {
            if (p.kind === "string") blockProps[p.key] = p.s;
            else if (p.kind === "number") blockProps[p.key] = p.n;
            else if (p.kind === "boolean") blockProps[p.key] = p.b;
            else if (p.kind === "date") blockProps[p.key] = p.d;
            else if (p.kind === "datetime") blockProps[p.key] = p.t;
            else if (p.kind === "taglist") blockProps[p.key] = p.s;
            else if (p.kind === "json") blockProps[p.key] = p.j;
          });
      }
      return {
        id: b.id,
        title: b.title ?? "",
        type: b.type,
        path: st.buildPath ? st.buildPath(b.id) : "",
        tags: b.tags ?? [],
        props: blockProps,
      };
    });
    const filter = compileDSL(dsl);
    const filtered = rows.filter(filter);
    // Convert back to blocks for backward compatibility
    return filtered.map((row) => blocks.find((b) => b.id === row.id)).filter(Boolean);
  }

  // Otherwise use the store (new Zustand-based code)
  const filter = compileDSL(dsl);
  const rows = rowsFromStore();
  return rows.filter(filter);
}
