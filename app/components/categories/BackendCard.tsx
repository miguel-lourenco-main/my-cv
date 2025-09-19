"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import LLMLogo from "@/public/logos/llm.svg";

export default function BackendCard() {
  const title = "Backend";
  const items = ["Node.js", "REST", "File processing", "RAG/LLM integration"];
  const iconURLs = [
    "/logos/nodejsLight.svg",
    "/logos/rest.png",
    "/logos/file_processing.svg",
  ];
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <img key={src + idx} src={src} alt="" aria-hidden="true" width={56} height={56} className="opacity-90" loading="lazy" decoding="async" />
      ))}
      <LLMLogo className="h-14 w-14 text-slate-900 dark:text-white [&_*]:fill-current" />
    </CategoryCard>
  );
}


