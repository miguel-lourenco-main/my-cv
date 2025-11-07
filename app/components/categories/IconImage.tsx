"use client";

import React from "react";

interface IconImageProps {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
}

/**
 * Reusable icon image component with standardized attributes
 * for consistent loading, accessibility, and performance
 */
export default function IconImage({
  src,
  width = 42,
  height = 42,
  alt = "",
  className = "opacity-90",
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

