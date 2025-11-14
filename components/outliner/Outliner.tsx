"use client";

import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/dexie";
import type { Block } from "@/lib/types";
import { Node } from "./Node";
import { PathPicker } from "./PathPicker";

interface OutlinerProps {
  rootBlockId?: string;
}

export function Outliner({ rootBlockId }: OutlinerProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [foldedBlocks, setFoldedBlocks] = useState<Set<string>>(new Set());
  const [zoomedBlockId, setZoomedBlockId] = useState<string | null>(rootBlockId || null);
  const [refileDialogOpen, setRefileDialogOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; title: string }>>([]);

  // Load blocks based on zoom level
  const blocks = useLiveQuery(async () => {
    const parentId = zoomedBlockId;
    let allBlocks: Block[];

    if (parentId === null) {
      // Root level
      allBlocks = await db.blocks.filter((b) => b.parentId === null).toArray();
    } else {
      // Zoomed into a specific block
      allBlocks = await db.blocks.where("parentId").equals(parentId).toArray();
    }

    // Sort by sort field
    return allBlocks.sort((a, b) => a.sort - b.sort);
  }, [zoomedBlockId]);

  // Load children count for each block to determine if it has children
  const childrenCounts = useLiveQuery(async () => {
    if (!blocks) return new Map<string, number>();

    const counts = new Map<string, number>();
    for (const block of blocks) {
      const count = await db.blocks.where("parentId").equals(block.id).count();
      counts.set(block.id, count);
    }
    return counts;
  }, [blocks]);

  // Build breadcrumbs when zoomed
  useEffect(() => {
    async function loadBreadcrumbs() {
      if (!zoomedBlockId) {
        setBreadcrumbs([]);
        return;
      }

      const crumbs: Array<{ id: string; title: string }> = [];
      let currentId: string | null = zoomedBlockId;

      while (currentId) {
        const block: Block | undefined = await db.blocks.get(currentId);
        if (!block) break;

        crumbs.unshift({
          id: block.id,
          title: block.title || block.content || "Untitled",
        });

        currentId = block.parentId;
      }

      setBreadcrumbs(crumbs);
    }

    loadBreadcrumbs();
  }, [zoomedBlockId]);

  // Auto-select first block if nothing selected
  useEffect(() => {
    if (!selectedBlockId && blocks && blocks.length > 0) {
      setSelectedBlockId(blocks[0].id);
    }
  }, [blocks, selectedBlockId]);

  const handleToggleFold = useCallback((blockId: string) => {
    setFoldedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  }, []);

  const handleZoom = useCallback((blockId: string) => {
    setZoomedBlockId(blockId);
    setSelectedBlockId(null); // Reset selection when zooming
  }, []);

  const handleBreadcrumbClick = useCallback(
    (blockId: string) => {
      const index = breadcrumbs.findIndex((b) => b.id === blockId);
      if (index === 0) {
        // Clicked on root, zoom out to root
        setZoomedBlockId(null);
      } else if (index > 0) {
        // Clicked on parent, zoom to parent
        setZoomedBlockId(breadcrumbs[index - 1].id);
      }
    },
    [breadcrumbs]
  );

  const handleZoomOut = useCallback(async () => {
    if (!zoomedBlockId) return;

    const block = await db.blocks.get(zoomedBlockId);
    if (block && block.parentId) {
      setZoomedBlockId(block.parentId);
    } else {
      setZoomedBlockId(null);
    }
  }, [zoomedBlockId]);

  const handleUpdateTitle = useCallback(async (blockId: string, newTitle: string) => {
    const block = await db.blocks.get(blockId);
    if (!block) return;

    if (block.type === "heading" || block.type === "todo") {
      await db.blocks.update(blockId, {
        title: newTitle,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.blocks.update(blockId, {
        content: newTitle,
        updatedAt: new Date().toISOString(),
      });
    }
  }, []);

  const handleToggleTodo = useCallback(async (blockId: string) => {
    const block = await db.blocks.get(blockId);
    if (!block || block.type !== "todo") return;

    const currentState = block.content || "";
    const isDone = currentState.includes("DONE");
    const newState = isDone ? "TODO" : "DONE";

    await db.blocks.update(blockId, {
      content: newState,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const handleIndent = useCallback(async () => {
    if (!selectedBlockId || !blocks) return;

    const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
    if (selectedIndex <= 0) return; // Can't indent first block

    const prevBlock = blocks[selectedIndex - 1];
    const block = blocks[selectedIndex];

    // Move block to be child of previous sibling
    await db.blocks.update(selectedBlockId, {
      parentId: prevBlock.id,
      level: block.level + 1,
      sort: 0, // First child
      updatedAt: new Date().toISOString(),
    });
  }, [selectedBlockId, blocks]);

  const handleOutdent = useCallback(async () => {
    if (!selectedBlockId || !blocks) return;

    const block = await db.blocks.get(selectedBlockId);
    if (!block || !block.parentId) return; // Already at root

    const parent = await db.blocks.get(block.parentId);
    if (!parent) return;

    // Move block to be sibling of parent
    const siblings = await db.blocks
      .where("parentId")
      .equals(parent.parentId || "")
      .toArray();
    const maxSort = siblings.reduce((max, b) => Math.max(max, b.sort), -1);

    await db.blocks.update(selectedBlockId, {
      parentId: parent.parentId,
      level: block.level - 1,
      sort: maxSort + 1,
      updatedAt: new Date().toISOString(),
    });
  }, [selectedBlockId, blocks]);

  const handleCreateSibling = useCallback(async () => {
    if (!blocks) return;

    const block = selectedBlockId ? await db.blocks.get(selectedBlockId) : null;
    const parentId = block ? block.parentId : zoomedBlockId;
    const level = block ? block.level : 1;

    // Get siblings to determine sort order
    const siblings =
      parentId === null
        ? await db.blocks.filter((b) => b.parentId === null).toArray()
        : await db.blocks.where("parentId").equals(parentId).toArray();

    const maxSort = siblings.reduce((max, b) => Math.max(max, b.sort), -1);

    const newBlock: Block = {
      id: crypto.randomUUID(),
      parentId,
      type: "paragraph",
      content: "",
      level,
      sort: maxSort + 1,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.blocks.add(newBlock);
    setSelectedBlockId(newBlock.id);
  }, [selectedBlockId, blocks, zoomedBlockId]);

  const handleCreateChild = useCallback(async () => {
    if (!selectedBlockId) return;

    const block = await db.blocks.get(selectedBlockId);
    if (!block) return;

    // Get children to determine sort order
    const children = await db.blocks.where("parentId").equals(selectedBlockId).toArray();
    const maxSort = children.reduce((max, b) => Math.max(max, b.sort), -1);

    const newBlock: Block = {
      id: crypto.randomUUID(),
      parentId: selectedBlockId,
      type: "paragraph",
      content: "",
      level: block.level + 1,
      sort: maxSort + 1,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.blocks.add(newBlock);
    setSelectedBlockId(newBlock.id);

    // Unfold parent if it was folded
    setFoldedBlocks((prev) => {
      const next = new Set(prev);
      next.delete(selectedBlockId);
      return next;
    });
  }, [selectedBlockId]);

  const handleMoveUp = useCallback(async () => {
    if (!selectedBlockId || !blocks) return;

    const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
    if (selectedIndex <= 0) return; // Already at top

    const currentBlock = blocks[selectedIndex];
    const prevBlock = blocks[selectedIndex - 1];

    // Swap sort values
    await db.transaction("rw", db.blocks, async () => {
      await db.blocks.update(currentBlock.id, {
        sort: prevBlock.sort,
        updatedAt: new Date().toISOString(),
      });
      await db.blocks.update(prevBlock.id, {
        sort: currentBlock.sort,
        updatedAt: new Date().toISOString(),
      });
    });
  }, [selectedBlockId, blocks]);

  const handleMoveDown = useCallback(async () => {
    if (!selectedBlockId || !blocks) return;

    const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
    if (selectedIndex < 0 || selectedIndex >= blocks.length - 1) return; // Already at bottom

    const currentBlock = blocks[selectedIndex];
    const nextBlock = blocks[selectedIndex + 1];

    // Swap sort values
    await db.transaction("rw", db.blocks, async () => {
      await db.blocks.update(currentBlock.id, {
        sort: nextBlock.sort,
        updatedAt: new Date().toISOString(),
      });
      await db.blocks.update(nextBlock.id, {
        sort: currentBlock.sort,
        updatedAt: new Date().toISOString(),
      });
    });
  }, [selectedBlockId, blocks]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if we're editing
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      switch (e.key) {
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            handleOutdent();
          } else {
            handleIndent();
          }
          break;

        case "Enter":
          e.preventDefault();
          if (e.shiftKey) {
            handleCreateChild();
          } else {
            handleCreateSibling();
          }
          break;

        case "ArrowUp":
          if (e.altKey) {
            e.preventDefault();
            handleMoveUp();
          } else {
            e.preventDefault();
            const index = blocks?.findIndex((b) => b.id === selectedBlockId) ?? -1;
            if (index > 0 && blocks) {
              setSelectedBlockId(blocks[index - 1].id);
            }
          }
          break;

        case "ArrowDown":
          if (e.altKey) {
            e.preventDefault();
            handleMoveDown();
          } else {
            e.preventDefault();
            const index = blocks?.findIndex((b) => b.id === selectedBlockId) ?? -1;
            if (index >= 0 && blocks && index < blocks.length - 1) {
              setSelectedBlockId(blocks[index + 1].id);
            }
          }
          break;

        case " ":
          e.preventDefault();
          if (selectedBlockId) {
            handleToggleTodo(selectedBlockId);
          }
          break;

        case "m":
        case "M":
          e.preventDefault();
          setRefileDialogOpen(true);
          break;

        case ":":
          e.preventDefault();
          // TODO: Open property editor
          console.log("Open property editor for:", selectedBlockId);
          break;

        default:
          break;
      }
    },
    [
      blocks,
      selectedBlockId,
      handleIndent,
      handleOutdent,
      handleCreateSibling,
      handleCreateChild,
      handleMoveUp,
      handleMoveDown,
      handleToggleTodo,
    ]
  );

  // Attach keyboard handler to window
  useEffect(() => {
    const handler = (e: any) => handleKeyDown(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKeyDown]);

  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={handleZoomOut}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Zoom out"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => setZoomedBlockId(null)}
            className="hover:text-blue-600 hover:underline"
          >
            Root
          </button>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <span>/</span>
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-gray-900">{crumb.title}</span>
              ) : (
                <button
                  onClick={() => handleBreadcrumbClick(crumb.id)}
                  className="hover:text-blue-600 hover:underline"
                >
                  {crumb.title}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!blocks || !childrenCounts) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
  }

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="mb-4">No blocks yet</p>
        <p className="text-sm text-gray-400">Press Enter to create your first block</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {renderBreadcrumbs()}

      <div className="flex-1 overflow-y-auto" role="tree">
        {blocks.map((block) => {
          const hasChildren = (childrenCounts.get(block.id) ?? 0) > 0;
          const isFolded = foldedBlocks.has(block.id);
          const isSelected = selectedBlockId === block.id;

          return (
            <Node
              key={block.id}
              block={block}
              level={0} // Level is relative to current zoom
              isSelected={isSelected}
              isFolded={isFolded}
              hasChildren={hasChildren}
              onToggleFold={handleToggleFold}
              onZoom={handleZoom}
              onSelect={setSelectedBlockId}
              onUpdateTitle={handleUpdateTitle}
              onToggleTodo={handleToggleTodo}
            />
          );
        })}
      </div>

      {selectedBlockId && (
        <PathPicker
          open={refileDialogOpen}
          onOpenChange={setRefileDialogOpen}
          blockId={selectedBlockId}
        />
      )}
    </div>
  );
}
