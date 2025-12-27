"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import NextLogo from "@/public/logos/nextjs.svg";
import { useI18n } from "../../lib/i18n";

/**
 * Frontend category card component.
 * Displays frontend technologies and frameworks with translatable title.
 * 
 * @example
 * ```tsx
 * <FrontendCard />
 * ```
 */
export default function FrontendCard() {
  const { t } = useI18n();
  const title = t('categories')('frontend');
  const items = ["React", "Next.js (App Router)", "Tailwind CSS", "Shadcn/UI", "Figma"];
  const iconURLs = [
    "/logos/react.svg",
    "/logos/nextjs.svg",
    "/logos/tailwind_css.svg",
    "/logos/shadcn.png",
    "/logos/figma.svg",
  ];
  
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <IconImage key={src + idx} src={src} width={idx === 4 ? 32 : 42} height={idx === 4 ? 32 : 42} />
      ))}
    </CategoryCard>
  );
}


