"use client";

import React from "react";

/**
 * Props for the IconImage component.
 */
interface IconImageProps {
  /** Image source path */
  src: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Alt text for accessibility */
  alt?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable icon image component with standardized attributes.
 * Provides consistent loading, accessibility, and performance optimizations.
 * Uses lazy loading and async decoding for better performance.
 * 
 * @param props - IconImage component props
 * @param props.src - Image source path
 * @param props.width - Image width (default: 42px)
 * @param props.height - Image height (default: 42px)
 * @param props.alt - Alt text (default: empty string, aria-hidden used)
 * @param props.className - Additional CSS classes (default: "")
 * 
 * @example
 * ```tsx
 * <IconImage src="/logos/react.svg" width={42} height={42} />
 * ```
 */
export default function IconImage({
  src,
  width = 42,
  height = 42,
  alt = "",
  className = "",
}: IconImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden="true"
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

