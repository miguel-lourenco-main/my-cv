"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import CiCdIcon from "@/public/logos/ci_cd.svg";
import EnvConfigIcon from "@/public/logos/environment_config.svg";
import { useI18n } from "../../lib/i18n";

export default function DevOpsCard() {
  const { t } = useI18n();
  const title = t('categories')('devops');
  const items = ["GitLab", "CI/CD pipelines", "GitLab Pages", "Environment/config management", "Unit test automation"];
  const iconURLs = [
    "/logos/gitlab-logo-500.svg",
    "/logos/playwright.svg",
  ];
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <img key={src + idx} src={src} alt="" aria-hidden="true" width={idx === 0 ? 42 : 56} height={idx === 0 ? 42 : 56} className="opacity-90" loading="lazy" decoding="async" />
      ))}
      <CiCdIcon className="size-12 text-slate-900 dark:text-white" />
      <EnvConfigIcon className="size-12 text-slate-900 dark:text-white" />
    </CategoryCard>
  );
}


