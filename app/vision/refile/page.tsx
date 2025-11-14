"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, ArrowLeft, FolderTree, Clock, ChevronRight } from "lucide-react";
import { fuzzySearchHeadings, mockRecentDestinations, type MockHeading } from "@/lib/mock-data";
import Link from "next/link";

type RefileMode = "drop" | "anchor";

export default function RefilePrototypePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<RefileMode>("drop");
  const [searchResults, setSearchResults] = useState<MockHeading[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedItem] = useState<string>('Task to refile: "Review PRs for new feature"');
  const [pathInput, setPathInput] = useState("");
  const [previewPath, setPreviewPath] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Callback functions
  const resetModal = useCallback(() => {
    setSearchQuery("");
    setPathInput("");
    setPreviewPath([]);
    setSearchResults([]);
    setSelectedIndex(0);
  }, []);

  const handleRefile = useCallback(
    (destination: MockHeading) => {
      console.log(`Refiling "${selectedItem}" to:`, destination.path, `(mode: ${mode})`);
      alert(
        `Refiled to: ${destination.path}\nMode: ${mode === "drop" ? "Drop here" : "Anchor to path"}`
      );
      setIsModalOpen(false);
      resetModal();
    },
    [selectedItem, mode, resetModal]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open modal with Cmd+Shift+R
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "r") {
        e.preventDefault();
        setIsModalOpen(true);
      }

      // Close modal with Escape
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        resetModal();
      }

      // Toggle mode with Alt key
      if (e.key === "Alt" && isModalOpen) {
        setMode((prev) => (prev === "drop" ? "anchor" : "drop"));
      }

      // Navigate results with arrow keys
      if (isModalOpen && searchResults.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleRefile(searchResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, searchResults, selectedIndex, handleRefile, resetModal]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isModalOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isModalOpen]);

  // Update search results
  useEffect(() => {
    if (searchQuery) {
      const results = fuzzySearchHeadings(searchQuery);
      setSearchResults(results);
      setSelectedIndex(0);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Parse path input for preview
  useEffect(() => {
    if (pathInput) {
      // Remove leading # if present
      const cleanPath = pathInput.replace(/^#\/?/, "");
      const parts = cleanPath.split("/").filter((p) => p.trim());
      setPreviewPath(parts);
    } else {
      setPreviewPath([]);
    }
  }, [pathInput]);

  const handlePathRefile = () => {
    if (previewPath.length > 0) {
      const fullPath = "#/" + previewPath.join("/");
      console.log(`Refiling "${selectedItem}" to new path:`, fullPath, `(mode: ${mode})`);
      alert(
        `Refiled to new path: ${fullPath}\nMode: ${mode === "drop" ? "Drop here" : "Anchor to path"}\n\nThis would create: ${previewPath.join(" → ")}`
      );
      setIsModalOpen(false);
      resetModal();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/vision/overview"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Refile Modal Prototype</h1>
          <p className="text-neutral-400">
            Fuzzy search and path-based refiling with keyboard shortcuts
          </p>
        </div>

        {/* Demo Instructions */}
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 mb-8">
          <h2 className="text-lg font-semibold text-neutral-100 mb-4">Try It Out</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-300 mb-2">
                Simulating refiling:{" "}
                <span className="font-semibold text-blue-400">
                  &quot;Review PRs for new feature&quot;
                </span>
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Open Refile Modal
              </button>
            </div>

            <div className="border-t border-neutral-800 pt-4">
              <h3 className="text-sm font-semibold text-neutral-100 mb-2">Keyboard Shortcuts:</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Cmd+Shift+R</kbd> - Open
                  refile modal
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Alt</kbd> - Toggle
                  Drop/Anchor mode
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">↑ / ↓</kbd> - Navigate
                  results
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Enter</kbd> - Select
                  destination
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Esc</kbd> - Close modal
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-neutral-100 mb-2">Fuzzy Search</h3>
            <ul className="space-y-1 text-sm text-neutral-400">
              <li>Search existing headings</li>
              <li>Keyboard navigation</li>
              <li>Quick selection with Enter</li>
              <li>Real-time filtering</li>
            </ul>
          </div>
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-neutral-100 mb-2">Path Creation</h3>
            <ul className="space-y-1 text-sm text-neutral-400">
              <li>Create new paths on the fly</li>
              <li>Visual path preview</li>
              <li>Auto-create intermediate headings</li>
              <li>Support for # prefix</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Refile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24">
          <div className="bg-neutral-900 rounded-lg shadow-2xl w-full max-w-2xl border border-neutral-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <FolderTree className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-neutral-100">Refile Item</h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetModal();
                }}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Current Item */}
            <div className="p-4 bg-neutral-800/50 border-b border-neutral-800">
              <span className="text-xs text-neutral-500">Refiling:</span>
              <p className="text-sm text-neutral-100 font-medium">{selectedItem}</p>
            </div>

            {/* Mode Toggle */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-800/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Mode:</span>
                <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setMode("drop")}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      mode === "drop"
                        ? "bg-blue-600 text-white"
                        : "text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    Drop here
                  </button>
                  <button
                    onClick={() => setMode("anchor")}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      mode === "anchor"
                        ? "bg-blue-600 text-white"
                        : "text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    Anchor to path
                  </button>
                </div>
                <span className="text-xs text-neutral-500 ml-auto">
                  Press <kbd className="px-1 py-0.5 bg-neutral-700 rounded">Alt</kbd> to toggle
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for destination..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-4 bg-neutral-800 rounded-lg border border-neutral-700 max-h-64 overflow-auto">
                  {searchResults.slice(0, 10).map((result, idx) => (
                    <button
                      key={result.id}
                      onClick={() => handleRefile(result)}
                      className={`w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors border-b border-neutral-700 last:border-b-0 ${
                        idx === selectedIndex ? "bg-neutral-700" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-neutral-100">{result.title}</p>
                          <p className="text-xs text-neutral-400">{result.path}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Or Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-neutral-700" />
                <span className="text-xs text-neutral-500">OR</span>
                <div className="flex-1 h-px bg-neutral-700" />
              </div>

              {/* Path Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Create new path
                </label>
                <input
                  type="text"
                  value={pathInput}
                  onChange={(e) => setPathInput(e.target.value)}
                  placeholder="#A/B/C or A/B/C"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Path Preview */}
                {previewPath.length > 0 && (
                  <div className="mt-3 p-3 bg-neutral-800 rounded-lg">
                    <span className="text-xs text-neutral-500 block mb-2">Will create:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {previewPath.map((part, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm text-blue-300 font-medium">{part}</span>
                          {idx < previewPath.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-neutral-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Destinations */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-sm font-medium text-neutral-300">Recent Destinations</h3>
                </div>
                <div className="space-y-1">
                  {mockRecentDestinations.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => handleRefile(dest)}
                      className="w-full px-3 py-2 text-left hover:bg-neutral-800 rounded-lg transition-colors text-sm text-neutral-400 hover:text-neutral-100"
                    >
                      {dest.path}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-800">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetModal();
                }}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              {pathInput && previewPath.length > 0 && (
                <button
                  onClick={handlePathRefile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Create & Refile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
