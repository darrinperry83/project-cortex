"use client";

import { useEffect } from "react";

export function KeyboardShortcuts() {
  useEffect(() => {
    const preventFindOnSlash = (e: KeyboardEvent) => {
      // Example place to wire additional shortcuts later
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "/") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", preventFindOnSlash);
    return () => window.removeEventListener("keydown", preventFindOnSlash);
  }, []);
  return null;
}
