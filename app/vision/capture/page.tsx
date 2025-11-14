"use client";

import { useState, useEffect, useRef } from "react";
import { X, Hash, Calendar, Folder, ArrowLeft, Save } from "lucide-react";
import {
  parseCaptureInput,
  fuzzySearchHeadings,
  mockHeadings,
  type ParsedCapture,
} from "@/lib/mock-data";
import Link from "next/link";

type CaptureMode = "nlp" | "form";

export default function CapturePrototypePage() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [mode, setMode] = useState<CaptureMode>("nlp");
  const [nlpInput, setNlpInput] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedCapture | null>(null);

  // Form mode state
  const [formTitle, setFormTitle] = useState("");
  const [formPath, setFormPath] = useState("");
  const [formDue, setFormDue] = useState("");
  const [formTags, setFormTags] = useState("");

  // Path autocomplete
  const [pathQuery, setPathQuery] = useState("");
  const [showPathSuggestions, setShowPathSuggestions] = useState(false);
  const [pathSuggestions, setPathSuggestions] = useState(mockHeadings);

  const inputRef = useRef<HTMLInputElement>(null);
  const pathInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to open overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
        e.preventDefault();
        setIsOverlayOpen(true);
      }
      if (e.key === "Escape" && isOverlayOpen) {
        setIsOverlayOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayOpen]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOverlayOpen && mode === "nlp" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOverlayOpen, mode]);

  // Parse NLP input in real-time
  useEffect(() => {
    if (nlpInput) {
      const parsed = parseCaptureInput(nlpInput);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  }, [nlpInput]);

  // Path autocomplete
  useEffect(() => {
    if (pathQuery) {
      const results = fuzzySearchHeadings(pathQuery);
      setPathSuggestions(results);
    } else {
      setPathSuggestions(mockHeadings);
    }
  }, [pathQuery]);

  const handleSave = () => {
    if (mode === "nlp" && parsedResult) {
      console.log("Saving NLP capture:", parsedResult);
      alert(
        `Captured: "${parsedResult.title}"\nTags: ${parsedResult.tags.join(", ")}\nPath: ${parsedResult.path || "inbox"}\nDue: ${parsedResult.due || "none"}`
      );
    } else if (mode === "form") {
      console.log("Saving form capture:", {
        title: formTitle,
        path: formPath,
        due: formDue,
        tags: formTags.split(",").map((t) => t.trim()),
      });
      alert(
        `Captured: "${formTitle}"\nTags: ${formTags}\nPath: ${formPath || "inbox"}\nDue: ${formDue || "none"}`
      );
    }
    resetForm();
    setIsOverlayOpen(false);
  };

  const resetForm = () => {
    setNlpInput("");
    setParsedResult(null);
    setFormTitle("");
    setFormPath("");
    setFormDue("");
    setFormTags("");
    setPathQuery("");
  };

  const handlePathSelect = (path: string) => {
    if (mode === "nlp") {
      // Insert path into NLP input
      const pathWithoutHash = path.replace(/^#\//, "");
      setNlpInput((prev) => `${prev} @${pathWithoutHash}`);
    } else {
      setFormPath(path);
    }
    setShowPathSuggestions(false);
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
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Capture Overlay Prototype</h1>
          <p className="text-neutral-400">
            Quick capture interface with NLP-style parsing and micro-form mode
          </p>
        </div>

        {/* Demo Instructions */}
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 mb-8">
          <h2 className="text-lg font-semibold text-neutral-100 mb-4">Try It Out</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-300 mb-2">
                Click the button below or press{" "}
                <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">Cmd+Shift+C</kbd> to open
                the capture overlay
              </p>
              <button
                onClick={() => setIsOverlayOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Open Capture Overlay
              </button>
            </div>

            <div className="border-t border-neutral-800 pt-4">
              <h3 className="text-sm font-semibold text-neutral-100 mb-2">NLP Examples:</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <code className="text-neutral-300">Buy milk #Errands due tomorrow @shopping</code>
                </li>
                <li>
                  <code className="text-neutral-300">
                    Review PR #dev #urgent due 2025-11-20 @Projects/Launch
                  </code>
                </li>
                <li>
                  <code className="text-neutral-300">Call dentist #health due friday</code>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-neutral-100 mb-2">NLP Mode</h3>
            <ul className="space-y-1 text-sm text-neutral-400">
              <li>Parse tags with #</li>
              <li>Parse path with @</li>
              <li>Parse due date with &quot;due&quot;</li>
              <li>Real-time visual feedback</li>
            </ul>
          </div>
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-neutral-100 mb-2">Form Mode</h3>
            <ul className="space-y-1 text-sm text-neutral-400">
              <li>Separate fields for each property</li>
              <li>Path autocomplete dropdown</li>
              <li>Date picker integration</li>
              <li>Tag list input</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Capture Overlay */}
      {isOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24">
          <div className="bg-neutral-900 rounded-lg shadow-2xl w-full max-w-2xl border border-neutral-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-100">Quick Capture</h2>
              <div className="flex items-center gap-2">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setMode("nlp")}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      mode === "nlp"
                        ? "bg-blue-600 text-white"
                        : "text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    NLP
                  </button>
                  <button
                    onClick={() => setMode("form")}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      mode === "form"
                        ? "bg-blue-600 text-white"
                        : "text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    Form
                  </button>
                </div>
                <button
                  onClick={() => setIsOverlayOpen(false)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {mode === "nlp" ? (
                <>
                  {/* NLP Input */}
                  <div className="mb-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={nlpInput}
                      onChange={(e) => setNlpInput(e.target.value)}
                      placeholder="e.g., Buy milk #Errands due tomorrow @shopping"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-neutral-500 mt-2">
                      Use # for tags, @ for path, &quot;due&quot; for dates
                    </p>
                  </div>

                  {/* Parsed Result */}
                  {parsedResult && parsedResult.title && (
                    <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-xs text-neutral-500">Title</span>
                        <p className="text-neutral-100 font-medium">{parsedResult.title}</p>
                      </div>

                      {parsedResult.tags.length > 0 && (
                        <div>
                          <span className="text-xs text-neutral-500 block mb-2">Tags</span>
                          <div className="flex flex-wrap gap-2">
                            {parsedResult.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                              >
                                <Hash className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {parsedResult.path && (
                        <div>
                          <span className="text-xs text-neutral-500 block mb-2">Path</span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            <Folder className="w-3 h-3" />
                            {parsedResult.path}
                          </span>
                        </div>
                      )}

                      {parsedResult.due && (
                        <div>
                          <span className="text-xs text-neutral-500 block mb-2">Due Date</span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                            <Calendar className="w-3 h-3" />
                            {parsedResult.due}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Form Mode */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Task title..."
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Path (optional)
                      </label>
                      <input
                        ref={pathInputRef}
                        type="text"
                        value={pathQuery || formPath}
                        onChange={(e) => {
                          setPathQuery(e.target.value);
                          setShowPathSuggestions(true);
                        }}
                        onFocus={() => setShowPathSuggestions(true)}
                        placeholder="Start typing to search paths..."
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* Path Suggestions Dropdown */}
                      {showPathSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-auto">
                          {pathSuggestions.slice(0, 10).map((heading) => (
                            <button
                              key={heading.id}
                              onClick={() => handlePathSelect(heading.path)}
                              className="w-full px-4 py-2 text-left hover:bg-neutral-700 transition-colors text-sm text-neutral-300 hover:text-neutral-100"
                            >
                              {heading.path}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Due Date (optional)
                      </label>
                      <input
                        type="date"
                        value={formDue}
                        onChange={(e) => setFormDue(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="e.g., work, urgent, review"
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-800">
              <button
                onClick={() => {
                  resetForm();
                  setIsOverlayOpen(false);
                }}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={mode === "nlp" ? !parsedResult?.title : !formTitle}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
