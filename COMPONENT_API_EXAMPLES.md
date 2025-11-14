# Component API Examples - Quick Reference

Quick copy-paste examples for all design system components.

---

## Button

```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Saving...</Button>
<Button disabled>Disabled</Button>

// With icon
import { Save } from 'lucide-react';
<Button variant="primary">
  <Save size={16} />
  Save Changes
</Button>
```

---

## Input

```tsx
import { Input } from '@/components/ui';

// Basic
<Input label="Email" type="email" placeholder="you@example.com" />

// Required
<Input label="Password" type="password" required />

// With error
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={errors.username}
/>

// With helper text
<Input
  label="API Key"
  helperText="Keep this secret and secure"
/>

// Hidden label (accessible)
<Input label="Search" hideLabel placeholder="Search..." />
```

---

## Textarea

```tsx
import { Textarea } from '@/components/ui';

// Basic
<Textarea
  label="Description"
  placeholder="Enter a description..."
  rows={4}
/>

// With error
<Textarea
  label="Notes"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  error="This field is required"
  required
/>
```

---

## Card

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

// Simple card
<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>

// Structured card
<Card variant="bordered" padding="lg">
  <CardHeader>
    <h3 className="text-lg font-semibold">Project Details</h3>
    <p className="text-sm text-muted">Last updated 2 hours ago</p>
  </CardHeader>
  <CardContent>
    <p>Main content area with project information.</p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>

// Interactive card
<Card interactive onClick={() => router.push('/details')}>
  Click to navigate
</Card>

// Variants
<Card variant="default">Default (with shadow)</Card>
<Card variant="bordered">Bordered (no shadow)</Card>
<Card variant="flat">Flat (subtle background)</Card>

// Padding options
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding (default)</Card>
<Card padding="lg">Large padding</Card>
```

---

## Dialog

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@/components/ui";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">Additional content goes here.</p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Form dialog example
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Create Item</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Item</DialogTitle>
      <DialogDescription>Fill out the form below to create a new item.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <Input label="Name" required />
      <Textarea label="Description" rows={3} />
    </form>

    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button type="submit">Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

---

## Pill & ScorePill

```tsx
import { Pill, ScorePill } from '@/components/ui';

// Basic pills
<Pill variant="default">React</Pill>
<Pill variant="brand">Priority: High</Pill>
<Pill variant="ok">Completed</Pill>
<Pill variant="warn">In Review</Pill>
<Pill variant="danger">Blocked</Pill>
<Pill variant="info">Info</Pill>

// Dismissible pill
<Pill variant="brand" onDismiss={() => removeTag('urgent')}>
  Urgent
</Pill>

// Tag collection
<div className="flex flex-wrap gap-2">
  {tags.map(tag => (
    <Pill
      key={tag}
      variant="default"
      onDismiss={() => handleRemoveTag(tag)}
    >
      {tag}
    </Pill>
  ))}
</div>

// Score pills (auto-colored)
<ScorePill score={95} label="Quality" />    {/* green */}
<ScorePill score={75} label="Progress" />   {/* blue */}
<ScorePill score={55} label="Coverage" />   {/* amber */}
<ScorePill score={25} label="Risk" />       {/* red */}

// Without label
<ScorePill score={85} />

// In a list
<div className="flex gap-2">
  <ScorePill score={metrics.quality} label="Quality" />
  <ScorePill score={metrics.coverage} label="Coverage" />
  <ScorePill score={metrics.performance} label="Perf" />
</div>
```

---

## Toolbar

```tsx
import { Toolbar, ToolbarDivider, ToolbarGroup, Button } from '@/components/ui';
import { Bold, Italic, Underline, Link2, Image } from 'lucide-react';

// Basic toolbar
<Toolbar>
  <Button variant="ghost" size="sm">
    <Bold size={16} />
  </Button>
  <Button variant="ghost" size="sm">
    <Italic size={16} />
  </Button>
  <Button variant="ghost" size="sm">
    <Underline size={16} />
  </Button>
  <ToolbarDivider />
  <Button variant="ghost" size="sm">
    <Link2 size={16} />
  </Button>
</Toolbar>

