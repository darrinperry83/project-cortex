"use client";

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2, Database } from "lucide-react";
import { db } from "@/lib/dexie";
import type { Slice } from "@/lib/types";

interface SliceCardProps {
  slice: Slice;
  onEdit: (_sliceId: string) => void;
  onDelete: (_sliceId: string) => void;
  onOpen: (_sliceId: string, _blockId: string | null) => void;
}

function SliceCard({ slice, onEdit, onDelete, onOpen }: SliceCardProps) {
  const scopeText = slice.scope === "global" ? "Global" : `Scoped to: ${slice.scope.rootBlockId}`;

  const columnCount = slice.columns.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{slice.name}</h3>
          <p className="text-sm text-gray-500">{scopeText}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpen(slice.id, slice.blockId)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Open slice"
            aria-label="Open slice"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(slice.id)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit slice"
            aria-label="Edit slice"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(slice.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete slice"
            aria-label="Delete slice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
          <p className="text-xs font-medium text-gray-500 mb-1">Query</p>
          <code className="text-sm text-gray-800 font-mono break-all">
            {slice.dsl || "No query"}
          </code>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {columnCount} {columnCount === 1 ? "column" : "columns"}
          </span>
          {slice.sort && (
            <span className="text-gray-600">
              Sort: {slice.sort.by} ({slice.sort.dir})
            </span>
          )}
          {slice.groupBy && <span className="text-gray-600">Group: {slice.groupBy}</span>}
        </div>
      </div>
    </div>
  );
}

interface SliceListProps {
  onNewSlice?: () => void;
  onEditSlice?: (_sliceId: string) => void;
}

export function SliceList({ onNewSlice, onEditSlice }: SliceListProps) {
  const router = useRouter();

  // Load all slices from Dexie
  const slices = useLiveQuery(async () => await db.slices.toArray(), []);

  const handleDelete = async (sliceId: string) => {
    if (!confirm("Are you sure you want to delete this slice?")) {
      return;
    }

    try {
      // Find the slice to get its blockId
      const slice = await db.slices.get(sliceId);

      // Delete the slice
      await db.slices.delete(sliceId);

      // Also delete the associated ViewBlock if it exists
      if (slice?.blockId) {
        await db.blocks.delete(slice.blockId);
      }
    } catch (error) {
      console.error("Error deleting slice:", error);
      alert("Failed to delete slice. Please try again.");
    }
  };

  const handleOpen = (sliceId: string, blockId: string | null) => {
    if (blockId) {
      router.push(`/blocks/${blockId}`);
    } else {
      // If no blockId, just show the slice inline (fallback)
      console.log("Opening slice without blockId:", sliceId);
    }
  };

  const handleEdit = (sliceId: string) => {
    if (onEditSlice) {
      onEditSlice(sliceId);
    } else {
      console.log("Edit slice:", sliceId);
    }
  };

  const handleNewSlice = () => {
    if (onNewSlice) {
      onNewSlice();
    } else {
      console.log("New slice clicked");
    }
  };

  // Loading state
  if (slices === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading slices...</div>
      </div>
    );
  }

  // Empty state
  if (slices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Database className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No slices yet</h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Create your first slice to save queries and view custom data tables.
        </p>
        <button
          onClick={handleNewSlice}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Slice
        </button>
      </div>
    );
  }

  // List of slices
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Slices</h2>
        <button
          onClick={handleNewSlice}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Slice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slices.map((slice) => (
          <SliceCard
            key={slice.id}
            slice={slice}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpen={handleOpen}
          />
        ))}
      </div>
    </div>
  );
}
