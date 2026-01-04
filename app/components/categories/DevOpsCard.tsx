"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import VercelLogoWithCircle from "./VercelLogoWithCircle";
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
      <VercelLogoWithCircle size={42} />
    </CategoryCard>
  );
}


