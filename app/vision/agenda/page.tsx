"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Filter,
  ChevronDown,
  Hash,
  Folder,
} from "lucide-react";
import Link from "next/link";
import {
  mockTasks,
  getTasksDueToday,
  getTasksDueNext7Days,
  getWaitingTasks,
  getBlockedTasks,
  type MockTask,
} from "@/lib/mock-data";

type TabType = "today" | "next7" | "waiting" | "blocked";
type SortBy = "score" | "due" | "title";

export default function AgendaPrototypePage() {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("score");

  // Get tasks for active tab
  const getTasksForTab = (): MockTask[] => {
    let tasks: MockTask[] = [];
    switch (activeTab) {
      case "today":
        tasks = getTasksDueToday();
        break;
      case "next7":
        tasks = getTasksDueNext7Days();
        break;
      case "waiting":
        tasks = getWaitingTasks();
        break;
      case "blocked":
        tasks = getBlockedTasks();
        break;
    }

    // Apply filters
    if (selectedTags.length > 0) {
      tasks = tasks.filter((task) => task.tags.some((tag) => selectedTags.includes(tag)));
    }

    if (selectedPriority.length > 0) {
      tasks = tasks.filter((task) => task.priority && selectedPriority.includes(task.priority));
    }

    // Apply sorting
    tasks.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.score - a.score;
        case "due":
          if (!a.due) return 1;
          if (!b.due) return -1;
          return new Date(a.due).getTime() - new Date(b.due).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return tasks;
  };

  const tasks = getTasksForTab();

  // Get all unique tags from tasks
  const allTags = Array.from(new Set(mockTasks.flatMap((t) => t.tags)));

  // Get due date color
  const getDueDateColor = (dueDate?: string): string => {
    if (!dueDate) return "text-neutral-500";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-400";
    if (diffDays === 0) return "text-orange-400";
    if (diffDays <= 3) return "text-yellow-400";
    return "text-green-400";
  };

  const formatDueDate = (dueDate?: string): string => {
    if (!dueDate) return "No due date";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return due.toLocaleDateString();
  };

  const getStatusIcon = (status: MockTask["status"]) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "blocked":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "waiting":
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status: MockTask["status"]) => {
    switch (status) {
      case "ready":
        return "Ready";
      case "blocked":
        return "Blocked";
      case "waiting":
        return "Waiting";
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (score >= 60) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    if (score >= 40) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-green-500/20 text-green-300 border-green-500/30";
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const togglePriority = (priority: string) => {
    setSelectedPriority((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
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
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Agenda View Prototype</h1>
          <p className="text-neutral-400">
            Smart task views with scoring, filtering, and status tracking
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setActiveTab("today")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "today"
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab("next7")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "next7"
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Next 7 Days
              </button>
              <button
                onClick={() => setActiveTab("waiting")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "waiting"
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Waiting
              </button>
              <button
                onClick={() => setActiveTab("blocked")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "blocked"
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Blocked
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 mb-2">Sort By</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSortBy("score")}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      sortBy === "score"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    Score
                  </button>
                  <button
                    onClick={() => setSortBy("due")}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      sortBy === "due"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    Due Date
                  </button>
                  <button
                    onClick={() => setSortBy("title")}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      sortBy === "title"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    Title
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-300 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-300 mb-2">Priority</h3>
                <div className="flex items-center gap-2">
                  {["high", "medium", "low"].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => togglePriority(priority)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        selectedPriority.includes(priority)
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task Count */}
        <div className="mb-4 text-sm text-neutral-400">
          Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
              <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-400 mb-2">No tasks found</h3>
              <p className="text-sm text-neutral-500">
                Try adjusting your filters or switching tabs
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Path */}
                    <h3 className="text-neutral-100 font-medium mb-2">{task.title}</h3>
                    {task.path && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500 mb-3">
                        <Folder className="w-3 h-3" />
                        {task.path}
                      </div>
                    )}

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Chip */}
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">
                        {getStatusIcon(task.status)}
                        {getStatusLabel(task.status)}
                      </span>

                      {/* Due Date */}
                      {task.due && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 rounded text-xs ${getDueDateColor(task.due)}`}
                        >
                          <Calendar className="w-3 h-3" />
                          {formatDueDate(task.due)}
                        </span>
                      )}

                      {/* Tags */}
                      {task.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                        >
                          <Hash className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}

                      {/* Priority */}
                      {task.priority && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === "high"
                              ? "bg-red-500/20 text-red-300"
                              : task.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}

                      {/* Blocked By */}
                      {task.blockedBy && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                          {task.blockedBy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-sm font-semibold ${getScoreColor(task.score)}`}
                  >
                    {task.score}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-100 mb-2">About Scoring</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Task scores are calculated based on multiple factors including due date proximity,
            priority level, blocked status, and other contextual signals. Higher scores indicate
            tasks that need more immediate attention.
          </p>
        </div>
      </div>
    </div>
  );
}
