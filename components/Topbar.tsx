"use client";

import Link from "next/link";
import { Command } from "lucide-react";

export function Topbar() {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-4">
        <Link href="/" className="font-medium">
          Cortex
        </Link>
        <nav className="text-sm text-neutral-300 flex items-center gap-3">
          <Link href="/agenda">Agenda</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/notes">Notes</Link>
          <Link href="/travel">Travel</Link>
          <Link href="/habits">Habits</Link>
        </nav>
        <div className="ml-auto">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-700 px-2 py-1 text-sm">
            <Command className="w-4 h-4" /> <span className="hidden sm:inline">Command</span>
            <span className="ml-2 text-neutral-400">⌘K</span>
          </div>
        </div>
      </div>
    </header>
  );
}
