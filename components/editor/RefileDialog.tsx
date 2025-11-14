"use client";
import { useState, useMemo } from "react";
import { ensurePath, moveBlock } from "@/lib/db/blocks";
import { searchHeaders } from "@/lib/fuzzy";

export function RefileDialog({ targetId }: { targetId: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("#");
  const [mode, _setMode] = useState<"drop" | "anchor">("drop");

  async function refileToPath() {
    const id = await ensurePath(path);
    await moveBlock(targetId, id);
    setOpen(false);
  }

  return (
    <>
      <button className="rounded border px-2 py-1" onClick={() => setOpen(true)}>
        Refile
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="w-[720px] rounded-md bg-neutral-900 p-4 border border-neutral-800">
            <h3 className="text-lg font-semibold mb-2">Refile</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                className="bg-neutral-800 p-2 rounded flex-1"
                placeholder="Search headers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="text-neutral-500">or</span>
              <input
                className="bg-neutral-800 p-2 rounded w-72"
                placeholder="#A/B/C (creates path)"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
              <button className="rounded bg-brand-600 px-3 py-1" onClick={refileToPath}>
                Refile to Path
              </button>
            </div>
            <div className="mb-3">
              <label className="mr-4">
                <input type="radio" checked={mode === "drop"} onChange={() => _setMode("drop")} />{" "}
                <span className="ml-1">Drop here</span>
              </label>
              <label>
                <input
                  type="radio"
                  checked={mode === "anchor"}
                  onChange={() => _setMode("anchor")}
                />{" "}
                <span className="ml-1">Anchor as subproject</span>
              </label>
            </div>
            <div className="max-h-64 overflow-auto rounded border border-neutral-800 p-2 text-sm">
              <Results
                query={query}
                onPick={async (id) => {
                  await moveBlock(targetId, id);
                  setOpen(false);
                }}
              />
            </div>
            <div className="mt-3 text-right">
              <button className="rounded border px-3 py-1" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Results({
  query,
  onPick,
}: {
  query: string;
  onPick: (_id: string) => void | Promise<void>;
}) {
  const [items, setItems] = useState<any[]>([]);
  useMemo(() => {
    (async () => setItems(await searchHeaders(query)))();
  }, [query]);
  if (!query) return <div className="text-neutral-500">Type to search headers…</div>;
  if (!items.length) return <div className="text-neutral-500">No matches.</div>;
  return (
    <ul className="space-y-1">
      {items.map((b) => (
        <li key={b.id} className="flex items-center justify-between">
          <span>{b.title}</span>
          <button className="text-brand-500 underline" onClick={() => onPick(b.id)}>
            Refile here
          </button>
        </li>
      ))}
    </ul>
  );
}
