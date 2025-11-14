"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const hotkey = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (hotkey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="mx-auto mt-24 max-w-xl rounded-md bg-neutral-900 p-2 shadow-lg ring-1 ring-neutral-700">
        <CommandPrimitive>
          <CommandPrimitive.Input
            placeholder="Type a command or search…"
            autoFocus
            className="w-full bg-neutral-900 p-3 outline-none text-neutral-100 placeholder:text-neutral-400"
          />
          <CommandPrimitive.List className="max-h-80 overflow-auto p-1">
            <CommandPrimitive.Empty className="p-3 text-neutral-400">
              No results.
            </CommandPrimitive.Empty>
            <CommandPrimitive.Group heading="Navigate" className="text-neutral-400">
              <CommandPrimitive.Item onSelect={() => navigate("/agenda")}>
                Go to Agenda
              </CommandPrimitive.Item>
              <CommandPrimitive.Item onSelect={() => navigate("/projects")}>
                Go to Projects
              </CommandPrimitive.Item>
              <CommandPrimitive.Item onSelect={() => navigate("/notes")}>
                Go to Notes
              </CommandPrimitive.Item>
              <CommandPrimitive.Item onSelect={() => navigate("/travel")}>
                Go to Travel
              </CommandPrimitive.Item>
              <CommandPrimitive.Item onSelect={() => navigate("/habits")}>
                Go to Habits
              </CommandPrimitive.Item>
            </CommandPrimitive.Group>
            <CommandPrimitive.Separator />
            <CommandPrimitive.Group heading="Actions" className="text-neutral-400">
              <CommandPrimitive.Item onSelect={() => alert("Quick capture coming soon")}>
                Quick capture (coming soon)
              </CommandPrimitive.Item>
            </CommandPrimitive.Group>
          </CommandPrimitive.List>
        </CommandPrimitive>
      </div>
      <button className="fixed inset-0" aria-label="Close" onClick={() => setOpen(false)} />
    </div>
  );
}
