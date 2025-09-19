"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import VercelLogo from "@/public/logos/vercel.svg";

export default function ToolingCard() {
  const title = "Tooling";
  const items = ["Git", "Linux", "Bash", "Pragmatic use of open‑source and AI tooling"];
  const iconURLs = [
    "/logos/git.svg",
    "/logos/Tux.svg",
    "/logos/bash.svg",
  ];
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <img key={src + idx} src={src} alt="" aria-hidden="true" width={56} height={56} className="opacity-90" loading="lazy" decoding="async" />
      ))}
      <VercelLogo className="h-14 w-14 text-slate-900 dark:text-white [&_*]:fill-current" />
    </CategoryCard>
  );
}


