import Dexie, { Table } from "dexie";

export type BlockType = "heading" | "todo" | "paragraph";

export interface Block {
  id: string; // nanoid
  parentId: string | null;
  type: BlockType;
  title?: string;
  content?: string;
  level: number; // denormalized for quick render
  sort: number; // sibling sort (ascending)
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type PropKind = "string" | "number" | "boolean" | "date" | "datetime" | "taglist" | "json";

export interface Prop {
  id: string;
  blockId: string;
  key: string; // normalized (lowercase, dash)
  label: string; // display label as entered
  kind: PropKind;
  s?: string;
  n?: number;
  b?: boolean;
  d?: string;
  t?: string;
  j?: any;
}

export class CortexDexie extends Dexie {
  blocks!: Table<Block, string>;
  props!: Table<Prop, string>;

  constructor() {
    super("cortex");
    this.version(1).stores({
      blocks: "id, parentId, type, level, sort, title",
      props: "id, blockId, key",
    });
  }
}

export const db = new CortexDexie();
