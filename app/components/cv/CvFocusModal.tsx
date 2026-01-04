"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "../shadcn/button";

export default function CvFocusModal({
  open,
  onClose,
  cvPath,
  title,
}: {
  open: boolean;
  onClose: () => void;
  cvPath: string;
  title: string;
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // Focus close button for accessibility
    closeBtnRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      onTouchStart={(e) => {
        // Only close if touching the backdrop itself, not the content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="mx-auto h-full w-full max-w-6xl px-3 sm:px-6 py-3 sm:py-6"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-xl">
          {/* Close button header - always visible, especially important on mobile */}
          <div className="flex items-center justify-end p-2 sm:p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <Button
              ref={closeBtnRef}
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="h-9 w-9"
            >
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-0">
            <iframe
              title={title}
              src={cvPath}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

