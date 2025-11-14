"use client";

import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Edit2, ExternalLink, FileText, List, Table2, CheckSquare } from "lucide-react";
import { db } from "@/lib/dexie";
import { buildPath } from "@/lib/path";
import { TableView } from "@/components/slices/TableView";
import { Outliner } from "@/components/outliner/Outliner";
import { PropertyChips } from "@/components/properties/PropertyChips";
import type { Block } from "@/lib/types";

export default function BlockPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Load the block
  const block = useLiveQuery(() => db.blocks.get(id), [id]);

  // Load associated slice if block is type "view"
  const slice = useLiveQuery(async () => {
    if (!block || block.type !== "view") return null;
    return await db.slices.where("blockId").equals(id).first();
  }, [block, id]);

  // Build breadcrumb path
  const breadcrumbPath = useLiveQuery(async () => {
    if (!block) return null;
    return await buildPath(id);
  }, [block, id]);

  // Get parent and children info
  const parent = useLiveQuery(async () => {
    if (!block?.parentId) return null;
    return await db.blocks.get(block.parentId);
  }, [block]);

  const childrenCount = useLiveQuery(async () => {
    if (!block) return 0;
    return await db.blocks.where("parentId").equals(id).count();
  }, [block, id]);

  // Loading state
  if (block === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Not found state
  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <FileText className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">Block Not Found</h1>
        <p className="text-gray-600">The block you&apos;re looking for doesn&apos;t exist.</p>
        <button
          onClick={() => router.push("/editor")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Editor
        </button>
      </div>
    );
  }

  const getBlockTypeIcon = (type: Block["type"]) => {
    switch (type) {
      case "heading":
        return <List className="w-5 h-5" />;
      case "todo":
        return <CheckSquare className="w-5 h-5" />;
      case "view":
        return <Table2 className="w-5 h-5" />;
      case "paragraph":
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getBlockTypeColor = (type: Block["type"]) => {
    switch (type) {
      case "heading":
        return "bg-purple-100 text-purple-700";
      case "todo":
        return "bg-green-100 text-green-700";
      case "view":
        return "bg-orange-100 text-orange-700";
      case "paragraph":
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case "view":
        if (!slice) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <Table2 className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <p className="text-yellow-800 font-medium mb-2">No slice found</p>
              <p className="text-sm text-yellow-700">
                This is a view block, but no associated slice exists.
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{slice.name}</h3>
                <div className="text-sm text-gray-600">
                  Scope: {slice.scope === "global" ? "Global" : `Scoped to block`}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Query</p>
                <code className="text-sm text-gray-800 font-mono break-all">
                  {slice.dsl || "No query"}
                </code>
              </div>
            </div>
            <TableView sliceId={slice.id} />
          </div>
        );

      case "heading":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 mb-2">
                This is a heading block with {childrenCount ?? 0} child
                {childrenCount !== 1 ? "ren" : ""}.
              </p>
              <p className="text-sm text-blue-700">
                The outliner below shows this heading&apos;s children.
              </p>
            </div>
            <div
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              style={{ height: "600px" }}
            >
              <Outliner rootBlockId={id} />
            </div>
          </div>
        );

      case "todo":
        return (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        block.content?.includes("DONE")
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {block.content || "TODO"}
                    </span>
                  </div>
                </div>

                {block.title && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-gray-900">{block.title}</p>
                  </div>
                )}

                {block.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {block.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Created</label>
                    <p className="text-sm text-gray-700">
                      {new Date(block.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Updated</label>
                    <p className="text-sm text-gray-700">
                      {new Date(block.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "paragraph":
      default:
        return (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                {block.title && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-gray-900">{block.title}</p>
                  </div>
                )}

                {block.content && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Content</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{block.content}</p>
                  </div>
                )}

                {!block.title && !block.content && (
                  <p className="text-gray-500 italic">No content</p>
                )}

                {block.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {block.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Created</label>
                    <p className="text-sm text-gray-700">
                      {new Date(block.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Updated</label>
                    <p className="text-sm text-gray-700">
                      {new Date(block.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Breadcrumb */}
          {breadcrumbPath && (
            <div className="mb-3">
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <button
                  onClick={() => router.push("/editor")}
                  className="hover:text-blue-600 transition-colors"
                >
                  Editor
                </button>
                <span>/</span>
                <span className="font-mono text-gray-500">{breadcrumbPath}</span>
              </nav>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${getBlockTypeColor(block.type)}`}>
                  {getBlockTypeIcon(block.type)}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {block.title || block.content || "(Untitled)"}
                </h1>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getBlockTypeColor(block.type)}`}
                >
                  {block.type}
                </span>
                <span>Level {block.level}</span>
                {parent && (
                  <>
                    <span>·</span>
                    <button
                      onClick={() => router.push(`/blocks/${parent.id}`)}
                      className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Parent: {parent.title || parent.content || "Untitled"}
                    </button>
                  </>
                )}
                {childrenCount !== undefined && childrenCount > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      {childrenCount} child{childrenCount !== 1 ? "ren" : ""}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/editor")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Open in outline editor"
              >
                <Edit2 className="w-4 h-4" />
                Open in Editor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Properties */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Properties</h2>
            <PropertyChips blockId={id} />
          </div>

          {/* Block-specific content */}
          {renderBlockContent()}

          {/* Metadata */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Metadata</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 font-medium">Block ID</dt>
                <dd className="text-gray-900 font-mono text-xs mt-1">{block.id}</dd>
              </div>
              {block.parentId && (
                <div>
                  <dt className="text-gray-500 font-medium">Parent ID</dt>
                  <dd className="text-gray-900 font-mono text-xs mt-1">
                    <button
                      onClick={() => router.push(`/blocks/${block.parentId}`)}
                      className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                      {block.parentId}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500 font-medium">Sort Order</dt>
                <dd className="text-gray-900 mt-1">{block.sort}</dd>
              </div>
              <div>
                <dt className="text-gray-500 font-medium">Level</dt>
                <dd className="text-gray-900 mt-1">{block.level}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
