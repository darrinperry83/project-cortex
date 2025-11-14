# Keyboard Reference

**Project Cortex - Push 1.02**
**Last Updated:** November 14, 2025

Complete keyboard shortcut reference for Project Cortex. Every core action is accessible via keyboard.

## Table of Contents

1. [Platform Conventions](#platform-conventions)
2. [Global Shortcuts](#global-shortcuts)
3. [Capture Overlay](#capture-overlay)
4. [Refile Modal](#refile-modal)
5. [Outline Editor](#outline-editor)
6. [Agenda View](#agenda-view)
7. [Meeting Mode](#meeting-mode)
8. [Tables & Slices](#tables--slices)
9. [Dialogs & Modals](#dialogs--modals)
10. [Navigation](#navigation)
11. [Emacs-Style Alternatives](#emacs-style-alternatives)

---

## Platform Conventions

### Modifier Keys

Throughout this document:

- `⌘` = Command key (macOS)
- `Ctrl` = Control key (Windows/Linux)
- `Alt` = Option (⌥) on macOS, Alt on Windows/Linux
- `Shift` = Shift key (all platforms)

### Notation

- `⌘K` = Press Command and K together
- `g t` = Press g, release, then press t (sequence)
- `⌘/Ctrl` = Use Command on Mac, Control on Windows/Linux

---

## Global Shortcuts

These shortcuts work from anywhere in the application.

| Shortcut         | Action                  | Description                                       |
| ---------------- | ----------------------- | ------------------------------------------------- |
| `⌘/Ctrl K`       | Open command palette    | Fuzzy search for commands and navigation          |
| `⌘/Ctrl Shift C` | Quick capture           | Open capture overlay                              |
| `⌘/Ctrl Enter`   | Submit/Confirm          | Save current form or action                       |
| `/`              | Focus search            | Focus the search input (when not in a text field) |
| `Esc`            | Cancel/Close            | Close modal, cancel action, clear selection       |
| `?`              | Show keyboard shortcuts | Display this help reference                       |

### Go To (Navigation Sequences)

| Shortcut | Destination    | Description                      |
| -------- | -------------- | -------------------------------- |
| `g t`    | Go to Today    | Navigate to today's agenda       |
| `g p`    | Go to Projects | Navigate to projects view        |
| `g s`    | Go to Slices   | Navigate to saved queries/slices |
| `g n`    | Go to Notes    | Navigate to notes browser        |
| `g i`    | Go to Inbox    | Navigate to inbox/refile queue   |

### Quick Actions

| Shortcut   | Action     | Description                              |
| ---------- | ---------- | ---------------------------------------- |
| `c`        | Create new | Context-aware: task, note, or heading    |
| `e`        | Edit       | Edit selected item                       |
| `d`        | Delete     | Delete selected item (with confirmation) |
| `⌘/Ctrl F` | Find       | Open search in current view              |
| `⌘/Ctrl S` | Save       | Save current document or changes         |

---

## Capture Overlay

Available when capture overlay is open (`⌘/Ctrl Shift C`).

| Shortcut         | Action         | Description                             |
| ---------------- | -------------- | --------------------------------------- |
| `⌘/Ctrl Shift C` | Open capture   | Open the capture overlay                |
| `⌘/Ctrl Enter`   | Save and close | Save captured item and close overlay    |
| `Esc`            | Cancel         | Close overlay without saving            |
| `⌘/Ctrl T`       | Toggle mode    | Switch between NLP and Form modes       |
| `Tab`            | Next field     | Move to next form field (Form mode)     |
| `Shift Tab`      | Previous field | Move to previous form field (Form mode) |

### Capture Syntax (NLP Mode)

While typing in NLP mode, use these markers:

- `#tag` - Add a tag (e.g., `#urgent`, `#work`)
- `@path` - Set destination path (e.g., `@Projects/Launch`)
- `due [date]` - Set due date (e.g., `due tomorrow`, `due 2025-11-20`)

**Example:** `"Review PR #dev #urgent due friday @Projects/Launch"`

---

## Refile Modal

Available when refile modal is open (`⌘/Ctrl Shift R`).

| Shortcut         | Action              | Description                                     |
| ---------------- | ------------------- | ----------------------------------------------- |
| `⌘/Ctrl Shift R` | Open refile modal   | Open refile interface for selected item         |
| `Alt`            | Toggle mode         | Switch between "Drop here" and "Anchor to path" |
| `Alt Enter`      | Confirm with Anchor | Refile using Anchor mode                        |
| `↑` / `↓`        | Navigate results    | Move selection up/down in search results        |
| `Enter`          | Confirm refile      | Refile to selected destination                  |
| `Esc`            | Cancel              | Close modal without refiling                    |
| `⌘/Ctrl N`       | Next result         | Alternative navigation (Emacs-style)            |
| `⌘/Ctrl P`       | Previous result     | Alternative navigation (Emacs-style)            |

### Refile Path Syntax

- `#A/B/C` - Create path A > B > C
- `#/A/B/C` - Same as above (leading # optional)
- `A/B/C` - Create path without # prefix

---

## Outline Editor

Available in outline/document editing views.

### Navigation

| Shortcut      | Action             | Description                        |
| ------------- | ------------------ | ---------------------------------- |
| `↑` / `↓`     | Move up/down       | Navigate between headings/blocks   |
| `←` / `→`     | Collapse/Expand    | Collapse or expand current heading |
| `Home`        | Start of line      | Move cursor to start of line       |
| `End`         | End of line        | Move cursor to end of line         |
| `⌘/Ctrl Home` | Top of document    | Jump to first heading              |
| `⌘/Ctrl End`  | Bottom of document | Jump to last heading               |

### Editing

| Shortcut       | Action               | Description                          |
| -------------- | -------------------- | ------------------------------------ |
| `Enter`        | Create sibling       | Create new heading at same level     |
| `Shift Enter`  | Create child         | Create new heading one level deeper  |
| `⌘/Ctrl Enter` | Create sibling below | Create sibling after current subtree |
| `Tab`          | Indent               | Increase heading level (make child)  |
| `Shift Tab`    | Outdent              | Decrease heading level (promote)     |
| `Alt ↑`        | Move up              | Move current block/heading up        |
| `Alt ↓`        | Move down            | Move current block/heading down      |
| `⌘/Ctrl D`     | Duplicate            | Duplicate current heading/block      |

### Heading Operations

| Shortcut    | Action          | Description                            |
| ----------- | --------------- | -------------------------------------- |
| `Z`         | Zoom in         | Focus on current heading (hide others) |
| `Shift Z`   | Zoom out        | Show full outline again                |
| `:` or `::` | Edit properties | Open properties drawer for heading     |
| `M`         | Refile          | Open refile modal for current heading  |
| `T`         | Set tags        | Focus tag input for current heading    |
| `D`         | Set deadline    | Open date picker for deadline          |
| `S`         | Set scheduled   | Open date picker for scheduled date    |

### Todo States

| Shortcut         | Action         | Description                                       |
| ---------------- | -------------- | ------------------------------------------------- |
| `Space`          | Toggle todo    | Cycle through TODO states: TODO → DONE → (none)   |
| `Shift Space`    | Reverse toggle | Cycle backward through states                     |
| `⌘/Ctrl Shift T` | Set todo type  | Choose from: TODO, NEXT, WAITING, DONE, CANCELLED |

### Text Formatting

| Shortcut       | Action      | Description                    |
| -------------- | ----------- | ------------------------------ |
| `⌘/Ctrl B`     | Bold        | Make selected text bold        |
| `⌘/Ctrl I`     | Italic      | Make selected text italic      |
| `⌘/Ctrl K`     | Insert link | Insert or edit link at cursor  |
| `` ⌘/Ctrl ` `` | Code        | Make selected text inline code |

---

## Agenda View

Available in agenda/task list views.

### View Switching

| Shortcut | Action         | Description                  |
| -------- | -------------- | ---------------------------- |
| `1`      | Today view     | Show tasks due today         |
| `2`      | Next 7 days    | Show tasks due in next week  |
| `3`      | Waiting view   | Show tasks waiting on others |
| `4`      | Blocked view   | Show blocked tasks           |
| `F`      | Toggle filters | Show/hide filter panel       |

### Navigation & Selection

| Shortcut   | Action          | Description              |
| ---------- | --------------- | ------------------------ |
| `↑` / `↓`  | Navigate tasks  | Move selection up/down   |
| `Enter`    | Open task       | Open task detail view    |
| `Space`    | Toggle complete | Mark task as done/undone |
| `⌘/Ctrl A` | Select all      | Select all visible tasks |
| `Esc`      | Clear selection | Deselect all tasks       |

### Task Actions

| Shortcut | Action       | Description                                  |
| -------- | ------------ | -------------------------------------------- |
| `E`      | Edit task    | Open task editor                             |
| `D`      | Set deadline | Change task due date                         |
| `P`      | Set priority | Cycle priority: high → medium → low → (none) |
| `T`      | Add tag      | Open tag picker                              |
| `M`      | Refile task  | Open refile modal                            |
| `Delete` | Archive task | Archive completed task                       |

### Sorting & Filtering

| Shortcut         | Action             | Description                  |
| ---------------- | ------------------ | ---------------------------- |
| `S S`            | Sort by score      | Sort tasks by priority score |
| `S D`            | Sort by date       | Sort tasks by due date       |
| `S T`            | Sort by title      | Sort tasks alphabetically    |
| `F T`            | Filter by tag      | Open tag filter              |
| `F P`            | Filter by priority | Open priority filter         |
| `⌘/Ctrl Shift F` | Clear filters      | Remove all active filters    |

---

## Meeting Mode

Available in meeting interface.

### Meeting Control

| Shortcut       | Action          | Description                          |
| -------------- | --------------- | ------------------------------------ |
| `⌘/Ctrl M`     | Start meeting   | Open meeting mode with pre-flight    |
| `⌘/Ctrl Enter` | Harvest actions | Extract action items and end meeting |
| `Space`        | Pause/Resume    | Pause or resume meeting timer        |
| `Esc`          | End meeting     | End meeting (with confirmation)      |

### Note Taking

| Shortcut   | Action        | Description                      |
| ---------- | ------------- | -------------------------------- |
| `⌘/Ctrl N` | Focus notes   | Jump to notes pane               |
| `⌘/Ctrl A` | Focus actions | Jump to actions pane             |
| `Tab`      | Next pane     | Switch between notes and actions |

### Action Items

Type `[ ]` in notes to automatically create an action item.

| Shortcut   | Action          | Description                                   |
| ---------- | --------------- | --------------------------------------------- |
| `⌘/Ctrl J` | New action      | Focus action input field                      |
| `Enter`    | Add action      | Create new action item (when in action input) |
| `Space`    | Toggle complete | Mark action done/undone                       |
| `Delete`   | Remove action   | Delete selected action                        |

---

## Tables & Slices

Available in table/list views.

### Navigation

| Shortcut    | Action           | Description                         |
| ----------- | ---------------- | ----------------------------------- |
| `↑` / `↓`   | Navigate rows    | Move selection up/down              |
| `←` / `→`   | Navigate columns | Move between columns (in edit mode) |
| `Home`      | First row        | Jump to first row                   |
| `End`       | Last row         | Jump to last row                    |
| `Page Up`   | Page up          | Scroll up one page                  |
| `Page Down` | Page down        | Scroll down one page                |

### Editing

| Shortcut    | Action        | Description                          |
| ----------- | ------------- | ------------------------------------ |
| `E`         | Edit cell     | Enter edit mode for selected cell    |
| `Enter`     | Edit/Confirm  | Enter edit mode, or confirm edit     |
| `Esc`       | Cancel edit   | Exit edit mode without saving        |
| `Tab`       | Next cell     | Move to next cell (in edit mode)     |
| `Shift Tab` | Previous cell | Move to previous cell (in edit mode) |

### Table Operations

| Shortcut   | Action        | Description                             |
| ---------- | ------------- | --------------------------------------- |
| `⌘/Ctrl F` | Filter table  | Open filter builder                     |
| `⌘/Ctrl S` | Save view     | Save current filters/sort as named view |
| `⌘/Ctrl E` | Export        | Export table to CSV/JSON                |
| `⌘/Ctrl N` | New row       | Add new row to table                    |
| `⌘/Ctrl D` | Duplicate row | Duplicate selected row                  |
| `Delete`   | Delete row    | Delete selected row (with confirmation) |

### Column Management

| Shortcut   | Action           | Description                        |
| ---------- | ---------------- | ---------------------------------- |
| `H`        | Hide column      | Hide selected column               |
| `⌘/Ctrl H` | Show all columns | Unhide all hidden columns          |
| `W`        | Resize column    | Enter column width adjustment mode |
| `R`        | Reorder columns  | Enter column reorder mode          |

---

## Dialogs & Modals

Universal shortcuts for all dialogs and modal windows.

| Shortcut       | Action         | Description                  |
| -------------- | -------------- | ---------------------------- |
| `Esc`          | Close          | Close dialog without saving  |
| `⌘/Ctrl Enter` | Submit         | Confirm and close dialog     |
| `Tab`          | Next field     | Move to next input field     |
| `Shift Tab`    | Previous field | Move to previous input field |
| `⌘/Ctrl W`     | Close          | Alternative close shortcut   |

### Date Picker

| Shortcut    | Action         | Description                      |
| ----------- | -------------- | -------------------------------- |
| `↑` / `↓`   | Navigate days  | Move selection up/down by week   |
| `←` / `→`   | Navigate days  | Move selection left/right by day |
| `Page Up`   | Previous month | Go to previous month             |
| `Page Down` | Next month     | Go to next month                 |
| `T`         | Today          | Select today's date              |
| `Enter`     | Confirm        | Select highlighted date          |

---

## Navigation

### Command Palette

The command palette (`⌘/Ctrl K`) is the universal navigation tool.

| Shortcut   | Action       | Description                        |
| ---------- | ------------ | ---------------------------------- |
| `⌘/Ctrl K` | Open palette | Open command palette               |
| `↑` / `↓`  | Navigate     | Move through results               |
| `Enter`    | Execute      | Run selected command               |
| `Esc`      | Close        | Close palette                      |
| `⌘/Ctrl P` | Open palette | Alternative shortcut (Emacs-style) |

### Browser Navigation

Standard browser shortcuts also work:

| Shortcut         | Action      | Description                 |
| ---------------- | ----------- | --------------------------- |
| `⌘/Ctrl [`       | Back        | Navigate back in history    |
| `⌘/Ctrl ]`       | Forward     | Navigate forward in history |
| `⌘/Ctrl R`       | Reload      | Reload current page         |
| `⌘/Ctrl Shift R` | Hard reload | Reload ignoring cache       |

---

## Emacs-Style Alternatives

For Emacs users, these alternatives are available when Emacs keyboard layout is enabled in Settings.

### Basic Editing

| Emacs | Standard      | Action             |
| ----- | ------------- | ------------------ |
| `C-f` | `→`           | Forward character  |
| `C-b` | `←`           | Backward character |
| `C-n` | `↓`           | Next line          |
| `C-p` | `↑`           | Previous line      |
| `C-a` | `Home`        | Start of line      |
| `C-e` | `End`         | End of line        |
| `M-<` | `⌘/Ctrl Home` | Start of document  |
| `M->` | `⌘/Ctrl End`  | End of document    |

### Editing Commands

| Emacs | Standard            | Action              |
| ----- | ------------------- | ------------------- |
| `C-k` | `Shift End, Delete` | Kill to end of line |
| `C-w` | `⌘/Ctrl X`          | Cut                 |
| `M-w` | `⌘/Ctrl C`          | Copy                |
| `C-y` | `⌘/Ctrl V`          | Paste (yank)        |
| `C-d` | `Delete`            | Delete forward      |
| `C-h` | `Backspace`         | Delete backward     |
| `C-/` | `⌘/Ctrl Z`          | Undo                |

### Search & Navigation

| Emacs     | Standard         | Action                            |
| --------- | ---------------- | --------------------------------- |
| `C-s`     | `⌘/Ctrl F`       | Search forward                    |
| `C-r`     | `⌘/Ctrl Shift F` | Search backward                   |
| `M-x`     | `⌘/Ctrl K`       | Execute command (command palette) |
| `C-x C-f` | `⌘/Ctrl O`       | Find/Open file                    |
| `C-x C-s` | `⌘/Ctrl S`       | Save file                         |
| `C-x b`   | `⌘/Ctrl Tab`     | Switch buffer/view                |

### Outline Operations

| Emacs           | Standard      | Action            |
| --------------- | ------------- | ----------------- |
| `C-c C-t`       | `Space`       | Toggle TODO state |
| `C-c C-d`       | `D`           | Set deadline      |
| `C-c C-s`       | `S`           | Set scheduled     |
| `C-c C-w`       | `M`           | Refile heading    |
| `M-Enter`       | `Enter`       | Create sibling    |
| `M-Shift-Enter` | `Shift Enter` | Create child      |

---

## Accessibility

### Screen Reader Support

All interactive elements include proper ARIA labels and roles. Keyboard navigation follows standard patterns for screen reader compatibility.

### Focus Indicators

Keyboard focus is always visible with a blue ring (`ring-2 ring-brand-500`).

### Reduced Motion

When "Reduce motion" is enabled in system preferences, all animations are disabled automatically.

---

## Tips for Power Users

### Keyboard-Only Workflow

1. **Start with command palette** (`⌘/Ctrl K`) - Navigate anywhere without mouse
2. **Learn "go to" sequences** (`g t`, `g p`, etc.) - Faster than palette for common destinations
3. **Use context shortcuts** (`M` for refile, `T` for tags) - No need to reach for menus
4. **Embrace vim-style hints** - Single letter shortcuts when not editing text

### Customization

Visit Settings (`⌘/Ctrl ,`) to:

- Switch to Emacs keyboard layout
- Review and print keyboard reference card
- Customize shortcuts (future feature)

### Learning Path

1. **Week 1**: Global shortcuts and command palette
2. **Week 2**: Context-specific shortcuts (outline, agenda)
3. **Week 3**: Advanced sequences and Emacs alternatives

---

## Quick Reference Card

**Most Used Shortcuts:**

```
⌘K          Command Palette
⌘⇧C         Capture
⌘⇧R         Refile
⌘Enter      Submit/Confirm
Esc         Cancel/Close

g t         Go to Today
g p         Go to Projects

Space       Toggle TODO
M           Refile
Tab         Indent
E           Edit
```

Print this reference and keep it nearby during your first week!
