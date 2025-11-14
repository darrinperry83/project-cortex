"use client";

import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/dexie";
import { applyDSL } from "@/lib/dsl";
import { buildPath } from "@/lib/path";
import type { Slice, Block, Prop } from "@/lib/types";

interface TableViewProps {
  sliceId?: string;
  slice?: Slice;
}

interface EnrichedBlock extends Block {
  props: Prop[];
  path?: string;
}

interface GroupedBlocks {
  [key: string]: EnrichedBlock[];
}

function formatPropertyValue(prop: Prop | undefined): string {
  if (!prop) return "—";

  switch (prop.kind) {
    case "string":
      return prop.s || "—";
    case "number":
      return prop.n !== undefined ? prop.n.toString() : "—";
    case "boolean":
      return prop.b !== undefined ? (prop.b ? "Yes" : "No") : "—";
    case "date":
      return prop.d || "—";
    case "datetime":
      return prop.t || "—";
    case "taglist":
      return Array.isArray(prop.j) ? prop.j.join(", ") : "—";
    case "json":
      return JSON.stringify(prop.j);
    default:
      return "—";
  }
}

function getCellValue(block: EnrichedBlock, column: string): string | number | boolean {
  if (column === "title") {
    return block.title || "";
  }
  if (column === "type") {
    return block.type;
  }
  if (column === "path") {
    return block.path || "";
  }
  if (column === "tags") {
    return block.tags.join(", ");
  }
  if (column.startsWith("prop.")) {
    const propKey = column.substring(5);
    const prop = block.props.find((p) => p.key === propKey);
    if (!prop) return "";

    // Return the actual value for sorting
    switch (prop.kind) {
      case "string":
        return prop.s || "";
      case "number":
        return prop.n || 0;
      case "boolean":
        return prop.b || false;
      case "date":
      case "datetime":
        return prop.d || prop.t || "";
      case "taglist":
        return Array.isArray(prop.j) ? prop.j.join(", ") : "";
      case "json":
        return JSON.stringify(prop.j);
      default:
        return "";
    }
  }
  return "";
}

function renderCell(block: EnrichedBlock, column: string, router: any): React.ReactNode {
  if (column === "title") {
    return (
      <button
        onClick={() => router.push(`/blocks/${block.id}`)}
        className="text-blue-600 hover:underline text-left"
      >
        {block.title || "(Untitled)"}
      </button>
    );
  }

  if (column === "type") {
    const colors: Record<string, string> = {
      heading: "bg-purple-100 text-purple-700",
      todo: "bg-green-100 text-green-700",
      paragraph: "bg-blue-100 text-blue-700",
      view: "bg-orange-100 text-orange-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${colors[block.type] || "bg-gray-100 text-gray-700"}`}
      >
        {block.type}
      </span>
    );
  }

  if (column === "path") {
    return (
      <span className="text-gray-600 text-sm font-mono" title={block.path}>
        {block.path || "—"}
      </span>
    );
  }

  if (column === "tags") {
    if (block.tags.length === 0) return <span className="text-gray-400">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {block.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
    );
  }

  if (column.startsWith("prop.")) {
    const propKey = column.substring(5);
    const prop = block.props.find((p) => p.key === propKey);
    const value = formatPropertyValue(prop);

    if (value.length > 50) {
      return (
        <span className="text-gray-700 text-sm" title={value}>
          {value.substring(0, 50)}...
        </span>
      );
    }

    return <span className="text-gray-700 text-sm">{value}</span>;
  }

  return <span className="text-gray-400">—</span>;
}