// Grouped toolbar
<Toolbar variant="bordered">
  <ToolbarGroup label="Text Formatting">
    <Button variant="ghost" size="sm" aria-label="Bold">
      <Bold size={16} />
    </Button>
    <Button variant="ghost" size="sm" aria-label="Italic">
      <Italic size={16} />
    </Button>
  </ToolbarGroup>
  <ToolbarDivider />
  <ToolbarGroup label="Insert">
    <Button variant="ghost" size="sm" aria-label="Insert Link">
      <Link2 size={16} />
    </Button>
    <Button variant="ghost" size="sm" aria-label="Insert Image">
      <Image size={16} />
    </Button>
  </ToolbarGroup>
</Toolbar>

// Toolbar variants
<Toolbar variant="default">Default (with border)</Toolbar>
<Toolbar variant="bordered">Bordered (thicker border)</Toolbar>
<Toolbar variant="ghost">Ghost (no border)</Toolbar>

// Alignment
<Toolbar align="start">Left aligned</Toolbar>
<Toolbar align="center">Centered</Toolbar>
<Toolbar align="end">Right aligned</Toolbar>
<Toolbar align="between">Space between</Toolbar>

// Sizes
<Toolbar size="sm">Small toolbar</Toolbar>
<Toolbar size="md">Medium toolbar (default)</Toolbar>
<Toolbar size="lg">Large toolbar</Toolbar>
```

---

## Common Patterns

### Form with validation

```tsx
import { Input, Textarea, Button, Card } from "@/components/ui";

function MyForm() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // ... validation and submission
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" required error={errors.email} />
        <Input label="Password" type="password" required error={errors.password} />
        <Textarea label="Bio" rows={4} helperText="Tell us about yourself" />
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          Submit
        </Button>
      </form>
    </Card>
  );
}
```

### Status badges

```tsx
import { Pill } from "@/components/ui";

function getStatusPill(status) {
  const variants = {
    completed: "ok",
    in_progress: "brand",
    pending: "warn",
    failed: "danger",
  };

  return <Pill variant={variants[status]}>{status.replace("_", " ")}</Pill>;
}
```

### Confirmation dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from "@/components/ui";

function DeleteConfirmation({ open, onClose, onConfirm, itemName }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {itemName}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Card grid

```tsx
import { Card, CardHeader, CardContent, Pill } from "@/components/ui";

function ProjectGrid({ projects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project.id} interactive onClick={() => viewProject(project.id)}>
          <CardHeader>
            <h3 className="font-semibold">{project.name}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted mb-3">{project.description}</p>
            <div className="flex gap-2">
              <Pill variant="brand">{project.status}</Pill>
              {project.tags.map((tag) => (
                <Pill key={tag} variant="default">
                  {tag}
                </Pill>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Combining Components

```tsx
import {
  Card,
  CardHeader,
  CardContent,
  Input,
  Textarea,
  Button,
  Pill,
  Toolbar,
  ToolbarDivider,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui";

function ComplexExample() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Task Details</h2>
            <div className="flex gap-2 mt-2">
              <Pill variant="ok">Active</Pill>
              <Pill variant="brand">High Priority</Pill>
            </div>
          </div>
          <Toolbar size="sm">
            <Button variant="ghost" size="sm">
              Edit
            </Button>
            <ToolbarDivider />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Task</DialogTitle>
                </DialogHeader>
                <p>Are you sure?</p>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Toolbar>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input label="Title" defaultValue="Complete design system" />
        <Textarea label="Description" rows={4} />
      </CardContent>
    </Card>
  );
}
```

---

## Design Token Usage

```tsx
// Use tokens directly in className
<div className="bg-surface border-border text-text rounded-md shadow-sm p-4">
  Content with token-based styling
</div>

// Brand colors
<div className="bg-brand-500 text-white">Brand element</div>

// Semantic colors
<p className="text-ok-500">Success message</p>
<p className="text-warn-500">Warning message</p>
<p className="text-danger-500">Error message</p>
<p className="text-info-500">Info message</p>

// Muted text
<p className="text-muted">Secondary text</p>

// Spacing
<div className="space-y-4 p-6 gap-2">Consistent spacing</div>

// Transitions
<div className="transition-all duration-fast ease-emph">
  Smooth animation
</div>
```

---

For full API documentation, see `/docs/design-system-components.md`
