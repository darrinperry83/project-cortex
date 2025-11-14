"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Save, AlertCircle, CheckCircle, Info } from "lucide-react";
import { db } from "@/lib/dexie";
import { ensurePath, buildPath } from "@/lib/path";
import { applyDSL } from "@/lib/dsl";
import type { Slice, Block } from "@/lib/types";

interface SliceBuilderProps {
  sliceId?: string;
  onSave?: (_sliceId: string) => void;
  onCancel?: () => void;
  isDialog?: boolean;
}

const EXAMPLE_QUERIES = [
  { label: "All headings", query: "type:heading" },
  { label: "Tagged with 'coffee'", query: "tag:coffee" },
  { label: "Path contains 'Cities'", query: "path:/Cities/*" },
  { label: "Category is coffee", query: "prop.category=coffee" },
  { label: "Not visited", query: "prop.visited=false" },
  { label: "Rating >= 4", query: "prop.rating>=4" },
  { label: "Coffee shops unvisited", query: "prop.category=coffee AND prop.visited=false" },
];

const BUILTIN_COLUMNS = [
  { value: "title", label: "Title" },
  { value: "type", label: "Type" },
  { value: "path", label: "Path" },
  { value: "tags", label: "Tags" },
];

export function SliceBuilder({ sliceId, onSave, onCancel, isDialog = true }: SliceBuilderProps) {
  const [name, setName] = useState("");
  const [scopeType, setScopeType] = useState<"global" | "scoped">("global");
  const [rootPath, setRootPath] = useState("");
  const [rootBlockId, setRootBlockId] = useState("");
  const [dsl, setDsl] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["title", "type"]);
  const [customColumn, setCustomColumn] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [groupBy, setGroupBy] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const isEditMode = Boolean(sliceId);

  // Load existing slice if editing
  const existingSlice = useLiveQuery(async () => {
    if (!sliceId) return null;
    return await db.slices.get(sliceId);
  }, [sliceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all distinct property keys for dynamic columns
  const propertyKeys = useLiveQuery(async () => {
    const allProps = await db.props.toArray();
    const uniqueKeys = new Set(allProps.map((p) => p.key));
    return Array.from(uniqueKeys).sort();
  }, []);

  // Load all headings for scope picker
  const allHeadings = useLiveQuery(async () => {
    return await db.blocks.where("type").equals("heading").toArray();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (existingSlice) {
      setName(existingSlice.name);
      setDsl(existingSlice.dsl);
      setSelectedColumns(existingSlice.columns);

      if (existingSlice.scope === "global") {
        setScopeType("global");
      } else {
        setScopeType("scoped");
        setRootBlockId(existingSlice.scope.rootBlockId);
        // Load the path for this blockId
        buildPath(existingSlice.scope.rootBlockId).then(setRootPath);
      }

      if (existingSlice.sort) {
        setSortBy(existingSlice.sort.by);
        setSortDir(existingSlice.sort.dir);
      }

      if (existingSlice.groupBy) {
        setGroupBy(existingSlice.groupBy);
      }
    }
  }, [existingSlice]);

  // All available columns (built-in + property columns)
  const allColumns = useMemo(() => {
    const propColumns = (propertyKeys || []).map((key) => ({
      value: `prop.${key}`,
      label: `Property: ${key}`,
    }));
    return [...BUILTIN_COLUMNS, ...propColumns];
  }, [propertyKeys]);

  // Columns available for sorting/grouping (all selected columns)
  const sortableColumns = useMemo(() => {
    return selectedColumns.map((col) => {
      const found = allColumns.find((c) => c.value === col);
      return found || { value: col, label: col };
    });
  }, [selectedColumns, allColumns]);

  const handleToggleColumn = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  const handleAddCustomColumn = () => {
    const trimmed = customColumn.trim();
    if (trimmed && !selectedColumns.includes(`prop.${trimmed}`)) {
      setSelectedColumns((prev) => [...prev, `prop.${trimmed}`]);
      setCustomColumn("");
    }
  };

  const handlePreview = async () => {
    if (!dsl.trim()) {
      setError("Query is required to preview");
      return;
    }

    setIsPreviewLoading(true);
    setError("");
    try {
      const allBlocks = await db.blocks.toArray();
      const allProps = await db.props.toArray();

      // Apply scope filter
      let blocksToQuery = allBlocks;
      if (scopeType === "scoped" && rootBlockId) {
        // Filter to only blocks under the root
        const isDescendant = async (blockId: string): Promise<boolean> => {
          let currentId: string | null = blockId;
          while (currentId) {
            if (currentId === rootBlockId) return true;
            const block = allBlocks.find((b) => b.id === currentId);
            if (!block) break;
            currentId = block.parentId;
          }
          return false;
        };

        const descendants = [];
        for (const block of allBlocks) {
          if (await isDescendant(block.id)) {
            descendants.push(block);
          }
        }
        blocksToQuery = descendants;
      }

      const results = applyDSL(dsl, blocksToQuery, allProps);
      setPreviewCount(results.length);
    } catch (err) {
      console.error("Preview error:", err);
      setError("Invalid query: " + (err as Error).message);
      setPreviewCount(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const validateForm = (): boolean => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!dsl.trim()) {
      setError("Query (DSL) is required");
      return false;
    }

    if (selectedColumns.length === 0) {
      setError("At least one column is required");
      return false;
    }

    if (scopeType === "scoped" && !rootPath.trim()) {
      setError("Root path is required for scoped queries");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Ensure the Views root exists
      const viewsRootId = await ensurePath("#/Views");

      // Build the scope object
      let scope: Slice["scope"];
      if (scopeType === "global") {
        scope = "global";
      } else {
        // If scoped, ensure the root path exists
        if (!rootBlockId && rootPath.trim()) {
          const id = await ensurePath(rootPath);
          setRootBlockId(id);
          scope = { rootBlockId: id };
        } else {
          scope = { rootBlockId };
        }
      }

      let blockId = existingSlice?.blockId || null;

      // Create or update the ViewBlock
      if (!blockId) {
        // Create new ViewBlock
        const viewsChildren = await db.blocks.where("parentId").equals(viewsRootId).toArray();
        const maxSort = viewsChildren.reduce((max, b) => Math.max(max, b.sort), -1);

        const newBlock: Block = {
          id: crypto.randomUUID(),
          parentId: viewsRootId,
          type: "view",
          title: name.trim(),
          content: "",
          level: 2, // Views are under the root, so level 2
          sort: maxSort + 1,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.blocks.add(newBlock);
        blockId = newBlock.id;
      } else {
        // Update existing ViewBlock
        await db.blocks.update(blockId, {
          title: name.trim(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Build sort and groupBy
      const sortObj = sortBy ? { by: sortBy, dir: sortDir } : null;
      const groupByValue = groupBy || null;

      // Create or update the Slice
      if (isEditMode) {
        await db.slices.update(sliceId!, {
          blockId,
          name: name.trim(),
          scope,
          dsl: dsl.trim(),
          columns: selectedColumns,
          sort: sortObj,
          groupBy: groupByValue,
        });
      } else {
        const sliceData: Slice = {
          id: crypto.randomUUID(),
          blockId,
          name: name.trim(),
          scope,
          dsl: dsl.trim(),
          columns: selectedColumns,
          sort: sortObj,
          groupBy: groupByValue,
        };
        await db.slices.add(sliceData);
      }

      const savedSliceId =
        sliceId || (await db.slices.toArray()).find((s) => s.blockId === blockId)?.id;

      if (savedSliceId) {
        onSave?.(savedSliceId);
      }
    } catch (err) {
      console.error("Error saving slice:", err);
      setError("Failed to save slice: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetExample = (query: string) => {
    setDsl(query);
    setPreviewCount(null);
  };

  const content = (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="slice-name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="slice-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Unvisited Coffee Shops"
        />
      </div>

      {/* Scope */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Scope</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="global"
              checked={scopeType === "global"}
              onChange={() => setScopeType("global")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">Global (all blocks)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="scoped"
              checked={scopeType === "scoped"}
              onChange={() => setScopeType("scoped")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">Scoped to subtree</span>
          </label>
        </div>

        {scopeType === "scoped" && (
          <div className="mt-2">
            <input
              type="text"
              value={rootPath}
              onChange={(e) => setRootPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#/Cities/Tokyo"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a path to scope queries to a specific subtree
            </p>

            {allHeadings && allHeadings.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="text-xs font-medium text-gray-500 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  Quick select
                </div>
                {allHeadings.slice(0, 5).map((heading) => (
                  <button
                    key={heading.id}
                    onClick={async () => {
                      const path = await buildPath(heading.id);
                      setRootPath(path);
                      setRootBlockId(heading.id);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {heading.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Query (DSL) */}
      <div className="space-y-2">
        <label htmlFor="slice-dsl" className="block text-sm font-medium text-gray-700">
          Query (DSL)
        </label>
        <textarea
          id="slice-dsl"
          value={dsl}
          onChange={(e) => setDsl(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="type:heading"
        />
        <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Examples:</p>
            <div className="space-y-1">
              {EXAMPLE_QUERIES.map((ex) => (
                <button
                  key={ex.query}
                  onClick={() => handleSetExample(ex.query)}
                  className="block hover:underline text-left"
                >
                  <code className="bg-blue-100 px-1 rounded">{ex.query}</code> - {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handlePreview}
          disabled={isPreviewLoading || !dsl.trim()}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
        >
          {isPreviewLoading ? "Previewing..." : "Preview query"}
        </button>

        {previewCount !== null && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">
              Found {previewCount} {previewCount === 1 ? "match" : "matches"}
            </span>
          </div>
        )}
      </div>

      {/* Columns */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Columns</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {allColumns.map((col) => (
            <label key={col.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedColumns.includes(col.value)}
                onChange={() => handleToggleColumn(col.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">{col.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customColumn}
            onChange={(e) => setCustomColumn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomColumn();
              }
            }}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Custom property (e.g., rating)"
          />
          <button
            onClick={handleAddCustomColumn}
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Add custom property columns by entering the property key
        </p>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Sort (optional)</label>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No sorting</option>
            {sortableColumns.map((col) => (
              <option key={col.value} value={col.value}>
                {col.label}
              </option>
            ))}
          </select>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
            disabled={!sortBy}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Group By */}
      <div className="space-y-2">
        <label htmlFor="slice-groupby" className="block text-sm font-medium text-gray-700">
          Group By (optional)
        </label>
        <select
          id="slice-groupby"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No grouping</option>
          {sortableColumns.map((col) => (
            <option key={col.value} value={col.value}>
              {col.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Saving..." : isEditMode ? "Update Slice" : "Create Slice"}
        </button>
      </div>
    </div>
  );

  if (!isDialog) {
    return <div className="max-w-2xl mx-auto p-6">{content}</div>;
  }

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onCancel?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {isEditMode ? "Edit Slice" : "Create Slice"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {content}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
