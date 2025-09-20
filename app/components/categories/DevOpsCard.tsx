"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import CiCdIcon from "@/public/logos/ci_cd.svg";
import EnvConfigIcon from "@/public/logos/environment_config.svg";

export default function DevOpsCard() {
  const title = "DevOps";
  const items = ["GitLab", "CI/CD pipelines", "GitLab Pages", "Environment/config management", "Unit test automation integrated into CI with Playwright"];
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
      <EnvConfigIcon className="size-14 text-slate-900 dark:text-white" />
    </CategoryCard>
  );
}