export function TableView({ sliceId, slice: propSlice }: TableViewProps) {
  const router = useRouter();
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Load slice from database if sliceId provided
  const dbSlice = useLiveQuery(async () => {
    if (!sliceId) return null;
    return await db.slices.get(sliceId);
  }, [sliceId]);

  const slice = propSlice || dbSlice;

  // Load all blocks and props
  const allBlocks = useLiveQuery(() => db.blocks.toArray(), []);
  const allProps = useLiveQuery(() => db.props.toArray(), []);

  // Execute query and enrich blocks
  const enrichedBlocks = useLiveQuery(async () => {
    if (!slice || !allBlocks || !allProps) return null;

    try {
      // Apply scope filter
      let blocksToQuery = allBlocks;
      if (slice.scope !== "global") {
        const rootBlockId = slice.scope.rootBlockId;
        const isDescendant = (block: Block): boolean => {
          let currentId: string | null = block.id;
          while (currentId) {
            if (currentId === rootBlockId) return true;
            const parentBlock = allBlocks.find((b) => b.id === currentId);
            if (!parentBlock) break;
            currentId = parentBlock.parentId;
          }
          return false;
        };
        blocksToQuery = allBlocks.filter(isDescendant);
      }

      // Apply DSL query
      const results = applyDSL(slice.dsl, blocksToQuery, allProps);

      // Enrich with props and paths
      const enriched: EnrichedBlock[] = await Promise.all(
        results.map(async (block) => {
          const blockProps = allProps.filter((p) => p.blockId === block.id);
          const path = await buildPath(block.id);
          return {
            ...block,
            props: blockProps,
            path,
          };
        })
      );

      return enriched;
    } catch (error) {
      console.error("Error executing query:", error);
      return null;
    }
  }, [slice, allBlocks, allProps]);

  // Sort blocks
  const sortedBlocks = useMemo(() => {
    if (!enrichedBlocks) return null;

    let sorted = [...enrichedBlocks];

    // Apply slice's default sort if no user sort is active
    const effectiveSortColumn = sortColumn || slice?.sort?.by || "";
    const effectiveSortDirection = sortColumn ? sortDirection : slice?.sort?.dir || "asc";

    if (effectiveSortColumn) {
      sorted.sort((a, b) => {
        const aVal = getCellValue(a, effectiveSortColumn);
        const bVal = getCellValue(b, effectiveSortColumn);

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;

        return effectiveSortDirection === "asc" ? comparison : -comparison;
      });
    }

    return sorted;
  }, [enrichedBlocks, sortColumn, sortDirection, slice]);

  // Group blocks if groupBy is set
  const groupedBlocks = useMemo(() => {
    if (!sortedBlocks || !slice?.groupBy) return null;

    const groups: GroupedBlocks = {};
    sortedBlocks.forEach((block) => {
      const groupValue = getCellValue(block, slice.groupBy!).toString() || "(empty)";
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(block);
    });

    return groups;
  }, [sortedBlocks, slice?.groupBy]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  // Loading state
  if (!slice || enrichedBlocks === undefined || enrichedBlocks === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Error state
  if (enrichedBlocks === null) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-red-900">Error executing query</p>
          <p className="text-sm text-red-700">
            The query may be invalid. Please check the DSL syntax.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (enrichedBlocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-600 mb-2">No results found</p>
        <p className="text-sm text-gray-500">Try adjusting your query or scope</p>
      </div>
    );
  }

  const renderTable = (blocks: EnrichedBlock[]) => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {slice.columns.map((column) => {
              const isActive = sortColumn === column || (!sortColumn && slice.sort?.by === column);
              const currentDir = isActive
                ? sortColumn === column
                  ? sortDirection
                  : slice.sort?.dir || "asc"
                : "asc";

              return (
                <th
                  key={column}
                  onClick={() => handleSort(column)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>{column.startsWith("prop.") ? column.substring(5) : column}</span>
                    {isActive &&
                      (currentDir === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
              );
            })}
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {blocks.map((block, idx) => (
            <tr
              key={block.id}
              className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
            >
              {slice.columns.map((column) => (
                <td key={column} className="px-4 py-3 whitespace-nowrap">
                  {renderCell(block, column, router)}
                </td>
              ))}
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <button
                  onClick={() => router.push(`/blocks/${block.id}`)}
                  className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-sm"
                  title="Open block"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render grouped view
  if (groupedBlocks) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          {enrichedBlocks.length} {enrichedBlocks.length === 1 ? "result" : "results"} grouped by{" "}
          {slice.groupBy}
        </div>
        {Object.entries(groupedBlocks).map(([groupKey, blocks]) => {
          const isCollapsed = collapsedGroups.has(groupKey);
          return (
            <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-150 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="font-medium text-gray-900">{groupKey}</span>
                  <span className="text-sm text-gray-500">({blocks.length})</span>
                </div>
              </button>
              {!isCollapsed && <div>{renderTable(blocks)}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  // Render regular table view
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {enrichedBlocks.length} {enrichedBlocks.length === 1 ? "result" : "results"}
      </div>
      {renderTable(sortedBlocks || [])}
    </div>
  );
}
