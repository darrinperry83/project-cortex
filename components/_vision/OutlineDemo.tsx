// OutlineDemo.tsx
"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/state/store";
import { initPathHelpers } from "@/lib/path";
import { Node } from "./Node";

export default function OutlineDemo() {
  const st = useStore();
  useEffect(() => {
    initPathHelpers();
  }, []);

  function seedIfEmpty() {
    if (Object.keys(st.blocks).length) return;
    // Seed root headings
    const a = st.addBlock({ type: "heading", title: "Cities", parentId: null });
    const t = st.addBlock({ type: "heading", title: "Trading", parentId: null });
    const tokyo = st.addBlock({ type: "heading", title: "Tokyo", parentId: a as any });
    const strat = st.addBlock({ type: "heading", title: "Strategies", parentId: t as any });
    st.addBlock({ type: "todo", title: "Café crawl", parentId: tokyo as any });
    st.addBlock({ type: "heading", title: "Volume-Profile", parentId: strat as any });
  }

  useEffect(() => {
    seedIfEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-3 text-sm text-neutral-400">
        Click nodes to select. Use the arrows on the right to outdent/indent. The capture/refile
        demos will act on the selected node.
      </div>
      <div>
        {st.rootOrder.map((id) => (
          <Node key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
