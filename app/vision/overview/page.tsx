"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  Settings,
  Inbox,
  FolderTree,
  Video,
  List,
  Table,
  Boxes,
} from "lucide-react";
import { ReactElement } from "react";

interface PrototypeCard {
  title: string;
  description: string;
  href: string;
  icon: ReactElement;
  features: string[];
}

const prototypes: PrototypeCard[] = [
  {
    title: "Capture Overlay",
    description: "Quick capture interface with NLP-style parsing and micro-form mode",
    href: "/vision/capture",
    icon: <Inbox className="w-6 h-6" />,
    features: [
      "NLP-style input parsing",
      "Tag, path, and date extraction",
      "Visual parsing feedback",
      "Micro-form alternative mode",
      "Path autocomplete",
    ],
  },
  {
    title: "Refile Modal",
    description: "Fuzzy search and path-based refiling with keyboard shortcuts",
    href: "/vision/refile",
    icon: <FolderTree className="w-6 h-6" />,
    features: [
      "Fuzzy search for paths",
      "Path creation preview",
      "Drop vs. Anchor modes",
      "Recent destinations",
      "Keyboard navigation",
    ],
  },
  {
    title: "Settings",
    description: "App configuration including theme, density, keyboard, and i18n",
    href: "/vision/settings",
    icon: <Settings className="w-6 h-6" />,
    features: [
      "Theme switcher (dark/light/system)",
      "Density controls",
      "Keyboard layout options",
      "Internationalization",
      "Outline preferences",
    ],
  },
  {
    title: "Agenda View",
    description: "Smart task views with scoring, filtering, and status tracking",
    href: "/vision/agenda",
    icon: <Calendar className="w-6 h-6" />,
    features: [
      "Today, Next 7, Waiting, Blocked views",
      "Score pills with breakdowns",
      "Status and tag chips",
      "Color-coded due dates",
      "Advanced filtering",
    ],
  },
  {
    title: "Meeting Mode",
    description: "Structured meeting capture with pre-flight and action harvesting",
    href: "/vision/meeting",
    icon: <Video className="w-6 h-6" />,
    features: [
      "Pre-flight setup panel",
      "Two-pane notes + actions",
      "Live action parsing",
      "Action validation",
      "Timer and duration tracking",
    ],
  },
  {
    title: "Outline Editor",
    description: "Hierarchical tree view with folding, zooming, and inline properties",
    href: "/vision/outline",
    icon: <List className="w-6 h-6" />,
    features: [
      "Org-mode style indentation",
      "Fold/unfold with chevrons",
      "Zoom into subtrees",
      "Status toggle (todo/next/wip/waiting/done)",
      "Inline property chips",
      "Drag handles for reordering",
    ],
  },
  {
    title: "Slice Builder",
    description: "Query and view outline data with powerful filtering and table views",
    href: "/vision/slices",
    icon: <Table className="w-6 h-6" />,
    features: [
      "DSL query builder",
      "Path and property filters",
      "Column selector",
      "Sort and group controls",
      "Live preview table",
      "Example queries",
    ],
  },
  {
    title: "Collection Builder",
    description: "Create structured types with custom fields and properties",
    href: "/vision/collections",
    icon: <Boxes className="w-6 h-6" />,
    features: [
      "Three-step wizard UI",
      "Custom field types",
      "Required field controls",
      "Reference fields",
      "Table and card views",
      "Low-code builder feel",
    ],
  },
];

export default function VisionOverviewPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-100 mb-4">Vision Prototypes</h1>
          <p className="text-lg text-neutral-400 max-w-2xl">
            Interactive prototypes demonstrating the end-state UI vision for Project Cortex. These
            are frontend-only demos with mocked data to showcase interaction patterns and visual
            design.
          </p>
        </div>

        {/* Prototype Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prototypes.map((prototype) => (
            <Link
              key={prototype.href}
              href={prototype.href}
              className="group block bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-all hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="p-6">
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-neutral-800 text-blue-400 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-colors">
                    {prototype.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-100 group-hover:text-blue-400 transition-colors">
                    {prototype.title}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
                  {prototype.description}
                </p>

                {/* Features */}
                <div className="space-y-1.5">
                  {prototype.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-neutral-600 mt-2 flex-shrink-0" />
                      <span className="text-xs text-neutral-500">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/50">
                <span className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                  View Prototype
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-12 p-6 bg-neutral-900 rounded-lg border border-neutral-800">
          <div className="flex items-start gap-4">
            <FileText className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 mb-2">
                About These Prototypes
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                These prototypes are built with mocked data and do not persist changes. They
                demonstrate interaction patterns, visual design, and user flows that will be
                implemented in the production application.
              </p>
              <p className="text-xs text-neutral-500">
                All prototypes use base UI components and CSS variables from the design system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
