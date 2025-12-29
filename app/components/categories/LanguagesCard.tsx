"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import { useI18n } from "@/app/lib/i18n";

/**
 * Languages category card component.
 * Displays programming languages and related technologies.
 * 
 * @example
 * ```tsx
 * <LanguagesCard />
 * ```
 */
export default function LanguagesCard() {
  const { t } = useI18n();
  const title = t("categories")("languages");
  const items = ["TypeScript/JavaScript", "HTML/CSS", "C#", "SQL"];
  const iconURLs = [
    "/logos/typescript.svg",
    "/logos/javaScript.png",
    "/logos/html-5.png",
    "/logos/css.png",
    "/logos/c_sharp.svg",
    "/logos/sql.png",
  ];
  
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <IconImage key={src + idx} src={src} width={idx === 5 ? 64 : 42} height={idx === 5 ? 64 : 42}/>
      ))}
    </CategoryCard>
  );
}


