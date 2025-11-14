"use client";

import { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import * as Dialog from "@radix-ui/react-dialog";
import { X, MoveRight, Anchor } from "lucide-react";
import { db } from "@/lib/dexie";
import { refile } from "@/lib/refile";
import { buildPath, parsePathString } from "@/lib/path";
import type { Block } from "@/lib/types";

interface PathPickerProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  blockId: string;
}

// Utility function to check for circular moves (currently unused but may be needed)
async function _checkCircularMove(blockId: string, targetBlockId: string): Promise<boolean> {
  let currentId: string | null = targetBlockId;

  while (currentId) {
    if (currentId === blockId) return true;

    const block: Block | undefined = await db.blocks.get(currentId);
    if (!block) break;

    currentId = block.parentId;
  }

  return false;
}

export function PathPicker({ onOpenChange, blockId, open }: PathPickerProps) {
  const [pathInput, setPathInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load all blocks to build paths for fuzzy search
  const allBlocks = useLiveQuery(() => db.blocks.toArray());

  // Fuzzy filter paths based on input
  const filteredPaths = useMemo(() => {
    if (!allBlocks || pathInput.length === 0) return [];

    const searchTerm = pathInput.toLowerCase().replace(/^#\/?/, "");

    return allBlocks
      .filter((block) => {
        if (block.id === blockId) return false; // Don't show current block
        if (!block.title) return false;

        const title = block.title.toLowerCase();
        return title.includes(searchTerm);
      })
      .slice(0, 10); // Limit to 10 results
  }, [allBlocks, pathInput, blockId]);

  // Parse input path to check if it exists
  const pathAnalysis = useMemo(() => {
    if (pathInput.length === 0) {
      return { exists: false, parts: [], preview: "" };
    }

    const parts = parsePathString(pathInput);
    const preview = parts.join(" → ");

    return { exists: false, parts, preview };
  }, [pathInput]);

  const handleMove = async () => {
    if (pathInput.length === 0) return;

    setIsProcessing(true);
    try {
      await refile(blockId, pathInput, "move");
      onOpenChange(false);
      setPathInput("");
    } catch (error) {
      console.error("Failed to move block:", error);
      alert("Failed to move block. Please check the path and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnchor = async () => {
    if (pathInput.length === 0) return;

    setIsProcessing(true);
    try {
      await refile(blockId, pathInput, "anchor");
      onOpenChange(false);
      setPathInput("");
    } catch (error) {
      console.error("Failed to anchor block:", error);
      alert("Failed to anchor block. Please check the path and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPath = async (block: Block) => {
    const path = await buildPath(block.id);
    setPathInput(path);
  };

  // Reset input when dialog closes
  useEffect(() => {
    if (!open) {
      setPathInput("");
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Refile Block
            </Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-gray-600">
            Enter a path to refile this block. You can move it to a new parent or anchor it to a
            location.
          </Dialog.Description>

          <div className="space-y-4">
            <div>
              <label htmlFor="path-input" className="text-sm font-medium text-gray-700 block mb-1">
                Target Path
              </label>
              <input
                id="path-input"
                type="text"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                placeholder="#/Cities/Tokyo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {pathAnalysis.preview && (
                <p className="mt-1 text-sm text-gray-600">
                  Will create: <span className="font-medium">{pathAnalysis.preview}</span>
                </p>
              )}
            </div>

            {filteredPaths.length > 0 && (
              <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                <div className="text-xs font-medium text-gray-500 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  Suggestions
                </div>
                {filteredPaths.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => handleSelectPath(block)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm text-gray-900">{block.title}</div>
                    <div className="text-xs text-gray-500">
                      {block.type} • Level {block.level}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button
                onClick={handleAnchor}
                disabled={pathInput.length === 0 || isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                <Anchor className="w-4 h-4" />
                Anchor to path
              </button>

              <button
                onClick={handleMove}
                disabled={pathInput.length === 0 || isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                <MoveRight className="w-4 h-4" />
                Move here
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
