"use client";
import Outliner from "./Outliner";
import { CaptureOverlay } from "./CaptureOverlay";
import { useState } from "react";
import { RefileDialog } from "./RefileDialog";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { addBlock } from "@/lib/db/blocks";

export default function Editor() {
  const [_showRefileFor, _setShowRefileFor] = useState<string | null>(null);
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
        {_showRefileFor && <RefileDialog targetId={_showRefileFor} />}
      </div>
      <Outliner />
    </section>
  );
}
