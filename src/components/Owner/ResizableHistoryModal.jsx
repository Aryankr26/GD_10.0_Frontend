// src/components/Owner/ResizableHistoryModal.jsx
"use client";

import { useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { Dialog, DialogClose, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "../ui/dialog";

export function ResizableHistoryModal({
  isOpen,
  onClose,
  title,
  children,
  defaultWidth = 560,
  defaultHeight = 520,
  contentClassName = "",
  contentStyle,
}) {
  // prevent background scroll
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogPortal>
        <DialogOverlay
          className="history-modal-overlay"
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        />

        <DialogPrimitive.Content
          style={{
            "--history-modal-w": typeof defaultWidth === "number" ? `${defaultWidth}px` : defaultWidth,
            "--history-modal-h": typeof defaultHeight === "number" ? `${defaultHeight}px` : defaultHeight,
            ...contentStyle,
          }}
          className={`
            history-modal-content
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            overflow-hidden rounded-lg border bg-background p-0 shadow-lg
            ${contentClassName}
          `}
        >
          <div className="flex h-full flex-col">
            <DialogHeader className="shrink-0 border-b px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="min-w-0 truncate">{title}</DialogTitle>
                <DialogClose
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Close"
                >
                  <XIcon className="h-4 w-4" />
                </DialogClose>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
