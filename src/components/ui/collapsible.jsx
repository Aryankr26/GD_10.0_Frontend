"use client";

import * as React from "react";

/**
 * Minimal, predictable Collapsible
 * - No prop cloning magic
 * - No animation traps
 * - No event interception
 * - Safe with shadcn / cards / tabs
 */

function Collapsible({ open, children }) {
  return (
    <div data-state={open ? "open" : "closed"} className="w-full">
      {children}
    </div>
  );
}

function CollapsibleTrigger({ onClick, children, ...props }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      className="cursor-pointer select-none"
      {...props}
    >
      {children}
    </div>
  );
}

function CollapsibleContent({ open, children }) {
  if (!open) return null;
  return <div>{children}</div>;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
