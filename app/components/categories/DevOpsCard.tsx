"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import { useI18n } from "../../lib/i18n";

export default function DevOpsCard() {
  const { t } = useI18n();
  const title = t('categories')('devops');

  const items = [
    "GitLab",
    "CI/CD pipelines",
    "GitLab Pages",
    "Vercel",
    "Environment/config management",
  ];

  return (
    <CategoryCard title={title} items={items}>
      <IconImage src="/logos/gitlab-logo-500.svg" width={42} height={42} />

      {/* Vercel: swap icon based on theme */}
      <div className="relative w-[40px] h-[40px]">
        <IconImage
          src="/logos/vercel-icon-light.svg"
          width={42}
          height={42}
          className="absolute inset-0 h-full w-full object-contain opacity-90 dark:hidden"
        />
        <IconImage
          src="/logos/vercel-icon-dark.svg"
          width={42}
          height={42}
          className="absolute inset-0 h-full w-full object-contain opacity-90 hidden dark:block"
        />
      </div>
    </CategoryCard>
  );
}


