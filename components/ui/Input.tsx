"use client";

import React from "react";

/**
 * Input Component
 *
 * A text input field with label, error state, and disabled state.
 * Fully accessible with proper ARIA attributes and focus management.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   required
 * />
 *
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 * ```
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text for the input field
   */
  label?: string;

  /**
   * Error message to display below the input
   * When provided, input will show error styling
   */
  error?: string;

  /**
   * Helper text to display below the input
   * Only shown when there is no error
   */
  helperText?: string;

  /**
   * Whether to hide the label visually but keep it for screen readers
   * @default false
   */
  hideLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, hideLabel = false, className = "", id, required, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = error ? errorId : helperTextId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`
              block text-sm font-medium mb-2 text-text
              ${hideLabel ? "sr-only" : ""}
            `}
          >
            {label}
            {required && (
              <span className="text-danger ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`
            w-full h-11 px-3 py-2
            bg-surface text-text
            border border-border rounded-md
            text-md
            placeholder:text-muted
            transition-all duration-fast ease-emph
            hover:border-neutral-600
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border
            ${error ? "border-danger focus:ring-danger" : ""}
            ${className}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          {...props}
        />

        {error && (
          <p id={errorId} className="mt-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperTextId} className="mt-2 text-sm text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
