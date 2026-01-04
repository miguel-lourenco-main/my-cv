"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import { useI18n } from "../../lib/i18n";

export default function TestingCard() {
  const { t } = useI18n();
  const title = t("categories")("testing");

  const items = [
    "Playwright (E2E)",
    "Regression checks",
    "Test automation in CI",
    "Stable, repeatable QA flows",
  ];

  return (
    <CategoryCard title={title} items={items}>
      <IconImage src="/logos/playwright.svg" width={56} height={56} />
    </CategoryCard>
  );
}

