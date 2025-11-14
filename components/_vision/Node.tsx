// Node.tsx
"use client";
import { useStore } from "@/lib/state/store";

export function Node({ id }: { id: string }) {
  const b = useStore((s) => s.blocks[id]);
  const kids = useStore((s) => s.children[id] ?? []);
  const setSel = useStore((s) => s.setSelection);
  const indent = useStore((s) => s.indentBlock);
  const outdent = useStore((s) => s.outdentBlock);
  const toggle = useStore((s) => s.toggleTodo);

  if (!b) return null;
  return (
    <div className="pl-2">
      <div
        className="flex items-center gap-2 py-0.5 hover:bg-neutral-900 rounded px-1"
        onClick={() => setSel(id)}
      >
        {b.type === "todo" ? (
          <input type="checkbox" onChange={() => toggle(id)} aria-label="Toggle todo" />
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}
        <span className="text-neutral-200">{b.title ?? b.content}</span>
        <span className="text-xs text-neutral-500 ml-2">({b.type})</span>
        <div className="ml-auto text-xs text-neutral-500">
          <button
            className="px-1"
            onClick={(e) => {
              e.stopPropagation();
              indent(id);
            }}
          >
            →
          </button>
          <button
            className="px-1"
            onClick={(e) => {
              e.stopPropagation();
              outdent(id);
            }}
          >
            ←
          </button>
        </div>
      </div>
      <div className="pl-4 border-l border-neutral-800">
        {kids.map((cid) => (
          <Node key={cid} id={cid} />
        ))}
      </div>
    </div>
  );
}
