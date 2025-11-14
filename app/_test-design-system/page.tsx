"use client";

import React from "react";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  Pill,
  ScorePill,
  Toolbar,
  ToolbarDivider,
  ToolbarGroup,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import { Bold, Italic, Link2 } from "lucide-react";

/**
 * Design System Test Page
 * Tests all base UI components from the design system
 */
export default function DesignSystemTest() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Design System Test</h1>
        <p className="text-muted">Testing all UI components with design tokens</p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Buttons</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Inputs */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Form Inputs</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" error="Password is required" required />
          <Input label="Username" helperText="Choose a unique username" />
          <Textarea label="Description" placeholder="Enter description..." rows={4} />
        </CardContent>
      </Card>

      {/* Pills */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Pills & Badges</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Pill variant="default">Default</Pill>
            <Pill variant="brand">Brand</Pill>
            <Pill variant="ok">Success</Pill>
            <Pill variant="warn">Warning</Pill>
            <Pill variant="danger">Danger</Pill>
            <Pill variant="info">Info</Pill>
            <Pill variant="brand" onDismiss={() => console.log("dismissed")}>
              Dismissible
            </Pill>
            <ScorePill score={85} label="Quality" />
            <ScorePill score={60} label="Progress" />
            <ScorePill score={35} label="Risk" />
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Toolbar</h2>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Dialog */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Dialog</h2>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Example Dialog</DialogTitle>
                <DialogDescription>
                  This is a test dialog using Radix UI with design tokens.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted">Dialog content goes here.</p>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Card Variants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="default">
          <CardHeader>
            <h3 className="font-semibold">Default Card</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">Default variant with shadow</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardHeader>
            <h3 className="font-semibold">Bordered Card</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">Bordered variant</p>
          </CardContent>
        </Card>
        <Card variant="flat">
          <CardHeader>
            <h3 className="font-semibold">Flat Card</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">Flat variant</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
