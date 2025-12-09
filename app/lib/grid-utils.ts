/**
 * Utility functions for generating responsive grid class names.
 * Provides consistent grid layouts across the application.
 */

/**
 * Generates responsive grid class names with configurable spacing.
 * Creates a 1-column grid on mobile that becomes 2-column on medium screens and up.
 * 
 * @param additionalClasses - Optional additional Tailwind classes to append
 * @returns Combined grid class string
 * 
 * @example
 * ```ts
 * getGridClasses() // Returns "grid grid-cols-1 md:grid-cols-2 gap-12"
 * getGridClasses("mb-8") // Returns "grid grid-cols-1 md:grid-cols-2 gap-12 mb-8"
 * ```
 */
export function getGridClasses(additionalClasses: string = ""): string {
  const baseClasses = "grid grid-cols-1 md:grid-cols-2";
  const gapClasses = "gap-12";
  const classes = [baseClasses, gapClasses, additionalClasses].filter(Boolean);
  return classes.join(" ");
}

/**
 * Generates grid classes with bottom margin included.
 * Convenience function for grids that need spacing below them.
 * 
 * @returns Grid class string with margin bottom
 * 
 * @example
 * ```ts
 * getGridClassesWithMargin() // Returns "grid grid-cols-1 md:grid-cols-2 gap-12 mb-12"
 * ```
 */
export function getGridClassesWithMargin(): string {
  const marginClasses = "mb-12";
  return getGridClasses(marginClasses);
}

