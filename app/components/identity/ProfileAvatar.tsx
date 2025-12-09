"use client";

import React from "react";
import Image, { ImageProps } from "next/image";
import { motion } from "motion/react";

/**
 * Props for the ProfileAvatar component.
 */
type ProfileAvatarProps = {
  /** Additional CSS classes for the container */
  className?: string;
  /** Layout ID for Framer Motion shared element transitions */
  layoutId?: string;
  /** Image source path */
  src?: ImageProps["src"];
  /** Fallback square size when width/height not provided */
  size?: number;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Alt text for the image */
  alt?: string;
  /** CSS classes for the image element */
  imageClassName?: string;
};

/**
 * Profile avatar component displaying a profile picture.
 * Supports shared element transitions via Framer Motion layoutId.
 * Uses Next.js Image component for optimized loading.
 * 
 * @param props - ProfileAvatar component props
 * @param props.className - Container CSS classes
 * @param props.layoutId - Layout ID for shared element transitions (default: "intro-avatar")
 * @param props.src - Image source (default: "/placeholder.svg")
 * @param props.size - Fallback size (default: 160)
 * @param props.width - Image width
 * @param props.height - Image height
 * @param props.alt - Alt text (default: "Profile picture")
 * @param props.imageClassName - Image CSS classes (default: "rounded-full")
 * 
 * @example
 * ```tsx
 * <ProfileAvatar layoutId="intro-avatar" width={360} height={216} />
 * ```
 */
export default function ProfileAvatar({
  className,
  layoutId = "intro-avatar",
  src = "/placeholder.svg",
  size = 160,
  width,
  height,
  alt = "Profile picture",
  imageClassName = "rounded-full",
}: ProfileAvatarProps) {
  return (
    <motion.div layoutId={layoutId} className={className}>
      <Image
        src={src}
        alt={alt}
        width={width ?? size}
        height={height ?? size}
        className={imageClassName}
        priority
      />
    </motion.div>
  );
}


