"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Circle,
  CheckCircle2,
  Clock,
  Loader,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { mockBlocks, type MockBlock } from "@/lib/mock-data";

type StatusType = "todo" | "next" | "wip" | "waiting" | "done";

export default function OutlinePrototypePage() {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [zoomedNode, setZoomedNode] = useState<MockBlock | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Get the blocks to display (either zoomed subtree or all blocks)
  const displayBlocks = zoomedNode ? zoomedNode.children || [] : mockBlocks;

  // Toggle node collapse
  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Zoom into a node
  const zoomToNode = (node: MockBlock) => {
    if (node.children && node.children.length > 0) {
      setZoomedNode(node);
      setCollapsedNodes(new Set()); // Reset collapsed state when zooming
    }
  };

  // Zoom out to parent
  const zoomOut = () => {
    setZoomedNode(null);
  };

  // Toggle status
  const cycleStatus = (
    nodeId: string,
    currentStatus: StatusType | undefined,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const statusOrder: StatusType[] = ["todo", "next", "wip", "waiting", "done"];
    const currentIndex = currentStatus ? statusOrder.indexOf(currentStatus) : -1;
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    console.log(`Toggle status for ${nodeId}: ${currentStatus} -> ${nextStatus}`);
  };

  // Get status icon and color
  const getStatusIcon = (status: StatusType | undefined) => {
    switch (status) {
      case "todo":
        return <Circle className="w-4 h-4 text-neutral-500" />;
      case "next":
        return <Circle className="w-4 h-4 text-blue-400 fill-blue-400" />;
      case "wip":
        return <Loader className="w-4 h-4 text-yellow-400" />;
      case "waiting":
        return <Clock className="w-4 h-4 text-orange-400" />;
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: StatusType | undefined): string => {
    switch (status) {
      case "todo":
        return "text-neutral-400";
      case "next":
        return "text-blue-300";
      case "wip":
        return "text-yellow-300";
      case "waiting":
        return "text-orange-300";
      case "done":
        return "text-green-300 line-through";
      default:
        return "text-neutral-300";
    }
  };

  // Render a single node and its children recursively
  const renderNode = (node: MockBlock, depth: number = 0): React.ReactElement | null => {
    const isCollapsed = collapsedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode === node.id;
    const indent = depth * 24; // 24px per level for org-mode style indent

    return (
      <div key={node.id}>
        {/* Node Row */}
        <div
          className={`group flex items-start gap-2 py-2 px-3 rounded transition-colors cursor-pointer ${
            isSelected ? "bg-blue-500/10 border-l-2 border-blue-500" : "hover:bg-neutral-900/50"
          }`}
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => setSelectedNode(node.id)}
        >
          {/* Drag Handle */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="w-4 h-4 text-neutral-600" />
          </div>

          {/* Collapse/Expand Chevron */}
          <div className="flex-shrink-0 w-4 h-4">
            {hasChildren ? (
              <button
                onClick={(e) => toggleCollapse(node.id, e)}
                className="hover:bg-neutral-800 rounded transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Status Icon (for todos) */}
          {node.type === "todo" && (
            <button
              onClick={(e) => cycleStatus(node.id, node.status, e)}
              className="flex-shrink-0 hover:bg-neutral-800 rounded transition-colors p-0.5"
            >
              {getStatusIcon(node.status)}
            </button>
          )}

          {/* Title */}
          <div className="flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                zoomToNode(node);
              }}
              className={`text-left font-medium ${getStatusColor(node.status)} ${
                node.type === "heading" ? "text-base" : "text-sm"
              } ${hasChildren ? "hover:text-blue-400" : ""}`}
            >
              {node.title}
            </button>

            {/* Properties */}
            {node.properties && Object.keys(node.properties).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {Object.entries(node.properties).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded text-xs"
                  >
                    <Tag className="w-3 h-3" />
                    <span className="text-neutral-500">{key}:</span>
                    <span className="text-neutral-300">
                      {typeof value === "boolean" ? (value ? "yes" : "no") : String(value)}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Level Badge (for headings) */}
          {node.type === "heading" && (
            <div className="flex-shrink-0 text-xs text-neutral-600 font-mono">L{node.level}</div>
          )}
        </div>

        {/* Children (if expanded) */}
        {!isCollapsed && hasChildren && (
          <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  // Get breadcrumb path when zoomed
  const getBreadcrumb = (): string[] => {
    if (!zoomedNode) return [];
    return zoomedNode.path.split("/").filter((p) => p && p !== "#");
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/vision/overview"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Outline Editor Prototype</h1>
          <p className="text-neutral-400">
            Hierarchical tree view with folding, zooming, and inline properties
          </p>
        </div>

        {/* Breadcrumb (when zoomed) */}
        {zoomedNode && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <button
              onClick={zoomOut}
              className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              Zoom Out
            </button>
            <div className="flex items-center gap-2 text-neutral-500">
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span>/</span>}
                  <span
                    className={idx === breadcrumbs.length - 1 ? "text-neutral-300 font-medium" : ""}
                  >
                    {crumb}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="mb-4 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-100 mb-3">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-400 font-mono">Tab</kbd>
              <span className="text-neutral-500">Indent</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-400 font-mono">
                Shift+Tab
              </kbd>
              <span className="text-neutral-500">Outdent</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-400 font-mono">
                Enter
              </kbd>
              <span className="text-neutral-500">New sibling</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-400 font-mono">M</kbd>
              <span className="text-neutral-500">Refile</span>
            </div>
          </div>
        </div>

        {/* Outline View */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
            <h3 className="text-sm font-semibold text-neutral-100">
              {zoomedNode ? `Viewing: ${zoomedNode.title}` : "All Nodes"}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Click headings to zoom, click chevrons to fold/unfold, click status icons to cycle
              states
            </p>
          </div>

          <div className="p-2 max-h-[600px] overflow-y-auto">
            {displayBlocks.map((node) => renderNode(node, 0))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="text-xs text-neutral-500 mb-1">Total Nodes</div>
            <div className="text-2xl font-bold text-neutral-100">
              {(() => {
                let count = 0;
                const countNodes = (blocks: MockBlock[]) => {
                  blocks.forEach((b) => {
                    count++;
                    if (b.children) countNodes(b.children);
                  });
                };
                countNodes(mockBlocks);
                return count;
              })()}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="text-xs text-neutral-500 mb-1">Todo</div>
            <div className="text-2xl font-bold text-neutral-400">
              {(() => {
                let count = 0;
                const countStatus = (blocks: MockBlock[]) => {
                  blocks.forEach((b) => {
                    if (b.status === "todo") count++;
                    if (b.children) countStatus(b.children);
                  });
                };
                countStatus(mockBlocks);
                return count;
              })()}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="text-xs text-neutral-500 mb-1">Next</div>
            <div className="text-2xl font-bold text-blue-400">
              {(() => {
                let count = 0;
                const countStatus = (blocks: MockBlock[]) => {
                  blocks.forEach((b) => {
                    if (b.status === "next") count++;
                    if (b.children) countStatus(b.children);
                  });
                };
                countStatus(mockBlocks);
                return count;
              })()}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="text-xs text-neutral-500 mb-1">WIP</div>
            <div className="text-2xl font-bold text-yellow-400">
              {(() => {
                let count = 0;
                const countStatus = (blocks: MockBlock[]) => {
                  blocks.forEach((b) => {
                    if (b.status === "wip") count++;
                    if (b.children) countStatus(b.children);
                  });
                };
                countStatus(mockBlocks);
                return count;
              })()}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="text-xs text-neutral-500 mb-1">Done</div>
            <div className="text-2xl font-bold text-green-400">
              {(() => {
                let count = 0;
                const countStatus = (blocks: MockBlock[]) => {
                  blocks.forEach((b) => {
                    if (b.status === "done") count++;
                    if (b.children) countStatus(b.children);
                  });
                };
                countStatus(mockBlocks);
                return count;
              })()}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-100 mb-2">About the Outline Editor</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            This prototype demonstrates an Org-mode style outline editor with virtual indentation,
            fold/unfold capabilities, and zoom functionality. Click on any heading to zoom into its
            subtree. Properties are displayed inline under each node as chips. Status can be toggled
            by clicking the status icon. The drag handles (visible on hover) indicate where
            drag-and-drop reordering would be possible in the full implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
