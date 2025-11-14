"use client";
import { db, Block, BlockType, Prop } from "./dexie";
import { nanoid } from "nanoid";

const now = () => new Date().toISOString();

export async function addBlock(input: {
  parentId: string | null;
  type: BlockType;
  title?: string;
  content?: string;
  atIndex?: number;
}) {
  const { parentId, type, title, content, atIndex } = input;
  return db.transaction("rw", db.blocks, async () => {
    const level = parentId ? ((await db.blocks.get(parentId))?.level ?? 0) + 1 : 1;
    const id = nanoid();
    const sort = atIndex ?? (await nextSort(parentId));
    await db.blocks.add({
      id,
      parentId,
      type,
      title,
      content,
      level,
      sort,
      tags: [],
      createdAt: now(),
      updatedAt: now(),
    });
    return id;
  });
}

async function nextSort(parentId: string | null) {
  const bros = await db.blocks
    .where("parentId")
    .equals(parentId as any)
    .toArray();
  return bros.length ? Math.max(...bros.map((b) => b.sort)) + 1 : 0;
}

export async function updateBlock(id: string, patch: Partial<Block>) {
  await db.blocks.update(id, { ...patch, updatedAt: now() });
}

export async function removeBlock(id: string) {
  await db.transaction("rw", db.blocks, async () => {
    const toDelete = [id];
    for (let i = 0; i < toDelete.length; i++) {
      const cur = toDelete[i];
      const kids = await db.blocks.where("parentId").equals(cur).toArray();
      toDelete.push(...kids.map((k) => k.id));
    }
    await db.blocks.bulkDelete(toDelete);
  });
}

export async function moveBlock(id: string, newParentId: string | null, newIndex?: number) {
  await db.transaction("rw", db.blocks, async () => {
    const b = await db.blocks.get(id);
    if (!b) return;
    const parentLevel = newParentId ? ((await db.blocks.get(newParentId))?.level ?? 0) : 0;
    const sort = newIndex ?? (await nextSort(newParentId));
    await db.blocks.update(id, {
      parentId: newParentId,
      level: parentLevel + 1,
      sort,
      updatedAt: now(),
    });
  });
}

export async function indentBlock(id: string) {
  await db.transaction("rw", db.blocks, async () => {
    const b = await db.blocks.get(id);
    if (!b) return;
    const siblings = await db.blocks
      .where("parentId")
      .equals(b.parentId as any)
      .sortBy("sort");
    const idx = siblings.findIndex((x) => x.id === id);
    if (idx <= 0) return;
    const newParentId = siblings[idx - 1].id;
    await db.blocks.update(id, {
      parentId: newParentId,
      level: siblings[idx - 1].level + 1,
      sort: await nextSort(newParentId),
      updatedAt: now(),
    });
  });
}

export async function outdentBlock(id: string) {
  await db.transaction("rw", db.blocks, async () => {
    const b = await db.blocks.get(id);
    if (!b) return;
    const parent = b.parentId ? await db.blocks.get(b.parentId) : null;
    if (!parent) return;
    const grand = parent.parentId;
    const afterParentSort =
      (
        await db.blocks
          .where("parentId")
          .equals(grand as any)
          .sortBy("sort")
      ).find((p) => p.id === parent.id)?.sort ?? 0;
    await db.blocks.update(id, {
      parentId: grand,
      level: parent.level - 1 || 1,
      sort: afterParentSort + 0.1,
      updatedAt: now(),
    });
  });
}

export async function toggleTodo(id: string) {
  const status = await getProp(id, "status");
  if (!status) await upsertProp(id, "status", "string", { s: "done" });
  else if (status.s === "done") await upsertProp(id, "status", "string", { s: "todo" });
  else await upsertProp(id, "status", "string", { s: "done" });
}

export async function upsertProp(
  blockId: string,
  label: string,
  kind: Prop["kind"],
  value: Partial<Prop>
) {
  const key = label.trim().toLowerCase().replace(/\s+/g, "-");
  const existing = await db.props.where({ blockId, key }).first();
  if (existing) {
    await db.props.update(existing.id, { label, kind, ...value });
  } else {
    await db.props.add({ id: nanoid(), blockId, key, label, kind, ...value });
  }
}

export async function removeProp(blockId: string, key: string) {
  const k = key.trim().toLowerCase().replace(/\s+/g, "-");
  const hit = await db.props.where({ blockId, key: k }).first();
  if (hit) await db.props.delete(hit.id);
}

export async function getProp(blockId: string, key: string) {
  const k = key.trim().toLowerCase().replace(/\s+/g, "-");
  return db.props.where({ blockId, key: k }).first();
}

export async function ensurePath(path: string): Promise<string> {
  // path forms: "#/A/B/C", "#A/B/C", "A/B/C"
  const clean = path.replace(/^#?\/?/, "");
  const parts = clean
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);
  let parentId: string | null = null;
  for (const part of parts) {
    const existing: Block | undefined = await db.blocks
      .where({ parentId })
      .filter((b) => (b.title ?? "").toLowerCase() === part.toLowerCase())
      .first();
    if (existing) {
      parentId = existing.id;
      continue;
    }
    parentId = await addBlock({ parentId, type: "heading", title: part });
  }
  return parentId as string;
}

export async function buildPath(blockId: string): Promise<string> {
  const names: string[] = [];
  let cur: string | null = blockId;
  while (cur) {
    const b: Block | undefined = await db.blocks.get(cur);
    if (!b) break;
    if (b.title) names.push(b.title);
    cur = b.parentId;
  }
  return "#/" + names.reverse().join("/");
}
