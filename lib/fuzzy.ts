import Fuse from "fuse.js";
import { db } from "./db/dexie";

export async function searchHeaders(query: string) {
  const items = await db.blocks.filter((b) => b.type === "heading" || b.type === "todo").toArray();
  const fuse = new Fuse(items, { keys: ["title"], threshold: 0.3, ignoreLocation: true });
  return fuse.search(query).map((r) => r.item);
}
