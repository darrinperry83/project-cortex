import { db } from "./dexie";
import type { Block } from "./types";

/**
 * Converts a title to a URL-safe slug
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Builds a hierarchical path for a block by walking up its ancestors
 * @param blockId The block ID to build the path for
 * @returns A path string like "#/Cities/Tokyo"
 */
export async function buildPath(blockId: string): Promise<string> {
  const path: string[] = [];
  let currentId: string | null = blockId;

  while (currentId) {
    const block: Block | undefined = await db.blocks.get(currentId);
    if (!block) break;

    // Only include blocks with titles in the path
    if (block.title) {
      path.unshift(slugify(block.title));
    }

    currentId = block.parentId;
  }

  return "#/" + path.join("/");
}

/**
 * Parses a path string into an array of slugs
 * @param path Path string like "#/Cities/Tokyo" or "#Cities/Tokyo"
 * @returns Array of slugs like ["Cities", "Tokyo"]
 */
export function parsePathString(path: string): string[] {
  // Remove leading # and / characters
  const cleanPath = path.replace(/^#?\/?/, "");

  // Split on / and filter out empty strings
  return cleanPath.split("/").filter((part) => part.length > 0);
}

/**
 * Ensures a path exists by creating missing heading blocks
 * Creates blocks as needed and returns the ID of the final block in the path
 * @param path Path string like "#/Cities/Tokyo"
 * @returns The block ID of the final block in the path
 */
export async function ensurePath(path: string): Promise<string> {
  const parts = parsePathString(path);

  if (parts.length === 0) {
    throw new Error("Invalid path: path is empty");
  }

  let currentParentId: string | null = null;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const slug = slugify(part);

    // Try to find existing block with this title under current parent
    // Note: Need to filter manually since Dexie doesn't support null in equals()
    const candidateBlocks: Block[] =
      currentParentId === null
        ? await db.blocks.filter((b) => b.parentId === null).toArray()
        : await db.blocks.where("parentId").equals(currentParentId).toArray();

    let block: Block | undefined = candidateBlocks.find(
      (b: Block) => b.title && slugify(b.title) === slug
    );

    if (!block) {
      // Create new heading block
      const now = new Date().toISOString();

      // Get the current max sort value for siblings
      const siblings =
        currentParentId === null
          ? await db.blocks.filter((b) => b.parentId === null).toArray()
          : await db.blocks.where("parentId").equals(currentParentId).toArray();
      const maxSort = siblings.reduce((max, b) => Math.max(max, b.sort), -1);

      const newBlock: Block = {
        id: crypto.randomUUID(),
        parentId: currentParentId,
        type: "heading",
        title: part, // Use original casing from path
        level: i + 1, // Level starts at 1 for root
        sort: maxSort + 1,
        tags: [],
        createdAt: now,
        updatedAt: now,
      };

      await db.blocks.add(newBlock);
      block = newBlock;
    }

    currentParentId = block.id;
  }

  return currentParentId!;
}
