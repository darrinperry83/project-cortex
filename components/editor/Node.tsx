"use client";
import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/dexie";
import { indentBlock, outdentBlock, toggleTodo, updateBlock } from "@/lib/db/blocks";
import { PropertyChips } from "./PropertyChips";

export function Node({ id }: { id: string }) {
  const block = useLiveQuery(() => db.blocks.get(id), [id]);
  const children =
    useLiveQuery(() => db.blocks.where("parentId").equals(id).sortBy("sort"), [id]) ?? [];

  if (!block) return null;

  async function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!block) return;
    await updateBlock(block.id, { title: e.target.value });
  }

  return (
    <div className="pl-2">
      <div className="flex items-center gap-2 py-1 hover:bg-neutral-900 rounded px-1">
        {block.type === "todo" ? (
          <input type="checkbox" aria-label="Toggle todo" onChange={() => toggleTodo(block.id)} />
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}
        <input
          className="bg-transparent outline-none flex-1"
          value={block.title ?? ""}
          onChange={onTitleChange}
          placeholder={block.type === "heading" ? "Heading" : "Text"}
        />
        <div className="ml-auto text-xs text-neutral-500">
          <button className="px-1" onClick={() => indentBlock(block.id)}>
            →
          </button>
          <button className="px-1" onClick={() => outdentBlock(block.id)}>
            ←
          </button>
        </div>
      </div>
      <div className="pl-5">
        <PropertyChips blockId={block.id} />
        {children.map((c) => (
          <Node key={c.id} id={c.id} />
        ))}
      </div>
    </div>
  );
}
