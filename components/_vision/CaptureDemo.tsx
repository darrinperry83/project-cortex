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
    alert(`Created: ${res.title}\nPath: ${parent ? buildPath(parent) : "(root)"}`);
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="rounded border px-3 py-1">
        Open Capture
      </button>
    );
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-[640px] rounded-md bg-neutral-900 p-6 border border-neutral-700 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-neutral-100">Capture</h3>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="t Title #Path/Sub due 2026-05-01 @tag prop.key=value"
          className="w-full bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 p-3 rounded outline-none border border-neutral-700 focus:border-blue-500 transition-colors"
          spellCheck={false}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded border border-neutral-600 px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 transition-colors font-medium"
            onClick={submit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
