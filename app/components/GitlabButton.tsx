"use client";

import Image from "next/image";
import BaseButton from "./Button";

/**
 * GitLab button component with GitLab logo.
 * Uses orange theme and links to GitLab profile.
 * 
 * @param props - GitlabButton component props
 * @param props.className - Additional CSS classes
 * @param props.width - Logo width in pixels (required)
 * @param props.height - Logo height in pixels (required)
 * @param props.href - GitLab profile URL (default: personal GitLab)
 * 
 * @example
 * ```tsx
 * <GitlabButton width={22} height={22} />
 * ```
 */
export default function GitlabButton({
  className,
  width,
  height,
  href = "https://gitlab.com/miguel-lourenco-main",
}: {
  className?: string;
  width: number;
  height: number;
  href?: string;
}) {
  return (
    <BaseButton href={href} className={className} theme="orange">
      <Image 
        src="/logos/gitlab-logo-500.svg" 
        alt="GitLab" 
        width={width} 
        height={height}
      />
    </BaseButton>
  );
}