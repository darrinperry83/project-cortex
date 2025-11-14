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
