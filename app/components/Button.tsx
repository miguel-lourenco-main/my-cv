"use client";

import { cn } from "../lib/utils";
import { useState } from "react";

export type ButtonTheme = 
  | "orange" 
  | "blue" 
  | "green" 
  | "purple" 
  | "red" 
  | "gray" 
  | "default";

export interface BaseButtonProps {
  className?: string;
  href?: string;
  children: React.ReactNode;
  theme?: ButtonTheme;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

/**
 * Base classes shared across all themes
 */
const baseThemeClasses = "text-slate-800 font-bold dark:text-slate-200";

/**
 * Theme styles - generated programmatically but with explicit class names
 * to ensure Tailwind CSS can detect them at build time
 */
const themeStyles: Record<ButtonTheme, { base: string; clicked: string }> = {
  orange: {
    base: baseThemeClasses,
    clicked: "scale-95 bg-orange-50 dark:bg-orange-900/20"
  },
  blue: {
    base: baseThemeClasses,
    clicked: "scale-95 bg-blue-50 dark:bg-blue-900/20"
  },
  green: {
    base: baseThemeClasses,
    clicked: "scale-95 bg-green-50 dark:bg-green-900/20"
  },
  purple: {
    base: baseThemeClasses,
    clicked: "scale-95 bg-purple-50 dark:bg-purple-900/20"
  },
  red: {
    base: baseThemeClasses,
    clicked: "scale-95 bg-red-50 dark:bg-red-900/20"
  },
  gray: {
    base: baseThemeClasses,
    clicked: "scale-95 bg-gray-50 dark:bg-gray-900/20"
  },
  default: {
    base: baseThemeClasses,
    clicked: "scale-95 bg-slate-50 dark:bg-slate-900/20"
  }
};

export default function BaseButton({
  className,
  href,
  children,
  theme = "orange",
  onClick,
  target = "_blank",
  rel = "noopener noreferrer",
}: BaseButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick?.();
    
    // Reset feedback after 2 seconds
    setTimeout(() => {
      setIsClicked(false);
    }, 2000);
  };

  const themeStyle = themeStyles[theme];

  return (
    <a
      href={href}
      className={cn(
        "flex items-center rounded-md px-4 py-2 space-x-2 transition-all duration-200 hover:scale-125 active:scale-95",
        themeStyle.base,
        isClicked && themeStyle.clicked,
        className
      )}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

// Legacy component for backward compatibility
export function RefButton({
  className,
  href = "https://gitlab.com/miguel-lourenco-main",
  children,
}: {
  className?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <BaseButton href={href} className={className} theme="orange">
      {children}
    </BaseButton>
  );
}