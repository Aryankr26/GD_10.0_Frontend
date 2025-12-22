import * as React from "react";
import { cn } from "./utils";

/**
 * Card primitives
 * - Backward compatible
 * - Click-safe
 * - A11y-safe
 */

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground rounded-xl border flex flex-col pointer-events-auto",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn("px-6 pt-6", className)}
      {...props}
    />
  );
}

/**
 * IMPORTANT:
 * - Never render empty heading
 * - Fixes jsx-a11y/heading-has-content
 */
function CardTitle({ className, children }) {
  if (!children) return null;

  return (
    <h4
      data-slot="card-title"
      className={cn("font-semibold leading-none", className)}
    >
      {children}
    </h4>
  );
}

/**
 * RESTORED for backward compatibility
 */
function CardDescription({ className, children }) {
  if (!children) return null;

  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
    >
      {children}
    </p>
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6 pointer-events-auto", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("px-6 pb-6 pt-4 border-t", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription, // 🔥 REQUIRED by many files
  CardContent,
  CardFooter,
};
