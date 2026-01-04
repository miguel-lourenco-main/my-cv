"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import VercelLogoWithCircle from "./VercelLogoWithCircle";
import { useI18n } from "../../lib/i18n";

export default function ToolingCard() {
  const { t } = useI18n();
  const title = t('categories')('tooling');
  const items = ["Git", "Linux", "Bash", "Pragmatic use of open‑source and AI tooling"];
  const iconURLs = [
    "/logos/git.svg",
    "/logos/Tux.svg",
    "/logos/bash.svg",
  ];
  return (
    <CategoryCard title={title} items={items}>
      {iconURLs.map((src, idx) => (
        <IconImage key={src + idx} src={src} />
      ))}
      <VercelLogoWithCircle size={96} />
    </CategoryCard>
  );
}


