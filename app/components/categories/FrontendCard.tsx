"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import NextLogo from "@/public/logos/nextjs.svg";
import { useI18n } from "../../lib/i18n";

export default function FrontendCard() {
  const { t } = useI18n();
  const title = t('categories')('frontend');
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
        <img key={src + idx} src={src} alt="" aria-hidden="true" width={idx === 3 ? 28 : 42} height={idx === 3 ? 28 : 42} className="opacity-90" loading="lazy" decoding="async" />
      ))}
      <NextLogo className="size-12 text-slate-900 dark:text-white" />
    </CategoryCard>
  );
}


