"use client";

import React from "react";
import CategoryCard from "./CategoryCard";
import IconImage from "./IconImage";
import { useI18n } from "../../lib/i18n";

export default function AICard() {
  const { t } = useI18n();
  const title = t("categories")("ai");

  const items = [
    "OpenAI (LLM APIs)",
    "ElevenLabs (TTS)",
    "Prompt + tool orchestration",
    "AI-assisted product flows",
  ];

  return (
    <CategoryCard title={title} items={items}>
      <IconImage src="/logos/openai.svg" width={48} height={48} className=" dark:invert" />
      <IconImage
        src="/logos/elevenlabs-logo-black.svg"
        width={42}
        height={42}
        className=" dark:invert"
      />
    </CategoryCard>
  );
}

