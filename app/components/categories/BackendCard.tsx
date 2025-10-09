"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import LLMLogo from "@/public/logos/llm.svg";
import FileProcessingIcon from "@/public/logos/file_processing.svg";
import { useI18n } from "../../lib/i18n";

export default function BackendCard() {
  const { t } = useI18n();
  const title = t('categories')('backend');
  const items = ["Node.js", "REST", "File processing", "RAG/LLM integration"];

  return (
    <CategoryCard title={title} items={items}>
      {/* Node.js logo - unify into one slot to keep spacing/transform consistent */}
      <div className="relative w-[72px] h-[72px]">
        <img
          src="/logos/nodejsLight.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain opacity-90 dark:hidden"
          loading="lazy"
          decoding="async"
        />
        <img
          src="/logos/nodejsDark.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain opacity-90 hidden dark:block"
          loading="lazy"
          decoding="async"
        />
      </div>
      {/* REST icon */}
      <img
        src="/logos/rest.png"
        alt=""
        aria-hidden="true"
        width={72}
        height={72}
        className="opacity-90"
        loading="lazy"
        decoding="async"
      />
      <FileProcessingIcon className="size-10 text-slate-900 dark:text-white" />
      <LLMLogo className="h-14 w-14 text-slate-900 dark:text-white [&_*]:fill-current" />
    </CategoryCard>
  );
}


