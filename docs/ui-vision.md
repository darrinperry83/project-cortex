# UI Vision Document

**Project Cortex - Push 1.02**
**Last Updated:** November 14, 2025

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Screen-by-Screen Walkthrough](#screen-by-screen-walkthrough)
   - [Capture](#capture)
   - [Refile](#refile)
   - [Agenda](#agenda)
   - [Meeting Mode](#meeting-mode)
   - [Settings](#settings)
4. [Theme System](#theme-system)
5. [Navigation Patterns](#navigation-patterns)
6. [Interaction Patterns](#interaction-patterns)
7. [Mobile Considerations](#mobile-considerations)

---

## Overview

Project Cortex is a modern, intuitive, offline-capable system for projects, tasks, and knowledge management. The UI vision combines the best aspects of:

- **Org-mode**: Plain-text outlining with powerful metadata and querying
- **Zettelkasten**: Bidirectional linking and emergent knowledge structures
- **PWA**: Progressive Web App for offline-first, installable experiences

### End-State Vision

The final application will provide:

1. **Quick Capture**: Frictionless task and note entry with NLP parsing
2. **Flexible Organization**: Hierarchical outlining with bidirectional links
3. **Smart Views**: Query-based "slices" for dynamic task and note aggregation
4. **Keyboard-First UX**: Every action accessible via keyboard shortcuts
5. **Offline-First**: Full functionality without internet connectivity
6. **Cross-Platform**: Desktop, mobile, and tablet with responsive layouts

All prototypes are accessible at `/vision/*` routes and demonstrate interaction patterns with mocked data.

---

## Design Principles

### 1. **Keyboard-First, Mouse-Optional**

Every core action is accessible via keyboard shortcuts. The mouse is supported but never required for power users.

- Global command palette (⌘K) provides fuzzy search access to all commands
- Context-specific shortcuts (Tab for indent, M for refile, etc.)
- Vim-style navigation hints (g+t for "go to today")

### 2. **Progressive Disclosure**

Information and complexity are revealed as needed:

- Simple capture overlay expands to show parsed metadata
- Filters collapse by default, expand on demand
- Properties panels hidden until user needs to edit them

### 3. **Consistent Visual Language**

- **Pills/Badges**: Color-coded for tags (blue), dates (orange/red/green), paths (purple)
- **Score indicators**: Contextual coloring (red for high urgency, green for low)
- **Status chips**: Icons paired with text for accessibility

### 4. **Fast Feedback**

All interactions provide immediate visual feedback:

- Real-time NLP parsing shows tags/dates as you type
- Fuzzy search updates instantly
- Button states change on hover/active/disabled

### 5. **Accessible by Default**

- Proper ARIA labels and roles
- Focus management in modals and dialogs
- Semantic HTML with keyboard navigation
- Reduced motion support for accessibility preferences

---

## Screen-by-Screen Walkthrough

### Capture

**Route:** `/vision/capture`

#### Purpose

Provide the fastest possible way to capture thoughts, tasks, and notes without breaking flow.

#### Features

**NLP Mode:**

- Single input field with intelligent parsing
- Detects tags with `#` prefix (e.g., `#urgent`, `#work`)
- Detects paths with `@` prefix (e.g., `@Projects/Launch`)
- Detects due dates with "due" keyword (e.g., `due tomorrow`, `due 2025-11-20`)
- Real-time visual feedback showing parsed components
- Example: `"Buy milk #errands due tomorrow @shopping"` parses into:
  - Title: "Buy milk"
  - Tags: [errands]
  - Due: tomorrow
  - Path: @shopping

**Form Mode:**

- Structured alternative for users who prefer explicit fields
- Separate inputs for title, path, due date, tags
- Path autocomplete with fuzzy search
- Date picker for visual date selection

#### Keyboard Shortcuts

- `⌘/Ctrl+Shift+C`: Open capture overlay
- `Esc`: Close overlay
- `⌘/Ctrl+Enter`: Save and close

#### Design Decisions

**Why two modes?** Some users prefer the speed of NLP-style input, while others want the clarity of explicit form fields. Toggle button lets users choose their preferred workflow.

**Why modal overlay?** Capture should be accessible from anywhere in the app without losing context. A modal ensures you can quickly capture and return to what you were doing.

---

### Refile

**Route:** `/vision/refile`

#### Purpose

Move items to their correct location in the hierarchy quickly, with support for creating new paths on the fly.

#### Features

**Fuzzy Search:**

- Type to search existing headings/paths
- Keyboard navigation (↑/↓ arrows)
- Enter to select
- Shows path breadcrumbs for context

**Path Creation:**

- Create new paths inline with `#A/B/C` syntax
- Visual preview shows hierarchy that will be created
- Automatically creates intermediate headings

**Modes:**

- **Drop here**: Moves item as child of selected heading
- **Anchor to path**: Creates backlink/reference without moving

**Recent Destinations:**

- Quick access to frequently used refile targets
- Reduces need to search for common destinations

#### Keyboard Shortcuts

- `⌘/Ctrl+Shift+R`: Open refile modal
- `Alt`: Toggle between Drop/Anchor modes
- `↑/↓`: Navigate search results
- `Enter`: Confirm selection
- `Esc`: Cancel

#### Design Decisions

**Why fuzzy search?** With large hierarchies, exact navigation is slow. Fuzzy search lets you jump to deep paths by typing fragments (e.g., "prj laun" matches "Projects/Launch").

**Why Drop vs Anchor?** Some items should live in one place (Drop), while others benefit from being referenced in multiple contexts (Anchor). This distinction mirrors Org-mode's refile vs link behavior.

---

### Agenda

**Route:** `/vision/agenda`

#### Purpose

Surface the right tasks at the right time with intelligent filtering and scoring.

#### Features

**View Tabs:**

- **Today**: Tasks due today or overdue
- **Next 7 Days**: Upcoming tasks in the next week
- **Waiting**: Tasks blocked on external dependencies
- **Blocked**: Tasks that can't proceed due to blockers

**Scoring System:**

- Each task gets a 0-100 score based on:
  - Due date proximity (sooner = higher score)
  - Priority level (high > medium > low)
  - Blocking status (blocked tasks score lower)
  - Context and tags
- Score pills use color coding:
  - Red (80-100): Urgent, needs immediate attention
  - Orange (60-79): Important, address soon
  - Yellow (40-59): Normal priority
  - Green (0-39): Low priority

**Filtering:**

- Sort by score, due date, or title
- Filter by tags (multi-select)
- Filter by priority level
- Filters collapse to save screen space

**Task Metadata:**

- Status indicators (Ready/Waiting/Blocked) with icons
- Color-coded due dates (overdue red, today orange, soon yellow, future green)
- Tag pills with `#` prefix
- Path breadcrumbs for context
- Priority badges
- Blocked-by indicators

#### Design Decisions

**Why scoring?** Different users prioritize differently. Scoring aggregates multiple signals so you don't have to mentally compute "which task should I do next?"

**Why multiple tabs?** Context-switching is expensive. Tabs let you focus on one time horizon or status without distraction.

---

### Meeting Mode

**Route:** `/vision/meeting`

#### Purpose

Structure meeting time for better outcomes and automatic action item extraction.

#### Features

**Pre-Flight Panel:**

- Set meeting objective (required)
- List attendees
- Link to related project path
- Add related links/documents
- Start button begins timer

**Meeting Interface:**

- **Timer**: Elapsed time display with play/pause controls
- **Two-Pane Layout:**
  - Left: Free-form notes in monospace font
  - Right: Extracted action items
- **Objective Display**: Always visible as reminder
- **Attendee Count & Project Link**: Contextual metadata

**Action Parsing:**

- Type `[ ]` in notes to create action item
- Automatically extracted to action panel
- Manual action creation via input field
- Toggle completion status
- Remove actions

**Action Harvesting:**

- "Harvest Actions" button creates tasks from incomplete actions
- Actions inherit meeting context (project path, attendees, date)
- Meeting notes saved as document in system

#### Keyboard Shortcuts

- `⌘/Ctrl+M`: Open meeting mode
- `⌘/Ctrl+Enter`: Harvest actions and end meeting

#### Design Decisions

**Why pre-flight?** Meetings without clear objectives waste time. Pre-flight forces intentionality and captures metadata that makes notes more useful later.

**Why two-pane layout?** Action items get lost in free-form notes. Separate pane makes them explicit and actionable while preserving the flow of note-taking.

**Why [ ] syntax?** Familiar to users of Markdown, Org-mode, and issue trackers. Low friction to adopt.

---

### Settings

**Route:** `/vision/settings`

#### Purpose

Configure app behavior, appearance, and internationalization.

#### Features

**Theme:**

- Light, Dark, or System (follows OS preference)
- Visual previews of each theme
- Instant switching

**Density:**

- Compact: More content, less padding
- Comfortable: Balanced (default)
- Spacious: More breathing room, larger touch targets

**Keyboard Layout:**

- Standard: ⌘/Ctrl-based shortcuts
- Emacs-style: C-x, C-c, M-x patterns for power users

**Internationalization:**

- Locale selection (en-US, en-GB, ja-JP, fr-FR, de-DE)
- Time format (12h vs 24h)
- Week start day (Sunday vs Monday)

**Outline Preferences:**

- Monospace toggle: Better alignment for plain-text feel
- Line guides toggle: Vertical guides for nested structure

**Current Settings Summary:**

- Shows all active settings at a glance
- Helps users verify configuration

#### Design Decisions

**Why system theme option?** Users expect apps to respect OS preferences. System option provides consistency across their environment.

**Why density controls?** Accessibility and preference vary. Some users want information density (compact), others need larger touch targets (spacious).

**Why Emacs shortcuts?** Many knowledge workers use Emacs or Vim. Supporting Emacs shortcuts reduces friction for this audience.

---

## Theme System

### Color Tokens

All colors use CSS custom properties defined in `/styles/tokens.css`:

**Dark Mode (Default):**

- `--color-bg`: #0b0f14 (background)
- `--color-surface`: #0f141b (cards, panels)
- `--color-text`: #e6eaf2 (primary text)
- `--color-muted`: #9aa4b2 (secondary text)
- `--color-border`: #222935 (borders)

**Light Mode:**

- `--color-bg`: #ffffff
- `--color-surface`: #fbfbfc
- `--color-text`: #0c1116
- `--color-muted`: #475569
- `--color-border`: #e2e8f0

**Semantic Colors:**

- `--brand-500`: #2E90FA (primary actions)
- `--ok-500`: #22c55e (success, positive)
- `--warn-500`: #f59e0b (warnings, caution)
- `--danger-500`: #ef4444 (errors, destructive)
- `--info-500`: #38bdf8 (informational)

### Automatic Theme Switching

Themes respond to `prefers-color-scheme` media query. When user selects "System" in settings, CSS automatically applies correct theme based on OS preference.

### Motion Tokens

- `--dur-fast`: 120ms (micro-interactions)
- `--dur-med`: 200ms (standard transitions)
- `--dur-slow`: 300ms (complex animations)
- `--ease-emph`: cubic-bezier(.2,.8,.2,1) (emphasized easing)

Respects `prefers-reduced-motion` for accessibility.

---

## Navigation Patterns

### Command Palette

**Trigger:** `⌘/Ctrl+K`

Global fuzzy search for all commands and destinations:

- Navigate to screens
- Execute actions
- Search tasks and notes
- Keyboard-navigable results
- Escape to close

### Breadcrumbs

Shown in outline and detail views:

- Current location in hierarchy
- Clickable path segments to navigate up
- Truncates long paths with ellipsis

### Back Navigation

Prototypes include "Back to Overview" link for easy navigation during testing. Production app will use browser back button and breadcrumbs.

---

## Interaction Patterns

### Progressive Disclosure

**Example: Filters in Agenda**

- Collapsed by default
- "Filters" button with chevron icon
- Click to expand filter panel
- Chevron rotates to indicate state

### Real-Time Feedback

**Example: Capture NLP Parsing**

- Type in input field
- Parsed components appear below in real-time
- Color-coded pills show tags, paths, dates
- No "submit to parse" step required

### Keyboard Navigation

**Standard Patterns:**

- `Tab`: Move forward through focusable elements
- `Shift+Tab`: Move backward
- `Enter`: Activate/submit
- `Esc`: Cancel/close
- `↑/↓`: Navigate lists
- `/`: Focus search (when not in input)

**Context-Specific:**

- Outline: `Tab/Shift-Tab` for indent/outdent
- Tables: `e` to edit cell
- Refile: `Alt` to toggle mode

### Loading States

Buttons show spinner icon during async operations:

- `loading` prop on Button component
- Automatically disables interaction
- ARIA `aria-busy` attribute for screen readers

---

## Mobile Considerations

### Touch Targets

- Minimum 44x44px touch targets (iOS guideline)
- `min-w-[44px]` on all buttons
- Spacious density mode recommended for touch devices

### Responsive Layouts

- Grid layouts collapse to single column on mobile
- Two-pane layouts (e.g., meeting mode) stack vertically
- Command palette takes full screen width on mobile

### Gestures

Future enhancements:

- Swipe to complete tasks
- Pull to refresh
- Swipe navigation between views

### PWA Features

- Installable on home screen
- Offline functionality
- Push notifications for reminders (future)
- Badge counts on app icon (future)

---

## Design System Reference

All prototypes use components from `/components/ui/`:

- Button
- Input
- Textarea
- Card
- Dialog
- Pill
- Toolbar

See `/docs/ux-components.md` for complete API documentation.

Test all components at: `/_test-design-system`

---

## Future Enhancements

### Outline Editor

**Route:** `/vision/outline` (not yet built)

- Collapsible/expandable headings
- Zoom into headings for focus
- Drag-and-drop reordering
- Properties panel for metadata
- Bidirectional links
- Block references

### Slices (Query Builder)

**Route:** `/vision/slices` (not yet built)

- Visual query builder for custom views
- Save queries as persistent slices
- Table and list views
- Column customization
- Inline editing

### Collections (Type Builder)

**Route:** `/vision/collections` (not yet built)

- Define custom content types
- Field schemas (text, number, date, reference)
- Templates for new items
- Type-specific views and queries

---

## Conclusion

The UI vision for Project Cortex balances power and simplicity. By combining keyboard-first interactions, intelligent defaults, and progressive disclosure, we create an experience that scales from quick captures to complex knowledge management.

All prototypes demonstrate these principles in action, ready for implementation in the production application.
