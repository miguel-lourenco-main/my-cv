"use client";

import { Moon, Sun } from "lucide-react";
import type { ProjectScreenshotMode } from "./project-images";

export function ScreenshotModeButton({
  mode,
  onModeChange,
  getLabel,
}: {
  mode: ProjectScreenshotMode;
  onModeChange: (mode: ProjectScreenshotMode) => void;
  getLabel: (key: string) => string;
}) {
  const title =
    mode === "light" ? getLabel("screenshots.light") : getLabel("screenshots.dark");

  return (
    <button
      type="button"
      onClick={() => onModeChange(mode === "light" ? "dark" : "light")}
      className="inline-flex items-center justify-center size-10 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-900 transition-colors shadow-md"
      title={title}
      aria-label={title}
    >
      {mode === "light" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
