"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { RotateCcw, Database, CheckCircle2, XCircle } from "lucide-react";
import { Outliner } from "@/components/outliner/Outliner";
import { db, seedDatabase, resetDatabase } from "@/lib/dexie";

export default function EditorPage() {
  const [isSeedingDb, setIsSeedingDb] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Get block count for stats
  const blockCount = useLiveQuery(() => db.blocks.count());
  const propCount = useLiveQuery(() => db.props.count());
  const sliceCount = useLiveQuery(() => db.slices.count());

  // Seed database on first load if empty
  useEffect(() => {
    const initDb = async () => {
      try {
        const count = await db.blocks.count();
        if (count === 0) {
          setIsSeedingDb(true);
          await seedDatabase();
          setSeedSuccess(true);
          setTimeout(() => setSeedSuccess(false), 3000);
        }
      } catch (error) {
        console.error("Failed to seed database:", error);
        setSeedError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsSeedingDb(false);
      }
    };

    initDb();
  }, []);

  const handleResetDatabase = async () => {
    if (!confirm("Are you sure you want to reset the database? All changes will be lost.")) {
      return;
    }

    setIsSeedingDb(true);
    setSeedError(null);
    setSeedSuccess(false);

    try {
      await resetDatabase();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to reset database:", error);
      setSeedError(error instanceof Error ? error.message : "Failed to reset database");
    } finally {
      setIsSeedingDb(false);
    }
  };

  return (
    <section className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Outline Editor</h1>
            <p className="text-sm text-gray-600">Test and debug the outliner component</p>
          </div>

          {/* Database Stats and Actions */}
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="font-medium">Database:</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{blockCount ?? 0} blocks</span>
                <span className="text-gray-400">·</span>
                <span>{propCount ?? 0} properties</span>
                <span className="text-gray-400">·</span>
                <span>{sliceCount ?? 0} slices</span>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetDatabase}
              disabled={isSeedingDb}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Reset database with seed data"
            >
              <RotateCcw className={`w-4 h-4 ${isSeedingDb ? "animate-spin" : ""}`} />
              {isSeedingDb ? "Resetting..." : "Reset Database"}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {seedSuccess && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Database reset successfully</span>
          </div>
        )}

        {seedError && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error: {seedError}</span>
          </div>
        )}
      </div>

      {/* Outliner Component */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {isSeedingDb ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Database className="w-16 h-16 mb-4 animate-pulse" />
            <p className="text-lg font-medium">Seeding database...</p>
            <p className="text-sm mt-2">This will only take a moment</p>
          </div>
        ) : (
          <Outliner />
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="border-t border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-6">
            <span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> New sibling
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">Shift+Enter</kbd> New child
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> Indent
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">Shift+Tab</kbd> Outdent
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">Alt+↑↓</kbd> Move block
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> Toggle todo
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">M</kbd> Move/refile
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
