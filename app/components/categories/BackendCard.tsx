"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import LLMLogo from "@/public/logos/llm.svg";
import FileProcessingIcon from "@/public/logos/file_processing.svg";
import { useI18n } from "../../lib/i18n";

export default function BackendCard() {
  const { t } = useI18n();
  const title = t('categories')('backend');
  const items = ["Node.js", "PostgreSQL(Supabase)"];

  return (
    <CategoryCard title={title} items={items}>
      {/* Node.js logo - unify into one slot to keep spacing/transform consistent */}
      <div className="relative w-[72px] h-[72px]">
        <IconImage
          src="/logos/nodejsLight.svg"
          width={72}
          height={72}
          className="absolute inset-0 h-full w-full object-contain opacity-90 dark:hidden"
        />
        <IconImage
          src="/logos/nodejsDark.svg"
          width={72}
          height={72}
          className="absolute inset-0 h-full w-full object-contain opacity-90 hidden dark:block"
        />
      </div>
      <IconImage
        src="/logos/elephant_full.png"
        width={42}
        height={42}
      />
      <IconImage
        src="/logos/supabase.svg"
        width={42}
        height={42}
      />
    </CategoryCard>
  );
}


