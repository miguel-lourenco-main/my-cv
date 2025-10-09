"use client";

import Image from "next/image";
import BaseButton from "./Button";

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