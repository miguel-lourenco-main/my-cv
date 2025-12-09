"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";

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
  const title = "Languages";
  const items = ["TypeScript/JavaScript", "C# (.NET for Visual Studio extensions)", "HTML/CSS"];
  const iconURLs = [
    "/logos/typescript.svg",
    "/logos/javaScript.png",
    "/logos/c_sharp.svg",
    "/logos/html-5.png",
    "/logos/css.png",
  ];
  
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <IconImage key={src + idx} src={src} />
      ))}
    </CategoryCard>
  );
}


