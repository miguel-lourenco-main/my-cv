"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import { useI18n } from "../../lib/i18n";

export default function AutomationCard() {
  const { t } = useI18n();
  const title = t("categories")("automation");

  const items = [
    "n8n workflows",
    "Webhooks",
    "API integrations",
    "Operational automation",
  ];

  return (
    <CategoryCard title={title} items={items}>
      <div className="relative w-[120px] h-[33px]">
        <IconImage
          src="/logos/n8n_pink+white_logo.svg"
          width={576}
          height={160}
          className="absolute inset-0 h-full w-full object-contain "
        />
      </div>
    </CategoryCard>
  );
}

