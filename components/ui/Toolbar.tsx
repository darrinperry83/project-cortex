"use client";

import React from "react";

/**
 * Toolbar Component
 *
 * A horizontal container for grouping buttons and action controls.
 * Provides consistent spacing and alignment for tool groups.
 *
 * @example
 * ```tsx
 * <Toolbar>
 *   <Button variant="ghost" size="sm">
 *     <Bold size={16} />
 *   </Button>
 *   <Button variant="ghost" size="sm">
 *     <Italic size={16} />
 *   </Button>
 *   <ToolbarDivider />
 *   <Button variant="ghost" size="sm">
 *     <Link size={16} />
 *   </Button>
 * </Toolbar>
 * ```
 */

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the toolbar
   * @default "default"
   */
  variant?: "default" | "bordered" | "ghost";

  /**
   * Alignment of items within the toolbar
   * @default "start"
   */
  align?: "start" | "center" | "end" | "between";

  /**
   * Size of the toolbar (affects padding and spacing)
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-surface border border-border",
  bordered: "bg-surface border-2 border-border",
  ghost: "bg-transparent",
};

const alignStyles = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

const sizeStyles = {
  sm: "gap-1 p-1",
  md: "gap-2 p-2",
  lg: "gap-3 p-3",
};

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (
    { variant = "default", align = "start", size = "md", className = "", children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="toolbar"
        className={`
          inline-flex items-center
          rounded-md
          ${variantStyles[variant]}
          ${alignStyles[align]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Toolbar.displayName = "Toolbar";

/**
 * ToolbarDivider Component
 *
 * A vertical divider to separate groups of toolbar items.
 */
export interface ToolbarDividerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToolbarDivider = React.forwardRef<HTMLDivElement, ToolbarDividerProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={`w-px h-6 bg-border mx-1 ${className}`}
        {...props}
      />
    );
  }
);

ToolbarDivider.displayName = "ToolbarDivider";

/**
 * ToolbarGroup Component
 *
 * A semantic grouping of related toolbar items.
 */
export interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Accessible label for the group
   */
  label?: string;
}

export const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ label, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className={`inline-flex items-center gap-1 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ToolbarGroup.displayName = "ToolbarGroup";
