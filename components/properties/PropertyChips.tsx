"use client";

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, X } from "lucide-react";
import { db } from "@/lib/dexie";
import { PropertyEditor } from "./PropertyEditor";
import type { Prop } from "@/lib/types";

interface PropertyChipsProps {
  blockId: string;
}

export function PropertyChips({ blockId }: PropertyChipsProps) {
  const [editingPropId, setEditingPropId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load all properties for this block
  const props = useLiveQuery(() => db.props.where("blockId").equals(blockId).toArray(), [blockId]);

  const handleDelete = async (propId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.props.delete(propId);
  };

  const getPropertyValue = (prop: Prop): string => {
    switch (prop.kind) {
      case "string":
        return prop.s || "";
      case "number":
        return prop.n?.toString() || "0";
      case "boolean":
        return prop.b ? "✓" : "✗";
      case "date":
        return prop.d ? new Date(prop.d).toLocaleDateString() : "";
      case "datetime":
        return prop.t ? new Date(prop.t).toLocaleString() : "";
      case "taglist":
        return Array.isArray(prop.j) ? prop.j.join(", ") : "";
      case "json":
        return JSON.stringify(prop.j);
      default:
        return "";
    }
  };

  const getChipColors = (prop: Prop): string => {
    switch (prop.kind) {
      case "string":
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
      case "number":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "boolean":
        return prop.b
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-700 hover:bg-red-200";
      case "date":
      case "datetime":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      case "taglist":
        return "bg-orange-100 text-orange-700 hover:bg-orange-200";
      case "json":
        return "bg-pink-100 text-pink-700 hover:bg-pink-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  const truncateValue = (value: string, maxLength: number = 30): string => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + "...";
  };

  const renderPropertyChip = React.useCallback((prop: Prop) => {
    const value = getPropertyValue(prop);
    const colors = getChipColors(prop);

    // Special rendering for taglist - show as multiple mini chips
    if (prop.kind === "taglist" && Array.isArray(prop.j)) {
      return (
        <div key={prop.id} className="group relative inline-flex items-center gap-1">
          <span className="text-xs font-medium text-gray-600">{prop.key}:</span>
          <div className="flex flex-wrap gap-1">
            {prop.j.map((tag: string, idx: number) => (
              <span
                key={idx}
                className={`px-2 py-1 text-xs rounded-full ${colors} transition-colors cursor-pointer`}
                onClick={() => setEditingPropId(prop.id)}
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={(e) => handleDelete(prop.id, e)}
            className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded-full hover:bg-red-100 transition-opacity"
            aria-label="Delete property"
          >
            <X className="w-3 h-3 text-red-600" />
          </button>
        </div>
      );
    }

    return (
      <div key={prop.id} className="group relative inline-flex items-center">
        <button
          onClick={() => setEditingPropId(prop.id)}
          className={`px-2 py-1 text-xs rounded-full ${colors} transition-colors inline-flex items-center gap-1`}
        >
          <span className="font-medium">{prop.key}:</span>
          <span>{truncateValue(value)}</span>
        </button>
        <button
          onClick={(e) => handleDelete(prop.id, e)}
          className="opacity-0 group-hover:opacity-100 absolute -right-1 -top-1 p-0.5 bg-red-500 rounded-full hover:bg-red-600 transition-opacity"
          aria-label="Delete property"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {/* eslint-disable-next-line react/prop-types */}
      {props?.map(renderPropertyChip)}

      {/* Add Property Button */}
      <button
        onClick={() => setIsCreating(true)}
        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
        aria-label="Add property"
      >
        <Plus className="w-3 h-3" />
        <span>Add property</span>
      </button>

      {/* Property Editor Modal - Edit Mode */}
      {editingPropId && (
        <PropertyEditor
          blockId={blockId}
          propertyId={editingPropId}
          onClose={() => setEditingPropId(null)}
        />
      )}

      {/* Property Editor Modal - Create Mode */}
      {isCreating && <PropertyEditor blockId={blockId} onClose={() => setIsCreating(false)} />}
    </div>
  );
}
