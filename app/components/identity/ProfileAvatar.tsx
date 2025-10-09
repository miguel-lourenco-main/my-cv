"use client";

import React from "react";
import Image, { ImageProps } from "next/image";
import { motion } from "motion/react";

type ProfileAvatarProps = {
  className?: string;
  layoutId?: string;
  src?: ImageProps["src"];
  size?: number; // fallback square size
  width?: number;
  height?: number;
  alt?: string;
  imageClassName?: string;
};

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


