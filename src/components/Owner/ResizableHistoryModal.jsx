// src/components/Owner/ResizableHistoryModal.jsx
"use client";

import { useEffect } from "react";
import { XIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function ResizableHistoryModal({
  isOpen,
  onClose,
  title,
  children,
  defaultWidth = 900,
  defaultHeight = 600,
  contentClassName = "",
  contentStyle,
}) {
  // prevent background scroll
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent
        style={{
          "--history-modal-w": typeof defaultWidth === "number" ? `${defaultWidth}px` : defaultWidth,
          "--history-modal-h": typeof defaultHeight === "number" ? `${defaultHeight}px` : defaultHeight,
          resize: "both",
          ...contentStyle,
        }}
        className={`p-0 overflow-hidden w-[var(--history-modal-w)] h-[var(--history-modal-h)] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] [&_[data-slot=dialog-close]]:hidden ${contentClassName}`}
      >
        <div className="flex h-full flex-col">
          <DialogHeader className="relative border-b px-4 py-2">
            <DialogTitle>{title}</DialogTitle>

            <DialogClose
              className="absolute right-3 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Close"
            >
              <XIcon className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
