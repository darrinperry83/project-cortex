"use client";
import { useMemo, useState } from "react";
import { compileDSL, rowsFromStore } from "@/lib/dsl";
import { useStore } from "@/lib/state/store";

export default function SlicesDemo() {
  const [dsl, setDsl] = useState("path:/Cities/* AND prop.category=coffee");
  const [cols, setCols] = useState<string[]>(["title", "path", "type"]);
  const st = useStore();

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
