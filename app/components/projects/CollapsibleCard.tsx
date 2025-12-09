"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface CollapsibleCardProps {
  title: string;
  defaultOpen?: boolean;
  scrollable?: boolean;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onToggle?: (nextOpen: boolean) => void;
}

/**
 * Collapsible card component that can be minimized/expanded.
 * Used for nested content sections within the expanded project card.
 */
export function CollapsibleCard({ 
  title,
  defaultOpen = true,
  scrollable = false,
  children,
  className,
  open,
  onToggle,
}: CollapsibleCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.(!isOpen);
    } else {
      setInternalOpen(!isOpen);
    }
  };

  return (
    <div
      className={cn(
        "border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 overflow-hidden flex flex-col",
        isOpen ? "flex-1" : "",
        className
      )}
    >
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors shrink-0"
        aria-expanded={isOpen}
      >
        <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 text-left">
          {title}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="size-5 text-neutral-600 dark:text-neutral-400 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={`overflow-hidden flex-1 ${scrollable ? 'flex flex-col' : ''}`}
          >
            <div className={`p-4 pt-0 ${scrollable ? 'max-h-[400px] overflow-y-auto' : ''}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

