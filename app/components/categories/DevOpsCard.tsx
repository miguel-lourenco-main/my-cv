"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
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
        <IconImage key={src + idx} src={src} width={idx === 0 ? 42 : 56} height={idx === 0 ? 42 : 56} />
      ))}
    </CategoryCard>
  );
}


