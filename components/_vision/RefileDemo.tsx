"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/state/store";
import { Block } from "@/lib/state/store";

export default function RefileDemo() {
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("#Cities/Tokyo");
  const [mode, setMode] = useState<"drop" | "anchor">("drop");
  const [results, setResults] = useState<Block[]>([]);
  const ensurePath = useStore((s) => s.ensurePath);
  const moveBlock = useStore((s) => s.moveBlock);
  const selection = useStore((s) => s.selection);
  const buildPath = useStore((s) => s.buildPath);
  const blocks = useStore((s) => s.blocks);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const items = Object.values(blocks).filter(
      (b) =>
        (b.type === "heading" || b.type === "todo") &&
        b.title?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(items);
  }, [query, blocks]);

  function refileToExisting(id: string) {
    if (!selection) return;
    moveBlock(selection, id);
    alert(`Moved under ${buildPath(id)} (${mode})`);
  }
  function refileToPath() {
    if (!selection) return;
    const id = ensurePath(path);
    moveBlock(selection, id);
    alert(`Moved under ${buildPath(id)} (${mode})`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm text-neutral-400">Find header</label>
        <input
          className="bg-neutral-800 p-2 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        <span className="text-neutral-500">or</span>
        <input
          className="bg-neutral-800 p-2 rounded w-72"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="#A/B/C (creates path)"
        />
        <button className="rounded bg-brand-600 px-3 py-1" onClick={refileToPath}>
          Refile to Path
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label>
          <input type="radio" checked={mode === "drop"} onChange={() => setMode("drop")} />{" "}
          <span className="ml-1">Drop here</span>
        </label>
        <label>
          <input type="radio" checked={mode === "anchor"} onChange={() => setMode("anchor")} />{" "}
          <span className="ml-1">Anchor as subproject</span>
        </label>
      </div>

      {results.length > 0 && (
        <div className="rounded border border-neutral-800 p-2">
          <div className="text-sm text-neutral-400 mb-1">Search results</div>
          <ul className="space-y-1">
            {results.map((b) => (
              <li key={b.id} className="flex items-center justify-between">
                <span>{b.title}</span>
                <button className="text-brand-500 underline" onClick={() => refileToExisting(b.id)}>
                  Refile here
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
