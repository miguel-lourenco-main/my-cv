/**
 * Utility function for building section classes with conditional laptop styling
 */
export function getSectionClasses(
  baseClasses: string,
  isLaptop: boolean,
  laptopClasses?: string,
  nonLaptopClasses?: string
): string {
  const classes = [baseClasses];
  
  if (isLaptop && laptopClasses) {
    classes.push(laptopClasses);
  } else if (!isLaptop && nonLaptopClasses) {
    classes.push(nonLaptopClasses);
  }
  
  return classes.filter(Boolean).join(" ");
}

