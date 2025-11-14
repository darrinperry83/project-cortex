"use client";

import React from "react";

/**
 * Textarea Component
 *
 * A multi-line text input field with label, error state, and disabled state.
 * Similar to Input but for longer text content.
 * Fully accessible with proper ARIA attributes and focus management.
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   placeholder="Enter a detailed description..."
 *   rows={4}
 * />
 *
 * <Textarea
 *   label="Notes"
 *   error="This field is required"
 *   required
 * />
 * ```
 */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text for the textarea field
   */
  label?: string;

  /**
   * Error message to display below the textarea
   * When provided, textarea will show error styling
   */
  error?: string;

  /**
   * Helper text to display below the textarea
   * Only shown when there is no error
   */
  helperText?: string;

  /**
   * Whether to hide the label visually but keep it for screen readers
   * @default false
   */
  hideLabel?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      hideLabel = false,
      className = "",
      id,
      required,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperTextId = helperText ? `${textareaId}-helper` : undefined;
    const describedBy = error ? errorId : helperTextId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
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

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={`
            w-full px-3 py-2
            bg-surface text-text
            border border-border rounded-md
            text-md
            placeholder:text-muted
            transition-all duration-fast ease-emph
            hover:border-neutral-600
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border
            resize-vertical
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

Textarea.displayName = "Textarea";
