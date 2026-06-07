"use client";

import Image from "next/image";
import { ContactButton } from "./ContactButton";

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
    <ContactButton kind="gitlab" className={className} href={href}>
      <Image
        src="/logos/gitlab-logo-500.svg"
        alt="GitLab"
        width={width}
        height={height}
      />
    </ContactButton>
  );
}
