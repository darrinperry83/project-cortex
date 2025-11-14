"use client";

import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and states.
 * Supports loading state with spinner, disabled state, and full accessibility.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" size="sm" disabled>Disabled</Button>
 * <Button variant="danger" loading>Loading...</Button>
 * ```
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "ghost" | "danger";

  /**
   * Size of the button
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Whether the button is in a loading state
   * Shows spinner and disables interaction
   * @default false
   */
  loading?: boolean;

  /**
   * Content to display inside the button
   */
  children: React.ReactNode;
}

const variantStyles = {
  primary: "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white border-transparent",
  secondary: "bg-surface hover:bg-neutral-800 active:bg-neutral-700 text-text border-border",
  ghost:
    "bg-transparent hover:bg-neutral-800/50 active:bg-neutral-700/50 text-text border-transparent",
  danger: "bg-danger-500 hover:bg-red-600 active:bg-red-700 text-white border-transparent",
};

const sizeStyles = {
  sm: "h-9 px-3 text-sm min-w-[44px]",
  md: "h-11 px-4 text-md min-w-[44px]",
  lg: "h-12 px-6 text-lg min-w-[44px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-md border
          transition-all duration-fast ease-emph
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <Loader2
            className="animate-spin"
            size={size === "sm" ? 14 : size === "md" ? 16 : 18}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
