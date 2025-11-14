"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Type,
  Keyboard,
  Globe,
  AlignLeft,
  Grid,
} from "lucide-react";
import Link from "next/link";

type Theme = "light" | "dark" | "system";
type Density = "compact" | "comfortable" | "spacious";
type KeyboardLayout = "standard" | "emacs";
type Locale = "en-US" | "en-GB" | "ja-JP" | "fr-FR" | "de-DE";
type TimeFormat = "12h" | "24h";
type WeekStart = "sunday" | "monday";

export default function SettingsPrototypePage() {
  // Theme settings
  const [theme, setTheme] = useState<Theme>("dark");

  // Appearance settings
  const [density, setDensity] = useState<Density>("comfortable");

  // Keyboard settings
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>("standard");

  // i18n settings
  const [locale, setLocale] = useState<Locale>("en-US");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");
  const [weekStart, setWeekStart] = useState<WeekStart>("sunday");

  // Outline settings
  const [monospaceOutline, setMonospaceOutline] = useState(false);
  const [showLineGuides, setShowLineGuides] = useState(true);

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
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Settings Prototype</h1>
          <p className="text-neutral-400">
            App configuration including theme, density, keyboard, and internationalization
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Theme Section */}
          <section className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Theme</h2>
                <p className="text-sm text-neutral-400">Choose your preferred color scheme</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <Sun className="w-6 h-6 text-neutral-300" />
                <span className="text-sm font-medium text-neutral-200">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <Moon className="w-6 h-6 text-neutral-300" />
                <span className="text-sm font-medium text-neutral-200">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  theme === "system"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <Monitor className="w-6 h-6 text-neutral-300" />
                <span className="text-sm font-medium text-neutral-200">System</span>
              </button>
            </div>
          </section>

          {/* Density Section */}
          <section className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-neutral-800 text-purple-400">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Density</h2>
                <p className="text-sm text-neutral-400">
                  Adjust spacing and sizing throughout the app
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setDensity("compact")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  density === "compact"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <Grid className="w-5 h-5 text-neutral-300" />
                <span className="text-sm font-medium text-neutral-200">Compact</span>
                <span className="text-xs text-neutral-500">More content</span>
              </button>

              <button
                onClick={() => setDensity("comfortable")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  density === "comfortable"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <Grid className="w-6 h-6 text-neutral-300" />
                <span className="text-sm font-medium text-neutral-200">Comfortable</span>
                <span className="text-xs text-neutral-500">Balanced</span>
              </button>

              <button
                onClick={() => setDensity("spacious")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  density === "spacious"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <Grid className="w-7 h-7 text-neutral-300" />
                <span className="text-sm font-medium text-neutral-200">Spacious</span>
                <span className="text-xs text-neutral-500">More breathing room</span>
              </button>
            </div>
          </section>

          {/* Keyboard Section */}
          <section className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-neutral-800 text-green-400">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Keyboard Layout</h2>
                <p className="text-sm text-neutral-400">Choose your preferred keyboard shortcuts</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setKeyboardLayout("standard")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  keyboardLayout === "standard"
                    ? "border-green-500 bg-green-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <h3 className="text-sm font-medium text-neutral-200 mb-2">Standard</h3>
                <p className="text-xs text-neutral-500">Cmd/Ctrl based shortcuts</p>
              </button>

              <button
                onClick={() => setKeyboardLayout("emacs")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  keyboardLayout === "emacs"
                    ? "border-green-500 bg-green-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <h3 className="text-sm font-medium text-neutral-200 mb-2">Emacs-style</h3>
                <p className="text-xs text-neutral-500">C-x, C-c, M-x shortcuts</p>
              </button>
            </div>
          </section>

          {/* Internationalization Section */}
          <section className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-neutral-800 text-orange-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Internationalization</h2>
                <p className="text-sm text-neutral-400">Language and regional settings</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Locale */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Locale</label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>

              {/* Time Format */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Time Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTimeFormat("12h")}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      timeFormat === "12h"
                        ? "border-orange-500 bg-orange-500/10 text-neutral-100"
                        : "border-neutral-700 hover:border-neutral-600 text-neutral-300"
                    }`}
                  >
                    12-hour (2:30 PM)
                  </button>
                  <button
                    onClick={() => setTimeFormat("24h")}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      timeFormat === "24h"
                        ? "border-orange-500 bg-orange-500/10 text-neutral-100"
                        : "border-neutral-700 hover:border-neutral-600 text-neutral-300"
                    }`}
                  >
                    24-hour (14:30)
                  </button>
                </div>
              </div>

              {/* Week Start */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Week Starts On
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setWeekStart("sunday")}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      weekStart === "sunday"
                        ? "border-orange-500 bg-orange-500/10 text-neutral-100"
                        : "border-neutral-700 hover:border-neutral-600 text-neutral-300"
                    }`}
                  >
                    Sunday
                  </button>
                  <button
                    onClick={() => setWeekStart("monday")}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      weekStart === "monday"
                        ? "border-orange-500 bg-orange-500/10 text-neutral-100"
                        : "border-neutral-700 hover:border-neutral-600 text-neutral-300"
                    }`}
                  >
                    Monday
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Outline Section */}
          <section className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-neutral-800 text-pink-400">
                <AlignLeft className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Outline Preferences</h2>
                <p className="text-sm text-neutral-400">
                  Customize outline appearance and behavior
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Monospace Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-neutral-200 mb-1">Monospace Outline</h3>
                  <p className="text-xs text-neutral-500">
                    Use monospace font for better alignment
                  </p>
                </div>
                <button
                  onClick={() => setMonospaceOutline(!monospaceOutline)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    monospaceOutline ? "bg-pink-600" : "bg-neutral-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      monospaceOutline ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Line Guides Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-neutral-200 mb-1">Show Line Guides</h3>
                  <p className="text-xs text-neutral-500">
                    Display vertical guides for nested items
                  </p>
                </div>
                <button
                  onClick={() => setShowLineGuides(!showLineGuides)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showLineGuides ? "bg-pink-600" : "bg-neutral-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      showLineGuides ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Current Settings Summary */}
          <section className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-300 mb-3">Current Settings</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-500">Theme:</span>
                <span className="text-neutral-200 ml-2">{theme}</span>
              </div>
              <div>
                <span className="text-neutral-500">Density:</span>
                <span className="text-neutral-200 ml-2">{density}</span>
              </div>
              <div>
                <span className="text-neutral-500">Keyboard:</span>
                <span className="text-neutral-200 ml-2">{keyboardLayout}</span>
              </div>
              <div>
                <span className="text-neutral-500">Locale:</span>
                <span className="text-neutral-200 ml-2">{locale}</span>
              </div>
              <div>
                <span className="text-neutral-500">Time Format:</span>
                <span className="text-neutral-200 ml-2">{timeFormat}</span>
              </div>
              <div>
                <span className="text-neutral-500">Week Starts:</span>
                <span className="text-neutral-200 ml-2">{weekStart}</span>
              </div>
              <div>
                <span className="text-neutral-500">Monospace:</span>
                <span className="text-neutral-200 ml-2">{monospaceOutline ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="text-neutral-500">Line Guides:</span>
                <span className="text-neutral-200 ml-2">{showLineGuides ? "Yes" : "No"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
