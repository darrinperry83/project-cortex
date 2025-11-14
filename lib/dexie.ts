import Dexie, { type EntityTable } from "dexie";
import type { Block, Prop, Slice } from "./types";

// Define the database schema
export class CortexDB extends Dexie {
  blocks!: EntityTable<Block, "id">;
  props!: EntityTable<Prop, "id">;
  slices!: EntityTable<Slice, "id">;

  constructor() {
    super("CortexDB");
    this.version(1).stores({
      blocks: "id, parentId, type, title, *tags, createdAt, updatedAt, sort, level",
      props: "id, blockId, key, kind",
      slices: "id, blockId, name",
    });
  }
}

// Create and export the database instance
export const db = new CortexDB();

/**
 * Seeds the database with initial data from seed-outline.json
 */
export async function seedDatabase(): Promise<void> {
  try {
    // Check if database is already seeded
    const blockCount = await db.blocks.count();
    if (blockCount > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Fetch seed data
    const response = await fetch("/seed/seed-outline.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch seed data: ${response.statusText}`);
    }

    const seedData: {
      blocks: Block[];
      props: Prop[];
      slices: Slice[];
    } = await response.json();

    // Clear existing data (if any)
    await db.transaction("rw", db.blocks, db.props, db.slices, async () => {
      await db.blocks.clear();
      await db.props.clear();
      await db.slices.clear();

      // Insert seed data
      await db.blocks.bulkAdd(seedData.blocks);
      await db.props.bulkAdd(seedData.props);
      await db.slices.bulkAdd(seedData.slices);
    });

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

/**
 * Clears all data from the database
 */
export async function clearDatabase(): Promise<void> {
  await db.transaction("rw", db.blocks, db.props, db.slices, async () => {
    await db.blocks.clear();
    await db.props.clear();
    await db.slices.clear();
  });
  console.log("Database cleared");
}

/**
 * Resets the database with seed data (clears and reseeds)
 */
export async function resetDatabase(): Promise<void> {
  await clearDatabase();
  await seedDatabase();
}
