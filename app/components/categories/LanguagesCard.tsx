"use client";

import React from "react";
import CategoryCard from "./CategoryCard";

export default function LanguagesCard() {
  const title = "Languages";
  const items = ["TypeScript/JavaScript", "C# (.NET for Visual Studio extensions)", "HTML/CSS"];
  const iconURLs = [
    "logos/typescript.svg",
    "logos/javaScript.png",
    "logos/c_sharp.svg",
    "logos/html-5.png",
    "logos/css.png",
  ];
  
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <img
          key={src + idx}
          src={src}
          alt=""
          aria-hidden="true"
          width={42}
          height={42}
          className="opacity-90"
          loading="lazy"
          decoding="async"
        />
      ))}
    </CategoryCard>
  );
}


