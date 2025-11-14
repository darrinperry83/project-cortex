"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Clock,
  Users,
  Link2,
  Target,
  CheckSquare,
  Square,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import Link from "next/link";
import { mockMeeting, type MockAction } from "@/lib/mock-data";

export default function MeetingPrototypePage() {
  const [isPreFlightOpen, setIsPreFlightOpen] = useState(true);
  const [isMeetingActive, setIsMeetingActive] = useState(false);

  // Pre-flight data
  const [objective, setObjective] = useState(mockMeeting.objective);
  const [attendees, setAttendees] = useState(mockMeeting.attendees.join(", "));
  const [projectPath, setProjectPath] = useState(mockMeeting.projectPath || "");
  const [relatedLinks, setRelatedLinks] = useState("");

  // Meeting data
  const [notes, setNotes] = useState("");
  const [actions, setActions] = useState<MockAction[]>([]);
  const [currentAction, setCurrentAction] = useState("");

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const startMeeting = () => {
    setIsPreFlightOpen(false);
    setIsMeetingActive(true);
    setIsTimerRunning(true);
  };

  // Detect action items in notes
  const detectActionItems = (text: string) => {
    const lines = text.split("\n");
    const actionPattern = /^\s*\[\s*\]\s*(.+)$/;

    lines.forEach((line) => {
      const match = line.match(actionPattern);
      if (match && !actions.some((a) => a.text === match[1])) {
        // Auto-add action
        const newAction: MockAction = {
          id: `action-${Date.now()}-${Math.random()}`,
          text: match[1],
          completed: false,
        };
        setActions((prev) => [...prev, newAction]);
      }
    });
  };

  const handleNotesChange = (text: string) => {
    setNotes(text);
    detectActionItems(text);
  };

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((action) =>
        action.id === id ? { ...action, completed: !action.completed } : action
      )
    );
  };

  const addAction = () => {
    if (currentAction.trim()) {
      const newAction: MockAction = {
        id: `action-${Date.now()}`,
        text: currentAction.trim(),
        completed: false,
      };
      setActions([...actions, newAction]);
      setCurrentAction("");
    }
  };

  const removeAction = (id: string) => {
    setActions((prev) => prev.filter((action) => action.id !== id));
  };

  const harvestActions = () => {
    const incompleteActions = actions.filter((a) => !a.completed);
    if (incompleteActions.length === 0) {
      alert("No incomplete actions to harvest!");
      return;
    }

    const actionList = incompleteActions.map((a) => `- ${a.text}`).join("\n");
    console.log("Harvesting actions:", incompleteActions);
    alert(
      `Creating ${incompleteActions.length} tasks:\n\n${actionList}\n\nThese would be created as tasks in the system.`
    );
  };

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
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Meeting Mode Prototype</h1>
          <p className="text-neutral-400">
            Structured meeting capture with pre-flight and action harvesting
          </p>
        </div>

        {/* Pre-Flight Panel */}
        {isPreFlightOpen && !isMeetingActive && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-neutral-100">Pre-Flight</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Meeting Objective
                </label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="What is the goal of this meeting?"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Attendees (comma-separated)
                </label>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  placeholder="Alice, Bob, Carol..."
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Related Project Path (optional)
                </label>
                <input
                  type="text"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  placeholder="#/Projects/Launch"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Related Links (one per line)
                </label>
                <textarea
                  value={relatedLinks}
                  onChange={(e) => setRelatedLinks(e.target.value)}
                  placeholder="https://docs.example.com/spec"
                  rows={3}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={startMeeting}
                disabled={!objective.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Play className="w-5 h-5" />
                Start Meeting
              </button>
            </div>
          </div>
        )}

        {/* Meeting Interface */}
        {isMeetingActive && (
          <>
            {/* Meeting Header */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-2xl font-mono font-semibold text-neutral-100">
                      {formatTime(elapsedSeconds)}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    {isTimerRunning ? (
                      <Pause className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <Play className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Users className="w-4 h-4" />
                    <span>{attendees.split(",").length} attendees</span>
                  </div>
                  {projectPath && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Link2 className="w-4 h-4" />
                      <span>{projectPath}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Objective */}
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <span className="text-xs text-neutral-500">Objective</span>
                    <p className="text-sm text-neutral-200">{objective}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notes Panel */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-800 bg-neutral-800/50">
                  <h3 className="text-sm font-semibold text-neutral-100">Meeting Notes</h3>
                  <p className="text-xs text-neutral-500 mt-1">Type [ ] to create an action item</p>
                </div>
                <textarea
                  ref={notesRef}
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Take notes here... Type '[ ]' to create action items."
                  className="w-full h-[500px] p-4 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Actions Panel */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-800 bg-neutral-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-100">Action Items</h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        {actions.length} action{actions.length !== 1 ? "s" : ""} captured
                      </p>
                    </div>
                    <button
                      onClick={harvestActions}
                      disabled={actions.filter((a) => !a.completed).length === 0}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Harvest Actions
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {/* Add Action Input */}
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={currentAction}
                      onChange={(e) => setCurrentAction(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAction();
                        }
                      }}
                      placeholder="Add new action..."
                      className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addAction}
                      disabled={!currentAction.trim()}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>

                  {/* Actions List */}
                  <div className="space-y-2 max-h-[420px] overflow-auto">
                    {actions.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                        <p className="text-sm text-neutral-500">
                          No actions yet. Type [ ] in notes or add manually.
                        </p>
                      </div>
                    ) : (
                      actions.map((action) => (
                        <div
                          key={action.id}
                          className="flex items-start gap-3 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors group"
                        >
                          <button
                            onClick={() => toggleAction(action.id)}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {action.completed ? (
                              <CheckSquare className="w-5 h-5 text-green-400" />
                            ) : (
                              <Square className="w-5 h-5 text-neutral-400 hover:text-neutral-300" />
                            )}
                          </button>
                          <span
                            className={`flex-1 text-sm ${
                              action.completed
                                ? "text-neutral-500 line-through"
                                : "text-neutral-200"
                            }`}
                          >
                            {action.text}
                          </span>
                          <button
                            onClick={() => removeAction(action.id)}
                            className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* End Meeting Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  if (confirm("End meeting and save notes?")) {
                    console.log("Meeting ended:", {
                      objective,
                      notes,
                      actions,
                      duration: elapsedSeconds,
                    });
                    alert("Meeting notes saved! Actions would be created as tasks.");
                    setIsMeetingActive(false);
                    setIsTimerRunning(false);
                  }
                }}
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
              >
                End Meeting
              </button>
            </div>
          </>
        )}

        {/* Features Info */}
        {!isMeetingActive && !isPreFlightOpen && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-neutral-100 mb-3">Meeting Mode Features</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>Pre-flight setup with objective, attendees, and context</li>
              <li>Real-time timer tracking</li>
              <li>Two-pane layout for notes and actions</li>
              <li>Auto-detection of action items with [ ] syntax</li>
              <li>Manual action item management</li>
              <li>Action harvesting to create tasks</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
