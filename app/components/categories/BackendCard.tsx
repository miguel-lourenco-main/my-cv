"use client";

import React, { useMemo } from "react";
import CategoryCard from "./CategoryCard";
import LLMLogo from "@/public/logos/llm.svg";
import FileProcessingIcon from "@/public/logos/file_processing.svg";
import { useTheme } from "@/app/lib/theme-provider";

export default function BackendCard() {
  const title = "Backend";
  const items = ["Node.js", "REST", "File processing", "RAG/LLM integration"];

  const { theme } = useTheme();
  
  const iconURLs = useMemo(() => {
    return [
      theme === "light" ? "/logos/nodejsLight.svg" : "/logos/nodejsDark.svg",
      "/logos/rest.png",
    ]
  }, [theme]);

  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <img key={src + idx} src={src} alt="" aria-hidden="true" width={72} height={72} className="opacity-90" loading="lazy" decoding="async" />
      ))}
      <FileProcessingIcon className="size-10 text-slate-900 dark:text-white" />
      <LLMLogo className="h-14 w-14 text-slate-900 dark:text-white [&_*]:fill-current" />
    </CategoryCard>
  );
}


