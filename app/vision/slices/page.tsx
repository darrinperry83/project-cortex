"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Save, ArrowUpDown, Search, ExternalLink, Target } from "lucide-react";
import Link from "next/link";
import {
  mockBlocks,
  flattenBlocks,
  mockPropertyColumns,
  exampleSliceQueries,
  type MockBlock,
} from "@/lib/mock-data";

type SortDirection = "asc" | "desc";
type ScopeType = "global" | "subtree";

interface ColumnConfig {
  id: string;
  label: string;
  enabled: boolean;
  width?: number;
}

export default function SlicesPrototypePage() {
  // Builder state
  const [sliceName, setSliceName] = useState("My Slice");
  const [scope, setScope] = useState<ScopeType>("global");
  const [scopePath, setScopePath] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [groupBy, setGroupBy] = useState<string>("");

  // Column configuration
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: "title", label: "Title", enabled: true, width: 300 },
    { id: "path", label: "Path", enabled: true, width: 250 },
    { id: "status", label: "Status", enabled: true, width: 100 },
    { id: "type", label: "Type", enabled: false, width: 100 },
  ]);

  // Toggle column
  const toggleColumn = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, enabled: !col.enabled } : col))
    );
  };

  // Add property column
  const addPropertyColumn = (propName: string) => {
    if (!columns.find((c) => c.id === propName)) {
      setColumns((prev) => [...prev, { id: propName, label: propName, enabled: true, width: 120 }]);
    } else {
      setColumns((prev) =>
        prev.map((col) => (col.id === propName ? { ...col, enabled: true } : col))
      );
    }
  };

  // Load example query
  const loadExample = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  // Execute query (mock implementation)
  const executeQuery = useMemo(() => {
    const allBlocks = flattenBlocks(mockBlocks);
    let results = allBlocks;

    // Apply scope filter
    if (scope === "subtree" && scopePath) {
      results = results.filter((block) => block.path.includes(scopePath));
    }

    // Apply query filter (very simple parser for demo)
    if (query) {
      // Check for path filter: path:/Cities/*
      const pathMatch = query.match(/path:([^\s]+)/i);
      if (pathMatch) {
        const pathPattern = pathMatch[1].replace("*", "");
        results = results.filter((block) => block.path.includes(pathPattern));
      }

      // Check for property filters: prop.category=coffee
      const propMatches = query.matchAll(/prop\.(\w+)=([\w]+)/gi);
      for (const match of propMatches) {
        const [, propKey, propValue] = match;
        results = results.filter((block) => {
          if (!block.properties) return false;
          const blockValue = block.properties[propKey];
          if (typeof blockValue === "boolean") {
            return blockValue.toString() === propValue;
          }
          return String(blockValue).toLowerCase() === propValue.toLowerCase();
        });
      }

      // Check for property comparisons: prop.risk_reward>=2
      const compMatches = query.matchAll(/prop\.(\w+)([><=]+)([\d.]+)/gi);
      for (const match of compMatches) {
        const [, propKey, operator, value] = match;
        const numValue = parseFloat(value);
        results = results.filter((block) => {
          if (!block.properties) return false;
          const blockValue = Number(block.properties[propKey]);
          if (isNaN(blockValue)) return false;

          switch (operator) {
            case ">=":
              return blockValue >= numValue;
            case "<=":
              return blockValue <= numValue;
            case ">":
              return blockValue > numValue;
            case "<":
              return blockValue < numValue;
            case "=":
            case "==":
              return blockValue === numValue;
            default:
              return false;
          }
        });
      }

      // Check for status filter: status=next
      const statusMatch = query.match(/status=(\w+)/i);
      if (statusMatch) {
        const statusValue = statusMatch[1].toLowerCase();
        results = results.filter((block) => block.status?.toLowerCase() === statusValue);
      }

      // Check for NOT conditions: status!=done
      const notStatusMatch = query.match(/status!=(\w+)/i);
      if (notStatusMatch) {
        const statusValue = notStatusMatch[1].toLowerCase();
        results = results.filter((block) => block.status?.toLowerCase() !== statusValue);
      }
    }

    // Apply sorting
    if (sortBy) {
      results.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortBy === "title" || sortBy === "path" || sortBy === "type" || sortBy === "status") {
          aValue = a[sortBy as keyof MockBlock] || "";
          bValue = b[sortBy as keyof MockBlock] || "";
        } else {
          // Property column
          aValue = a.properties?.[sortBy] || "";
          bValue = b.properties?.[sortBy] || "";
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return results;
  }, [scope, scopePath, query, sortBy, sortDirection]);

  const queryResults = executeQuery;

  // Group results if groupBy is set
  const groupedResults = useMemo(() => {
    if (!groupBy) return { "": queryResults };

    const groups: Record<string, MockBlock[]> = {};

    queryResults.forEach((block) => {
      let groupValue: string;

      if (groupBy === "status" || groupBy === "type") {
        groupValue = String(block[groupBy as keyof MockBlock] || "None");
      } else {
        groupValue = String(block.properties?.[groupBy] || "None");
      }

      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(block);
    });

    return groups;
  }, [queryResults, groupBy]);

  // Get cell value
  const getCellValue = (block: MockBlock, columnId: string): string => {
    if (columnId === "title" || columnId === "path" || columnId === "type") {
      return String(block[columnId as keyof MockBlock] || "-");
    }
    if (columnId === "status") {
      return block.status || "-";
    }
    const propValue = block.properties?.[columnId];
    if (propValue === undefined) return "-";
    if (typeof propValue === "boolean") return propValue ? "Yes" : "No";
    return String(propValue);
  };

  // Get status badge color
  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case "todo":
        return "bg-neutral-700 text-neutral-300";
      case "next":
        return "bg-blue-500/20 text-blue-300";
      case "wip":
        return "bg-yellow-500/20 text-yellow-300";
      case "waiting":
        return "bg-orange-500/20 text-orange-300";
      case "done":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-neutral-700 text-neutral-400";
    }
  };

  const enabledColumns = columns.filter((c) => c.enabled);

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/vision/overview"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Slice Builder Prototype</h1>
          <p className="text-neutral-400">
            Query and view your outline data with powerful filtering and table views
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Builder */}
          <div className="space-y-6">
            {/* Slice Name */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-neutral-100 mb-2">
                Slice Name
              </label>
              <input
                type="text"
                value={sliceName}
                onChange={(e) => setSliceName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-blue-500"
                placeholder="Enter slice name..."
              />
            </div>

            {/* Scope */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-neutral-100 mb-3">Scope</label>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setScope("global")}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${
                    scope === "global"
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                  }`}
                >
                  Global
                </button>
                <button
                  onClick={() => setScope("subtree")}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${
                    scope === "subtree"
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                  }`}
                >
                  Subtree
                </button>
              </div>

              {scope === "subtree" && (
                <input
                  type="text"
                  value={scopePath}
                  onChange={(e) => setScopePath(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g., /Cities or /Projects/Launch"
                />
              )}
            </div>

            {/* Query DSL */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-neutral-100 mb-2">Query</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-sm font-mono focus:outline-none focus:border-blue-500"
                placeholder="e.g., path:/Cities/* AND prop.category=coffee"
                rows={3}
              />

              {/* Example Queries */}
              <div className="mt-3">
                <div className="text-xs text-neutral-500 mb-2">Example Queries:</div>
                <div className="flex flex-wrap gap-2">
                  {exampleSliceQueries.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadExample(example.query)}
                      className="px-2 py-1 bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300 rounded text-xs transition-colors"
                      title={example.description}
                    >
                      {example.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Columns */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-neutral-100 mb-3">Columns</label>

              {/* Built-in columns */}
              <div className="mb-3">
                <div className="text-xs text-neutral-500 mb-2">Built-in:</div>
                <div className="flex flex-wrap gap-2">
                  {columns
                    .filter((c) => ["title", "path", "status", "type"].includes(c.id))
                    .map((col) => (
                      <label
                        key={col.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded cursor-pointer hover:bg-neutral-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={col.enabled}
                          onChange={() => toggleColumn(col.id)}
                          className="rounded border-neutral-600"
                        />
                        <span className="text-sm text-neutral-300">{col.label}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Property columns */}
              <div>
                <div className="text-xs text-neutral-500 mb-2">Properties:</div>
                <div className="flex flex-wrap gap-2">
                  {mockPropertyColumns.map((prop) => (
                    <button
                      key={prop}
                      onClick={() => addPropertyColumn(prop)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        columns.find((c) => c.id === prop)?.enabled
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300"
                      }`}
                    >
                      {prop}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort & Group */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-neutral-100 mb-3">
                Sort & Group
              </label>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Sort By:</div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="title">Title</option>
                    <option value="path">Path</option>
                    <option value="status">Status</option>
                    <option value="type">Type</option>
                    {mockPropertyColumns.map((prop) => (
                      <option key={prop} value={prop}>
                        {prop}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-xs text-neutral-500 mb-1">Direction:</div>
                  <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value as SortDirection)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-500 mb-1">Group By:</div>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  <option value="status">Status</option>
                  <option value="type">Type</option>
                  {mockPropertyColumns.map((prop) => (
                    <option key={prop} value={prop}>
                      {prop}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  console.log("Save slice:", {
                    sliceName,
                    scope,
                    scopePath,
                    query,
                    columns,
                    sortBy,
                    groupBy,
                  })
                }
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Slice
              </button>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              {/* Preview Header */}
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-100">Preview</h3>
                  <div className="text-xs text-neutral-500">
                    {queryResults.length} result{queryResults.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-800/50 sticky top-0">
                    <tr>
                      {enabledColumns.map((col) => (
                        <th
                          key={col.id}
                          className="px-3 py-2 text-left text-xs font-semibold text-neutral-400 border-b border-neutral-800"
                          style={{ minWidth: col.width }}
                        >
                          <button
                            onClick={() => {
                              if (sortBy === col.id) {
                                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                              } else {
                                setSortBy(col.id);
                                setSortDirection("asc");
                              }
                            }}
                            className="inline-flex items-center gap-1 hover:text-neutral-300"
                          >
                            {col.label}
                            {sortBy === col.id && <ArrowUpDown className="w-3 h-3" />}
                          </button>
                        </th>
                      ))}
                      <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-400 border-b border-neutral-800 w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedResults).map(([groupValue, blocks]) => (
                      <React.Fragment key={groupValue}>
                        {/* Group Header */}
                        {groupBy && (
                          <tr className="bg-neutral-800/30">
                            <td
                              colSpan={enabledColumns.length + 1}
                              className="px-3 py-2 text-xs font-semibold text-neutral-300 border-b border-neutral-800"
                            >
                              {groupBy}: {groupValue} ({blocks.length})
                            </td>
                          </tr>
                        )}

                        {/* Rows */}
                        {blocks.map((block) => (
                          <tr
                            key={block.id}
                            className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                          >
                            {enabledColumns.map((col) => (
                              <td
                                key={col.id}
                                className="px-3 py-2 text-neutral-300"
                                style={{ minWidth: col.width }}
                              >
                                {col.id === "status" ? (
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(block.status)}`}
                                  >
                                    {getCellValue(block, col.id)}
                                  </span>
                                ) : col.id === "title" ? (
                                  <span className="font-medium">{getCellValue(block, col.id)}</span>
                                ) : col.id === "path" ? (
                                  <span className="text-neutral-500 text-xs font-mono">
                                    {getCellValue(block, col.id)}
                                  </span>
                                ) : (
                                  <span>{getCellValue(block, col.id)}</span>
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => console.log("Open block:", block.id)}
                                  className="p-1 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 rounded transition-colors"
                                  title="Open"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => console.log("Reveal in outline:", block.id)}
                                  className="p-1 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 rounded transition-colors"
                                  title="Reveal in outline"
                                >
                                  <Target className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {/* Empty State */}
                {queryResults.length === 0 && (
                  <div className="p-12 text-center">
                    <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-400 mb-2">No results found</h3>
                    <p className="text-sm text-neutral-500">Try adjusting your query or scope</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-100 mb-2">About Slices</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Slices are saved queries that let you view your outline data in different ways. Use the
            query DSL to filter blocks by path, properties, and status. Choose which columns to
            display, and sort or group the results. Click example queries to see how they work. The
            table view supports sorting by clicking column headers, and each row has actions to open
            the block or reveal it in the outline.
          </p>
        </div>
      </div>
    </div>
  );
}
