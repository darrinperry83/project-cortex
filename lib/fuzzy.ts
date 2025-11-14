import Fuse from "fuse.js";
import { useStore } from "./state/store";

export function searchHeaders(query: string) {
  const st = useStore.getState();
  const items = Object.values(st.blocks).filter((b) => b.type === "heading" || b.type === "todo");
  const fuse = new Fuse(items, { keys: ["title"], threshold: 0.3, ignoreLocation: true });
  return fuse.search(query).map((r) => r.item);
}
