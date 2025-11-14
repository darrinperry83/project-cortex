import { db } from "./dexie";
import { ensurePath } from "./path";
import type { Prop } from "./types";

/**
 * Refiles a block to a new location in the outline
 * @param blockId The ID of the block to refile
 * @param targetPath The target path (e.g., "#/Cities/Tokyo")
 * @param mode 'move' to change parentId, 'anchor' to add a property hint
 */
export async function refile(
  blockId: string,
  targetPath: string,
  mode: "move" | "anchor"
): Promise<void> {
  const block = await db.blocks.get(blockId);
  if (!block) {
    throw new Error(`Block with id ${blockId} not found`);
  }

  // Ensure the target path exists and get the final block ID
  const targetBlockId = await ensurePath(targetPath);

  if (mode === "move") {
    // Move mode: change the block's parentId to the target
    await db.transaction("rw", db.blocks, async () => {
      // Get siblings at the target location to determine sort order
      const siblings = await db.blocks.where("parentId").equals(targetBlockId).toArray();

      const maxSort = siblings.reduce((max, b) => Math.max(max, b.sort), -1);

      // Update the block
      await db.blocks.update(blockId, {
        parentId: targetBlockId,
        sort: maxSort + 1,
        updatedAt: new Date().toISOString(),
      });
    });
  } else if (mode === "anchor") {
    // Anchor mode: add a property hint for future use
    // This allows the block to stay in its current location but reference another location
    await db.transaction("rw", db.props, async () => {
      // Check if an anchor property already exists
      const existingAnchor = await db.props
        .where("blockId")
        .equals(blockId)
        .and((p) => p.key === "_anchor")
        .first();

      if (existingAnchor) {
        await db.props.update(existingAnchor.id, {
          s: targetPath,
        });
      } else {
        const anchorProp: Prop = {
          id: crypto.randomUUID(),
          blockId,
          key: "_anchor",
          kind: "string",
          s: targetPath,
        };
        await db.props.add(anchorProp);
      }
    });

    // Update the block's updatedAt timestamp
    await db.blocks.update(blockId, {
      updatedAt: new Date().toISOString(),
    });
  } else {
    throw new Error(`Invalid refile mode: ${mode}`);
  }
}

/**
 * Gets the anchor path for a block if it has one
 * @param blockId The block ID
 * @returns The anchor path or null if no anchor exists
 */
export async function getAnchorPath(blockId: string): Promise<string | null> {
  const anchorProp = await db.props
    .where("blockId")
    .equals(blockId)
    .and((p) => p.key === "_anchor")
    .first();

  return anchorProp?.s ?? null;
}

/**
 * Removes an anchor from a block
 * @param blockId The block ID
 */
export async function removeAnchor(blockId: string): Promise<void> {
  const anchorProp = await db.props
    .where("blockId")
    .equals(blockId)
    .and((p) => p.key === "_anchor")
    .first();

  if (anchorProp) {
    await db.props.delete(anchorProp.id);
    await db.blocks.update(blockId, {
      updatedAt: new Date().toISOString(),
    });
  }
}
