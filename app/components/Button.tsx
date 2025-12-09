"use client";

import { cn } from "../lib/utils";
import { useState } from "react";

/**
 * Available button theme color options.
 */
export type ButtonTheme = 
  | "orange" 
  | "blue" 
  | "green" 
  | "purple" 
  | "red" 
  | "gray" 
  | "default";

/**
 * Props for the BaseButton component.
 */
export interface BaseButtonProps {
  /** Additional CSS classes */
  className?: string;
  /** Link URL (renders as anchor tag if provided) */
  href?: string;
  /** Button content */
  children: React.ReactNode;
  /** Color theme for the button */
  theme?: ButtonTheme;
  /** Click handler function */
  onClick?: () => void;
  /** Link target attribute */
  target?: string;
  /** Link rel attribute */
  rel?: string;
}

/**
 * Base classes shared across all button themes.
 */
const baseThemeClasses = "text-slate-800 font-bold dark:text-slate-200";

/**
 * Theme styles mapping for each button theme.
 * Includes base styles and clicked state styles.
 * Class names are explicit to ensure Tailwind CSS can detect them at build time.
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

/**
 * Base button component with theme support and click feedback.
 * Renders as an anchor tag if href is provided, otherwise as a button.
 * Features visual feedback on click with theme-specific styling.
 * 
 * @param props - BaseButton component props
 * @param props.className - Additional CSS classes
 * @param props.href - Link URL (renders as anchor if provided)
 * @param props.children - Button content
 * @param props.theme - Color theme (default: "orange")
 * @param props.onClick - Click handler function
 * @param props.target - Link target (default: "_blank")
 * @param props.rel - Link rel attribute (default: "noopener noreferrer")
 * 
 * @example
 * ```tsx
 * <BaseButton href="https://example.com" theme="blue" onClick={() => console.log('clicked')}>
 *   Click Me
 * </BaseButton>
 * ```
 */
export default function BaseButton({
  className,
  href,
  children,
  theme = "orange",
  onClick,
  target = "_blank",
  rel = "noopener noreferrer",
}: BaseButtonProps) {
  // Track click state for visual feedback
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick?.();
    
    // Reset visual feedback after 2 seconds
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

/**
 * Legacy button component for backward compatibility.
 * Wraps BaseButton with default GitLab link and orange theme.
 * 
 * @param props - RefButton component props
 * @param props.className - Additional CSS classes
 * @param props.href - Link URL (default: GitLab profile)
 * @param props.children - Button content
 * 
 * @deprecated Use BaseButton directly instead
 */
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