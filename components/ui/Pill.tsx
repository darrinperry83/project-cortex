"use client";

import React from "react";
import { X } from "lucide-react";

/**
 * Pill Component
 *
 * A small badge/chip component used for tags, labels, scores, and status indicators.
 * Supports multiple color variants and optional dismiss functionality.
 *
 * @example
 * ```tsx
 * <Pill variant="default">React</Pill>
 * <Pill variant="brand">Priority: High</Pill>
 * <Pill variant="ok">Status: Done</Pill>
 * <Pill variant="warn" onDismiss={() => console.log('dismissed')}>
 *   Warning
 * </Pill>
 * ```
 */

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual variant of the pill
   * @default "default"
   */
  variant?: "default" | "brand" | "ok" | "warn" | "danger" | "info";

  /**
   * Callback when the dismiss button is clicked
   * When provided, a dismiss button will be shown
   */
  onDismiss?: () => void;

  /**
   * Content to display inside the pill
   */
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-neutral-800 text-text border-neutral-700",
  brand: "bg-brand-500/20 text-brand-500 border-brand-500/30",
  ok: "bg-green-500/20 text-ok-500 border-ok-500/30",
  warn: "bg-amber-500/20 text-warn-500 border-warn-500/30",
  danger: "bg-red-500/20 text-danger-500 border-danger-500/30",
  info: "bg-sky-500/20 text-info-500 border-info-500/30",
};

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(
  ({ variant = "default", onDismiss, className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1
          px-2 py-1
          text-xs font-medium
          border rounded-sm
          transition-colors duration-fast
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="ml-1 -mr-1 hover:opacity-70 focus:outline-none focus:ring-1 focus:ring-current rounded"
            aria-label="Remove"
            type="button"
          >
            <X size={12} />
          </button>
        )}
      </span>
    );
  }
);

Pill.displayName = "Pill";

/**
 * ScorePill Component
 *
 * A specialized pill for displaying numerical scores with contextual coloring.
 * Automatically assigns color based on score value.
 *
 * @example
 * ```tsx
 * <ScorePill score={85} />
 * <ScorePill score={42} label="Confidence" />
 * ```
 */

export interface ScorePillProps extends Omit<PillProps, "variant" | "children"> {
  /**
   * The numerical score to display (0-100)
   */
  score: number;

  /**
   * Optional label to show before the score
   */
  label?: string;
}

export const ScorePill = React.forwardRef<HTMLSpanElement, ScorePillProps>(
  ({ score, label, ...props }, ref) => {
    // Determine variant based on score
    const getVariant = (value: number): PillProps["variant"] => {
      if (value >= 80) return "ok";
      if (value >= 60) return "brand";
      if (value >= 40) return "warn";
      return "danger";
    };

    const variant = getVariant(score);
    const displayScore = Math.round(score);

    return (
      <Pill ref={ref} variant={variant} {...props}>
        {label && <span>{label}:</span>}
        <span className="font-semibold">{displayScore}</span>
      </Pill>
    );
  }
);

ScorePill.displayName = "ScorePill";
