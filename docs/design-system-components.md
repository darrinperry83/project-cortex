# Design System Components - API Reference

**Project Cortex - Push 1.02**

This document provides a comprehensive reference for all base UI components in the design system.

---

## Import

All components can be imported from the central barrel export:

```tsx
import { Button, Input, Card, Pill } from "@/components/ui";
```

---

## Design Tokens

The design system is built on CSS custom properties defined in `/styles/tokens.css`:

### Color Tokens

- `--color-bg` - Background color (dark: #0b0f14, light: #ffffff)
- `--color-surface` - Surface color (dark: #0f141b, light: #fbfbfc)
- `--color-text` - Primary text color (dark: #e6eaf2, light: #0c1116)
- `--color-muted` - Muted text color (dark: #9aa4b2, light: #475569)
- `--color-border` - Border color (dark: #222935, light: #e2e8f0)

### Brand & Semantic Colors

- `--brand-500`, `--brand-600`, `--brand-700` - Brand blue
- `--ok-500` - Success green (#22c55e)
- `--warn-500` - Warning amber (#f59e0b)
- `--danger-500` - Error red (#ef4444)
- `--info-500` - Info blue (#38bdf8)

### Typography

- Font families: `--font-sans`, `--font-mono`
- Text scales: `--text-xs` to `--text-2xl`

### Spacing

- `--space-1` (4px) through `--space-8` (32px)

### Radius & Shadow

- `--radius-sm`, `--radius-md`, `--radius-lg`
- `--shadow-1`, `--shadow-2`

### Motion

- `--dur-fast` (120ms), `--dur-med` (200ms), `--dur-slow` (300ms)
- `--ease-emph` - Emphasized easing curve

---

## Button

A versatile button component with multiple variants, sizes, and states.

### Props

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  // ... extends all standard button HTML attributes
}
```

### Usage

```tsx
// Basic usage
<Button variant="primary">Save Changes</Button>

// With loading state
<Button variant="primary" loading>Saving...</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

### Features

- 44px minimum touch target (mobile-first)
- Focus ring with brand color
- Loading spinner with aria-busy
- Proper disabled state with opacity
- Smooth transitions using design tokens

---

## Input

A text input field with label, error state, and helper text support.

### Props

```tsx
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
  required?: boolean;
  // ... extends all standard input HTML attributes
}
```

### Usage

```tsx
// Basic input with label
<Input label="Email" type="email" placeholder="you@example.com" />

// Required field
<Input label="Password" type="password" required />

// With error message
<Input
  label="Username"
  error="Username is already taken"
/>

// With helper text
<Input
  label="API Key"
  helperText="Keep this secret and secure"
/>

// Hidden label (accessible to screen readers)
<Input
  label="Search"
  hideLabel
  placeholder="Search..."
/>
```

### Features

- Automatic ID generation for accessibility
- Error and helper text with proper ARIA attributes
- Focus states with ring
- Disabled state support
- Required field indicator

---

## Textarea

Multi-line text input with the same features as Input.

### Props

```tsx
interface TextareaProps {
  label?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
  required?: boolean;
  rows?: number;
  // ... extends all standard textarea HTML attributes
}
```

### Usage

```tsx
// Basic textarea
<Textarea
  label="Description"
  placeholder="Enter a description..."
  rows={4}
/>

// With error
<Textarea
  label="Notes"
  error="This field is required"
  required
/>
```

### Features

- Vertical resize only
- Same accessibility features as Input
- Configurable row height

---

## Card

A container component with variants and flexible padding.

### Props

```tsx
interface CardProps {
  variant?: "default" | "bordered" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  // ... extends all standard div HTML attributes
}
```

### Usage

```tsx
// Basic card
<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>

// With structure
<Card variant="bordered" padding="lg">
  <CardHeader>
    <h3>Project Details</h3>
  </CardHeader>
  <CardContent>
    <p>Main content area</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive card
<Card interactive onClick={() => navigate('/details')}>
  Clickable card with hover effect
</Card>
```

### Subcomponents

- `CardHeader` - Header section with bottom margin
- `CardContent` - Main content area
- `CardFooter` - Footer with flex layout

---

## Dialog

Modal dialog built on Radix UI with token-based styling.

### Usage

```tsx
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>Are you sure you want to proceed?</DialogDescription>
    </DialogHeader>

    <div className="py-4">Dialog content goes here</div>

    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

### Components

- `Dialog` - Root component
- `DialogTrigger` - Trigger button
- `DialogContent` - Content container with overlay
- `DialogHeader` - Header section
- `DialogTitle` - Title (required for a11y)
- `DialogDescription` - Description text
- `DialogFooter` - Footer with action buttons
- `DialogClose` - Close button component

### Features

- Backdrop with blur
- Focus trap
- Escape key to close
- Click outside to close
- Smooth animations with tokens
- Accessible with proper ARIA

---

## Pill & ScorePill

Small badge/chip components for tags, labels, and scores.

### Pill Props

```tsx
interface PillProps {
  variant?: "default" | "brand" | "ok" | "warn" | "danger" | "info";
  onDismiss?: () => void;
  children: React.ReactNode;
}
```

### Pill Usage

```tsx
// Basic pills
<Pill variant="default">React</Pill>
<Pill variant="brand">Priority: High</Pill>
<Pill variant="ok">Completed</Pill>
<Pill variant="warn">In Review</Pill>
<Pill variant="danger">Blocked</Pill>

// Dismissible pill
<Pill variant="brand" onDismiss={() => removeTag('urgent')}>
  Urgent
</Pill>
```

### ScorePill Props

```tsx
interface ScorePillProps {
  score: number; // 0-100
  label?: string;
}
```

### ScorePill Usage

```tsx
// Score pills (auto-colored based on value)
<ScorePill score={85} label="Quality" />
<ScorePill score={60} label="Progress" />
<ScorePill score={35} label="Risk" />
```

### ScorePill Color Logic

- score >= 80: green (ok variant)
- score >= 60: blue (brand variant)
- score >= 40: amber (warn variant)
- score < 40: red (danger variant)

---

## Toolbar

Horizontal container for grouping buttons and controls.

### Props

```tsx
interface ToolbarProps {
  variant?: "default" | "bordered" | "ghost";
  align?: "start" | "center" | "end" | "between";
  size?: "sm" | "md" | "lg";
}
```

### Usage

```tsx
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
    <Link size={16} />
  </Button>
</Toolbar>

// Grouped toolbar
<Toolbar variant="bordered" size="lg">
  <ToolbarGroup label="Formatting">
    <Button variant="ghost" size="sm">Bold</Button>
    <Button variant="ghost" size="sm">Italic</Button>
  </ToolbarGroup>
  <ToolbarDivider />
  <ToolbarGroup label="Alignment">
    <Button variant="ghost" size="sm">Left</Button>
    <Button variant="ghost" size="sm">Center</Button>
  </ToolbarGroup>
</Toolbar>
```

### Subcomponents

- `ToolbarDivider` - Vertical separator
- `ToolbarGroup` - Semantic grouping with ARIA label

---

## Accessibility Features

All components follow accessibility best practices:

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Tab order is logical and predictable

### ARIA Attributes

- Proper roles, labels, and descriptions
- Error messages linked with aria-describedby
- Loading states announced with aria-busy
- Required fields marked with aria-required

### Screen Readers

- Semantic HTML elements
- Visible and hidden labels where appropriate
- Status announcements for dynamic content

### Visual Accessibility

- AA+ color contrast ratios
- 44px minimum touch targets on mobile
- Focus states are clearly visible
- Support for reduced motion preference

---

## Theme Support

All components automatically adapt to light/dark mode via CSS custom properties:

```css
@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #ffffff;
    --color-surface: #fbfbfc;
    --color-text: #0c1116;
    --color-muted: #475569;
    --color-border: #e2e8f0;
  }
}
```

Components will automatically use the appropriate colors based on system preference.

---

## Tailwind Integration

All design tokens are mapped to Tailwind utilities:

```tsx
// Use token-based classes
<div className="bg-surface border-border text-text rounded-md shadow-sm">
  Content
</div>

// Brand colors
<div className="bg-brand-500 text-white">
  Brand element
</div>

// Semantic colors
<div className="text-ok-500">Success message</div>
<div className="text-danger-500">Error message</div>
```

---

## Testing

A test page is available at `/_test-design-system` to view all components in action.

To test the design system:

```bash
npm run dev
# Navigate to http://localhost:3000/_test-design-system
```

---

## File Structure

```
/styles/
  tokens.css          - CSS custom properties
  globals.css         - Global styles with token imports

/components/ui/
  Button.tsx          - Button component
  Input.tsx           - Text input
  Textarea.tsx        - Multi-line input
  Card.tsx            - Container component
  Dialog.tsx          - Modal dialog
  Pill.tsx            - Badge/chip component
  Toolbar.tsx         - Action group
  index.ts            - Barrel export

tailwind.config.ts    - Tailwind configuration with token mapping
```

---

## Design Decisions

### Component Design

1. **Use Client Directive**: All components use "use client" for compatibility with Next.js app router
2. **TypeScript First**: Full type safety with proper prop interfaces
3. **Forwarded Refs**: All components support ref forwarding for flexibility
4. **Composable**: Components are designed to work together seamlessly

### Styling Approach

1. **CSS Variables**: Core tokens defined as CSS custom properties
2. **Tailwind Classes**: Utility classes mapped to tokens
3. **No CSS-in-JS**: Using Tailwind for styling, CSS variables for theming
4. **Mobile First**: Responsive design starting from mobile

### Accessibility

1. **WCAG AA+**: Meeting or exceeding accessibility standards
2. **Keyboard First**: All interactions work without mouse
3. **Screen Reader Tested**: Proper semantics and ARIA
4. **Reduced Motion**: Respecting user preferences

### Performance

1. **Tree Shakeable**: Import only what you need
2. **No Runtime CSS**: All styles are static Tailwind classes
3. **Small Bundle**: Minimal component overhead
4. **SSR Compatible**: Works with Next.js server components (when needed)

---

## Next Steps

This design system provides the foundation for:

- Vision prototypes (`/_vision/*`)
- Production features
- Consistent UI/UX across the application

For questions or component additions, refer to the Push 1.02 specification document.
