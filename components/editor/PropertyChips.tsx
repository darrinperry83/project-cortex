/* eslint-disable react/prop-types */
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { upsertProp } from "@/lib/db/blocks";

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
