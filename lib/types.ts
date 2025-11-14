export type BlockType = "heading" | "todo" | "paragraph" | "view";

export interface Block {
  id: string;
  parentId: string | null;
  noteId?: string;
  type: BlockType;
  title?: string;
  content?: string;
  level: number;
  sort: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prop {
  id: string;
  blockId: string;
  key: string;
  kind: "string" | "number" | "boolean" | "date" | "datetime" | "taglist" | "json";
  s?: string;
  n?: number;
  b?: boolean;
  d?: string;
  t?: string;
  j?: any;
}

export interface Slice {
  id: string;
  blockId: string | null;
  name: string;
  scope: "global" | { rootBlockId: string };
  dsl: string;
  columns: string[];
  sort?: { by: string; dir: "asc" | "desc" } | null;
  groupBy?: string | null;
}
