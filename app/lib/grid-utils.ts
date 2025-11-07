/**
 * Utility functions for generating grid class names
 */

/**
 * Generates responsive grid class names with conditional spacing
 * @param isLaptop - Whether the device is a laptop
 * @param additionalClasses - Additional classes to append
 * @returns Grid class string
 */
export function getGridClasses(additionalClasses: string = ""): string {
  const baseClasses = "grid grid-cols-1 md:grid-cols-2";
  const gapClasses = "gap-12";
  const classes = [baseClasses, gapClasses, additionalClasses].filter(Boolean);
  return classes.join(" ");
}

/**
 * Generates grid classes with margin bottom
 * @param isLaptop - Whether the device is a laptop
 * @returns Grid class string with margin bottom
 */
export function getGridClassesWithMargin(): string {
  const marginClasses = "mb-12";
  return getGridClasses(marginClasses);
}

