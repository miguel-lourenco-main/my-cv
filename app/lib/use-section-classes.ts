/**
 * Utility function for building section class names with conditional laptop styling.
 * Allows different styling based on device type (laptop vs non-laptop).
 * 
 * @param baseClasses - Base classes that always apply to the section
 * @param isLaptop - Whether the current device is detected as a laptop
 * @param laptopClasses - Optional classes to apply when device is a laptop
 * @param nonLaptopClasses - Optional classes to apply when device is not a laptop
 * @returns Combined class string with appropriate conditional classes
 * 
 * @example
 * ```ts
 * getSectionClasses(
 *   'flex flex-col',
 *   true,
 *   'h-screen snap-center',
 *   'gap-y-12'
 * )
 * // Returns "flex flex-col h-screen snap-center"
 * ```
 */
export function getSectionClasses(
  baseClasses: string,
  isLaptop: boolean,
  laptopClasses?: string,
  nonLaptopClasses?: string
): string {
  const classes = [baseClasses];
  
  // Apply laptop-specific classes if device is a laptop
  if (isLaptop && laptopClasses) {
    classes.push(laptopClasses);
  } else if (!isLaptop && nonLaptopClasses) {
    // Apply non-laptop classes for other devices
    classes.push(nonLaptopClasses);
  }
  
  return classes.filter(Boolean).join(" ");
}

