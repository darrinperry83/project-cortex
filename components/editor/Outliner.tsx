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
