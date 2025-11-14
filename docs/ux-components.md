# Component Library Reference

**Project Cortex - Push 1.02**
**Last Updated:** November 14, 2025

Complete reference for the UI component library. All components are located in `/components/ui/` and follow consistent design patterns using CSS custom properties (design tokens).

## Table of Contents

1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Components](#components)
   - [Button](#button)
   - [Input](#input)
   - [Textarea](#textarea)
   - [Card](#card)
   - [Dialog](#dialog)
   - [Pill & ScorePill](#pill--scorepill)
   - [Toolbar](#toolbar)
4. [Usage Patterns](#usage-patterns)
5. [Theming Guide](#theming-guide)
6. [Motion & Animation](#motion--animation)
7. [Accessibility Guidelines](#accessibility-guidelines)

---

## Overview

The component library provides a consistent set of building blocks for the Project Cortex UI. All components:

- Use CSS custom properties for theming
- Support dark and light modes automatically
- Include proper ARIA attributes for accessibility
- Follow keyboard navigation standards
- Provide TypeScript types for props

**Test Page:** `/_test-design-system`

Visit this page to see all components in action with interactive examples.

---

## Design Tokens

All visual properties use CSS custom properties defined in `/styles/tokens.css`.

### Color Tokens

#### Base Colors (Dark Mode Default)

```css
--color-bg: #0b0f14; /* Background */
--color-surface: #0f141b; /* Cards, panels */
--color-text: #e6eaf2; /* Primary text */
--color-muted: #9aa4b2; /* Secondary text */
--color-border: #222935; /* Borders */
```

#### Semantic Colors

```css
--brand-500: #2e90fa; /* Primary brand color */
--brand-600: #1b6fd8; /* Hover state */
--brand-700: #1459ae; /* Active state */

--ok-500: #22c55e; /* Success/positive */
--warn-500: #f59e0b; /* Warning/caution */
--danger-500: #ef4444; /* Error/destructive */
--info-500: #38bdf8; /* Informational */
```

### Typography Tokens

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, ...;
--font-mono: ui-monospace, SFMono-Regular, ...;

/* Type scale */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-md: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
```

### Spacing Tokens

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
```

### Motion Tokens

```css
--dur-fast: 120ms; /* Micro-interactions */
--dur-med: 200ms; /* Standard transitions */
--dur-slow: 300ms; /* Complex animations */

--ease-emph: cubic-bezier(0.2, 0.8, 0.2, 1); /* Emphasized easing */
```

### Border Radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
```

### Shadows

```css
--shadow-1: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-2: 0 6px 18px rgba(0, 0, 0, 0.35);
```

---

## Components

### Button

**Location:** `/components/ui/Button.tsx`

A versatile button component with multiple variants, sizes, and states.

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}
```

#### Variants

- **primary**: Blue background, high emphasis (default)
- **secondary**: Neutral background, medium emphasis
- **ghost**: Transparent background, low emphasis
- **danger**: Red background, destructive actions

#### Sizes

- **sm**: 36px height, 12px padding
- **md**: 44px height, 16px padding (default)
- **lg**: 48px height, 24px padding

#### Examples

```tsx
// Basic usage
<Button variant="primary">Save Changes</Button>

// With loading state
<Button variant="primary" loading>Saving...</Button>

// Danger button
<Button variant="danger">Delete</Button>

// Small ghost button
<Button variant="ghost" size="sm">Cancel</Button>

// Disabled
<Button variant="primary" disabled>Not Available</Button>
```

#### Accessibility

- Minimum 44x44px touch target (iOS guideline)
- `aria-busy="true"` when loading
- Proper focus ring with keyboard navigation
- Disabled state prevents interaction

---

### Input

**Location:** `/components/ui/Input.tsx`

A text input field with label, error state, and helper text.

#### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
}
```

#### Features

- Automatic ID generation for accessibility
- Error state with red border and message
- Helper text for guidance
- Required field indicator (asterisk)
- Screen-reader accessible labels

#### Examples

```tsx
// Basic input
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  required
/>

// With helper text
<Input
  label="Username"
  helperText="Choose a unique username"
/>

// Hidden label (still accessible to screen readers)
<Input
  label="Search"
  hideLabel
  placeholder="Search..."
/>
```

#### Accessibility

- `<label>` element with proper `htmlFor` attribute
- `aria-invalid` when error present
- `aria-describedby` links to error/helper text
- Required indicator with `aria-label="required"`

---

### Textarea

**Location:** `/components/ui/Textarea.tsx`

A multi-line text input with same features as Input.

#### Props

```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
}
```

#### Features

Same as Input, plus:

- Vertical resize only
- Configurable row count

#### Examples

```tsx
// Basic textarea
<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={4}
/>

// With error
<Textarea
  label="Notes"
  error="This field is required"
  required
/>

// Larger textarea
<Textarea
  label="Content"
  rows={10}
/>
```

---

### Card

**Location:** `/components/ui/Card.tsx`

A container component with consistent padding, borders, and shadow.

#### Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}
```

#### Variants

- **default**: Shadow and border (standard card)
- **bordered**: Thicker border, no shadow
- **flat**: Translucent background, no border or shadow

#### Padding Sizes

- **none**: 0px
- **sm**: 12px
- **md**: 16px (default)
- **lg**: 24px

#### Sub-Components

- `<CardHeader>`: Top section with margin-bottom
- `<CardContent>`: Main content area
- `<CardFooter>`: Bottom section with margin-top and flex layout

#### Examples

```tsx
// Basic card
<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>

// Structured card
<Card variant="bordered" padding="lg">
  <CardHeader>
    <h3>Project Details</h3>
  </CardHeader>
  <CardContent>
    <p>Main content area</p>
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
    <Button variant="ghost">Cancel</Button>
  </CardFooter>
</Card>

// Interactive card (hover effects)
<Card interactive>
  <h3>Clickable Card</h3>
</Card>

// Flat variant
<Card variant="flat" padding="sm">
  <p>Subtle container</p>
</Card>
```

---

### Dialog

**Location:** `/components/ui/Dialog.tsx`

A modal dialog built on Radix UI primitives with accessible patterns.

#### Components

- `<Dialog>`: Root component
- `<DialogTrigger>`: Button that opens dialog
- `<DialogContent>`: Modal content container
- `<DialogHeader>`: Header section
- `<DialogTitle>`: Title (required for accessibility)
- `<DialogDescription>`: Subtitle/description
- `<DialogFooter>`: Footer with actions
- `<DialogClose>`: Close button

#### Props

```typescript
// DialogContent
interface DialogContentProps {
  showClose?: boolean; // Default: true
  children: React.ReactNode;
}
```

#### Examples

```tsx
// Basic dialog
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>Make changes to your profile here.</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <Input label="Name" />
      <Input label="Email" type="email" />
    </div>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={() => setOpen(false)}>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

#### Accessibility

- Focus trapped within dialog when open
- `Esc` key closes dialog
- Click outside closes dialog
- Returns focus to trigger on close
- `DialogTitle` required for screen readers
- Backdrop prevents interaction with background

---

### Pill & ScorePill

**Location:** `/components/ui/Pill.tsx`

Small badge/chip components for tags, labels, and status indicators.

#### Pill Props

```typescript
interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "ok" | "warn" | "danger" | "info";
  onDismiss?: () => void;
  children: React.ReactNode;
}
```

#### Pill Variants

- **default**: Neutral gray
- **brand**: Blue (primary actions/tags)
- **ok**: Green (success/positive)
- **warn**: Orange (warnings)
- **danger**: Red (errors/critical)
- **info**: Light blue (informational)

#### Pill Examples

```tsx
// Basic pills
<Pill variant="default">React</Pill>
<Pill variant="brand">Priority: High</Pill>
<Pill variant="ok">Status: Done</Pill>
<Pill variant="warn">Review Required</Pill>

// Dismissible pill
<Pill
  variant="brand"
  onDismiss={() => console.log('dismissed')}
>
  Tag Name
</Pill>
```

#### ScorePill Props

```typescript
interface ScorePillProps {
  score: number; // 0-100
  label?: string; // Optional prefix label
}
```

#### ScorePill Examples

```tsx
// Score-based coloring (automatic)
<ScorePill score={85} />  // Green (80-100)
<ScorePill score={65} />  // Blue (60-79)
<ScorePill score={45} />  // Orange (40-59)
<ScorePill score={25} />  // Red (0-39)

// With label
<ScorePill score={72} label="Quality" />
<ScorePill score={88} label="Progress" />
```

---

### Toolbar

**Location:** `/components/ui/Toolbar.tsx`

A horizontal container for grouping buttons and action controls.

#### Props

```typescript
interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "ghost";
  align?: "start" | "center" | "end" | "between";
  size?: "sm" | "md" | "lg";
}
```

#### Sub-Components

- `<ToolbarGroup>`: Semantic grouping with label
- `<ToolbarDivider>`: Vertical separator

#### Examples

```tsx
import { Bold, Italic, Link2 } from "lucide-react";

// Basic toolbar
<Toolbar>
  <Button variant="ghost" size="sm">
    <Bold size={16} />
  </Button>
  <Button variant="ghost" size="sm">
    <Italic size={16} />
  </Button>
  <ToolbarDivider />
  <Button variant="ghost" size="sm">
    <Link2 size={16} />
  </Button>
</Toolbar>

// With groups
<Toolbar>
  <ToolbarGroup label="Formatting">
    <Button variant="ghost" size="sm">
      <Bold size={16} />
    </Button>
    <Button variant="ghost" size="sm">
      <Italic size={16} />
    </Button>
  </ToolbarGroup>
  <ToolbarDivider />
  <ToolbarGroup label="Insert">
    <Button variant="ghost" size="sm">
      <Link2 size={16} />
    </Button>
  </ToolbarGroup>
</Toolbar>
```

#### Accessibility

- `role="toolbar"` for proper semantics
- `role="group"` and `aria-label` on ToolbarGroup
- `role="separator"` on ToolbarDivider

---

## Usage Patterns

### Form Layouts

Use consistent spacing and widths:

```tsx
<div className="space-y-4">
  <Input label="Name" />
  <Input label="Email" type="email" />
  <Textarea label="Bio" rows={4} />
  <div className="flex gap-2 justify-end">
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Save</Button>
  </div>
</div>
```

### Card Grids

Responsive grid layouts:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>
    <CardHeader>
      <h3 className="font-semibold">Card 1</h3>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted">Content</p>
    </CardContent>
  </Card>
  {/* More cards... */}
</div>
```

### Tag Lists

Horizontal wrapping pill lists:

```tsx
<div className="flex flex-wrap gap-2">
  <Pill variant="brand">React</Pill>
  <Pill variant="brand">TypeScript</Pill>
  <Pill variant="info">Web</Pill>
</div>
```

### Modal Patterns

Standard modal structure:

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>

    {/* Content */}
    <div className="py-4">{/* Form fields, etc. */}</div>

    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Theming Guide

### How Dark/Light Mode Works

The theme system uses CSS custom properties that change based on `prefers-color-scheme`:

1. **Dark mode (default)**: Uses dark background, light text
2. **Light mode**: Overrides colors when `@media (prefers-color-scheme: light)` matches
3. **Automatic**: No JavaScript required, purely CSS-based

### Custom Theme Colors

All components reference CSS custom properties, so you can customize the theme by updating `/styles/tokens.css`:

```css
:root {
  --brand-500: #YOUR_COLOR;
  --brand-600: #HOVER_COLOR;
  --brand-700: #ACTIVE_COLOR;
}
```

### Per-Component Overrides

Override component styles using className prop:

```tsx
<Button className="bg-purple-600 hover:bg-purple-700">Custom Color</Button>
```

### Tailwind Integration

Components use Tailwind utility classes that reference CSS custom properties:

```css
/* In tailwind.config.ts */
colors: {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  text: "var(--color-text)",
  muted: "var(--color-muted)",
  border: "var(--color-border)",
  brand: {
    500: "var(--brand-500)",
    600: "var(--brand-600)",
    700: "var(--brand-700)",
  },
}
```

---

## Motion & Animation

### Duration Guidelines

- **Fast (120ms)**: Micro-interactions (hover, focus)
- **Medium (200ms)**: Standard transitions (modal open, drawer slide)
- **Slow (300ms)**: Complex animations (page transitions)

### Easing Curves

Use `--ease-emph` (cubic-bezier(.2, .8, .2, 1)) for emphasized motion:

```tsx
className = "transition-all duration-fast ease-emph";
```

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-fast: 0ms;
    --dur-med: 0ms;
    --dur-slow: 0ms;
  }
}
```

### Animation Patterns

**Hover states:**

```tsx
className = "hover:bg-neutral-800 transition-colors duration-fast";
```

**Scale effects:**

```tsx
className = "hover:scale-105 transition-transform duration-fast";
```

**Fade in/out:**

```tsx
className = "opacity-0 animate-fade-in";
```

---

## Accessibility Guidelines

### Focus Management

All interactive elements show visible focus ring:

```tsx
className = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";
```

### Keyboard Navigation

- `Tab`: Navigate between focusable elements
- `Enter`/`Space`: Activate buttons
- `Esc`: Close modals/dialogs
- Arrow keys: Navigate lists/menus

### ARIA Attributes

Always include:

- `aria-label` for icon-only buttons
- `aria-describedby` for error messages
- `aria-invalid` for form validation
- `role` for custom components

### Color Contrast

All color combinations meet WCAG AA standards:

- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Screen Reader Testing

Test components with:

- VoiceOver (macOS)
- NVDA (Windows)
- JAWS (Windows)

---

## Best Practices

### Component Selection

- **Button** vs `<button>`: Always use `<Button>` component for consistent styling
- **Input** vs native: Always use `<Input>` for automatic accessibility
- **Card** vs `<div>`: Use Card for semantic grouping with consistent spacing

### Prop Usage

- Prefer semantic variants over custom className when possible
- Use size props instead of custom height/padding
- Add `aria-label` to icon-only buttons

### Performance

- Avoid inline functions in render for callbacks
- Use React.memo for expensive components
- Leverage CSS transitions over JS animations

### Testing

Visit `/_test-design-system` to:

- Verify component appearance
- Test interactive states
- Check dark/light mode switching
- Validate keyboard navigation

---

## Component Index

Quick reference of all components:

| Component | File           | Purpose                |
| --------- | -------------- | ---------------------- |
| Button    | `Button.tsx`   | Clickable actions      |
| Input     | `Input.tsx`    | Single-line text input |
| Textarea  | `Textarea.tsx` | Multi-line text input  |
| Card      | `Card.tsx`     | Container/surface      |
| Dialog    | `Dialog.tsx`   | Modal dialogs          |
| Pill      | `Pill.tsx`     | Tags and badges        |
| ScorePill | `Pill.tsx`     | Score indicators       |
| Toolbar   | `Toolbar.tsx`  | Action bar             |

---

## Further Reading

- **UI Vision**: See `/docs/ui-vision.md` for overall design philosophy
- **Keyboard Shortcuts**: See `/docs/ux-keyboard-map.md` for complete keyboard reference
- **Design Tokens**: See `/styles/tokens.css` for full token reference
- **Test Page**: Visit `/_test-design-system` for interactive examples

---

**Questions or Issues?**

If you encounter bugs or have suggestions for improvements, please document them in the project issue tracker.
