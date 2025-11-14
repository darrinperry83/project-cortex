"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { SliceBuilder } from "@/components/slices/SliceBuilder";
import { ensurePath } from "@/lib/path";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [pathDialogOpen, setPathDialogOpen] = React.useState(false);
  const [sliceBuilderOpen, setSliceBuilderOpen] = React.useState(false);
  const [pathInput, setPathInput] = React.useState("");
  const [pathError, setPathError] = React.useState("");
  const [pathSuccess, setPathSuccess] = React.useState<{ message: string; blockId: string } | null>(
    null
  );
  const [isCreatingPath, setIsCreatingPath] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const hotkey = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (hotkey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      // ESC to close dialogs
      if (e.key === "Escape") {
        if (pathDialogOpen) {
          setPathDialogOpen(false);
          resetPathDialog();
        }
        if (sliceBuilderOpen) {
          setSliceBuilderOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathDialogOpen, sliceBuilderOpen]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const resetPathDialog = () => {
    setPathInput("");
    setPathError("");
    setPathSuccess(null);
  };

  const handleCreatePath = async () => {
    setPathError("");
    setPathSuccess(null);

    const trimmedPath = pathInput.trim();
    if (!trimmedPath) {
      setPathError("Path cannot be empty");
      return;
    }

    setIsCreatingPath(true);
    try {
      const blockId = await ensurePath(trimmedPath);
      setPathSuccess({
        message: `Heading created successfully!`,
        blockId,
      });
      // Clear input after successful creation
      setPathInput("");
    } catch (err) {
      console.error("Error creating path:", err);
      setPathError(`Failed to create path: ${(err as Error).message}`);
    } finally {
      setIsCreatingPath(false);
    }
  };

  const handleViewCreatedBlock = () => {
    if (pathSuccess?.blockId) {
      setPathDialogOpen(false);
      resetPathDialog();
      router.push(`/blocks/${pathSuccess.blockId}`);
    }
  };

  const handleSliceSave = (_sliceId: string) => {
    setSliceBuilderOpen(false);
    // Navigate to the slices page
    router.push("/slices");
  };

  const handleSliceCancel = () => {
    setSliceBuilderOpen(false);
  };

  if (!open && !pathDialogOpen && !sliceBuilderOpen) return null;

  return (
    <>
      {/* Main Command Palette */}
      {open && (
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

                {/* Navigation Group */}
                <CommandPrimitive.Group
                  heading="Navigate"
                  className="text-neutral-400 text-xs font-medium px-2 py-1.5"
                >
                  <CommandPrimitive.Item
                    onSelect={() => navigate("/slices")}
                    className="px-3 py-2 rounded cursor-pointer text-neutral-100 hover:bg-neutral-800 transition-colors"
                  >
                    Go to Slices
                  </CommandPrimitive.Item>
                  <CommandPrimitive.Item
                    onSelect={() => navigate("/editor")}
                    className="px-3 py-2 rounded cursor-pointer text-neutral-100 hover:bg-neutral-800 transition-colors"
                  >
                    Go to Editor
                  </CommandPrimitive.Item>
                  <CommandPrimitive.Item
                    onSelect={() => navigate("/agenda")}
                    className="px-3 py-2 rounded cursor-pointer text-neutral-100 hover:bg-neutral-800 transition-colors"
                  >
                    Go to Agenda
                  </CommandPrimitive.Item>
                  <CommandPrimitive.Item
                    onSelect={() => navigate("/projects")}
                    className="px-3 py-2 rounded cursor-pointer text-neutral-100 hover:bg-neutral-800 transition-colors"
                  >
                    Go to Projects
                  </CommandPrimitive.Item>
                  <CommandPrimitive.Item
                    onSelect={() => navigate("/notes")}
                    className="px-3 py-2 rounded cursor-pointer text-neutral-100 hover:bg-neutral-800 transition-colors"
                  >
                    Go to Notes
                  </CommandPrimitive.Item>
                  <CommandPrimitive.Item
                    onSelect={() => navigate("/habits")}
                    className="px-3 py-2 rounded cursor-pointer text-neutral-100 hover:bg-neutral-800 transition-colors"
                  >
                    Go to Habits
                  </CommandPrimitive.Item>
                </CommandPrimitive.Group>

                <CommandPrimitive.Separator className="h-px bg-neutral-700 my-1" />

                {/* Actions Group */}
                <CommandPrimitive.Group
                  heading="Actions"
                  className="text-neutral-400 text-xs font-medium px-2 py-1.5"
                >
                  <CommandPrimitive.Item
                    onSelect={() => {
                      setOpen(false);
                      setPathDialogOpen(true);
                    }}
                    className="px-3 py-2 rounded cursor-pointer text-neutral-100 hover:bg-neutral-800 transition-colors"
                  >
                    New heading at path…
                  </CommandPrimitive.Item>
                  <CommandPrimitive.Item
                    onSelect={() => {
                      setOpen(false);
                      setSliceBuilderOpen(true);
                    }}
                    className="px-3 py-2 rounded cursor-pointer text-neutral-100 hover:bg-neutral-800 transition-colors"
                  >
                    New Slice
                  </CommandPrimitive.Item>
                </CommandPrimitive.Group>
              </CommandPrimitive.List>
            </CommandPrimitive>
          </div>
          <button
            className="fixed inset-0 -z-10"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      {/* Path Creation Dialog */}
      <Dialog.Root
        open={pathDialogOpen}
        onOpenChange={(isOpen) => {
          setPathDialogOpen(isOpen);
          if (!isOpen) resetPathDialog();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 rounded-lg shadow-xl p-6 w-full max-w-lg z-50 ring-1 ring-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold text-neutral-100">
                New heading at path
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="p-1 rounded-lg hover:bg-neutral-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="path-input" className="block text-sm font-medium text-neutral-300">
                  Enter path
                </label>
                <input
                  id="path-input"
                  type="text"
                  value={pathInput}
                  onChange={(e) => setPathInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCreatingPath) {
                      e.preventDefault();
                      handleCreatePath();
                    }
                  }}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-100 placeholder:text-neutral-500"
                  placeholder="#Cities/Tokyo or Cities/Tokyo"
                  autoFocus
                  disabled={isCreatingPath}
                />
                <p className="text-xs text-neutral-400">
                  Creates the heading and all intermediate headings if they don&apos;t exist
                </p>
              </div>

              {/* Error Message */}
              {pathError && (
                <div className="flex items-start gap-2 p-3 bg-red-950/50 border border-red-900/50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{pathError}</p>
                </div>
              )}

              {/* Success Message */}
              {pathSuccess && (
                <div className="flex items-start gap-2 p-3 bg-green-950/50 border border-green-900/50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-300 mb-2">{pathSuccess.message}</p>
                    <button
                      onClick={handleViewCreatedBlock}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium underline"
                    >
                      View created block
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-700">
                <Dialog.Close asChild>
                  <button
                    className="px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors"
                    disabled={isCreatingPath}
                  >
                    {pathSuccess ? "Close" : "Cancel"}
                  </button>
                </Dialog.Close>
                {!pathSuccess && (
                  <button
                    onClick={handleCreatePath}
                    disabled={isCreatingPath || !pathInput.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingPath ? "Creating..." : "Create"}
                  </button>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Slice Builder Dialog */}
      {sliceBuilderOpen && (
        <SliceBuilder onSave={handleSliceSave} onCancel={handleSliceCancel} isDialog={true} />
      )}
    </>
  );
}
