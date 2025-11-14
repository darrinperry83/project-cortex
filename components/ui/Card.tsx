"use client";

import React from "react";

/**
 * Card Component
 *
 * A versatile container component with consistent padding, borders, and shadow.
 * Provides a clean surface for grouping related content.
 *
 * @example
 * ```tsx
 * <Card>
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * <Card variant="bordered" padding="lg">
 *   <CardHeader>
 *     <h3>Project Details</h3>
 *   </CardHeader>
 *   <CardContent>
 *     Main content area
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the card
   * @default "default"
   */
  variant?: "default" | "bordered" | "flat";

  /**
   * Padding size
   * @default "md"
   */
  padding?: "none" | "sm" | "md" | "lg";

  /**
   * Whether the card should be interactive (hover effect)
   * @default false
   */
  interactive?: boolean;
}

const variantStyles = {
  default: "bg-surface border border-border shadow-sm",
  bordered: "bg-surface border-2 border-border",
  flat: "bg-surface/50",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      interactive = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-md
          transition-all duration-fast ease-emph
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${interactive ? "hover:border-neutral-600 hover:shadow-md cursor-pointer" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * CardHeader Component
 *
 * A header section for cards with consistent spacing.
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", ...props }, ref) => {
    return <div ref={ref} className={`mb-4 ${className}`} {...props} />;
  }
);

CardHeader.displayName = "CardHeader";

/**
 * CardContent Component
 *
 * The main content area of a card.
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", ...props }, ref) => {
    return <div ref={ref} className={className} {...props} />;
  }
);

CardContent.displayName = "CardContent";

/**
 * CardFooter Component
 *
 * A footer section for cards with consistent spacing and alignment.
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", ...props }, ref) => {
    return <div ref={ref} className={`mt-4 flex items-center gap-2 ${className}`} {...props} />;
  }
);

CardFooter.displayName = "CardFooter";
