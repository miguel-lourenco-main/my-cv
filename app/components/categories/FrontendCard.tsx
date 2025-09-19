"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import NextLogo from "@/public/logos/nextjs.svg";

export default function FrontendCard() {
  const title = "Frontend";
  const items = ["React", "Next.js (App Router)", "Tailwind CSS", "shadcn/ui", "Figma", "Vercel v0"];
  const iconURLs = [
    "/logos/react.svg",
    "/logos/tailwind_css.svg",
    "/logos/shadcn.png",
    "/logos/figma.svg",
  ];
  
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <img key={src + idx} src={src} alt="" aria-hidden="true" width={56} height={56} className="opacity-90" loading="lazy" decoding="async" />
      ))}
      <NextLogo className="h-14 w-14 text-slate-900 dark:text-white" />
    </CategoryCard>
  );
}


