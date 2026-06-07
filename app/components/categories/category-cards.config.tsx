"use client";

import type { ReactNode } from "react";
import type { TechStackDemoCardId } from "@/app/components/TechStackDemo";
import IconImage from "./IconImage";
import VercelLogoWithCircle from "./VercelLogoWithCircle";

type CategoryCardConfig = {
  key: string;
  titleKey: string;
  items: string[];
  demoCardId: TechStackDemoCardId;
  renderIcons: () => ReactNode;
};

const icon = (src: string, width = 42, height = 42, className?: string) => (
  <IconImage src={src} width={width} height={height} className={className} />
);

export const CATEGORY_CARDS: CategoryCardConfig[] = [
  {
    key: "frontend",
    titleKey: "frontend",
    demoCardId: "frontend",
    items: ["React", "Next.js (App Router)", "Tailwind CSS", "Shadcn/UI", "Figma"],
    renderIcons: () =>
      [
        "/logos/react.svg",
        "/logos/nextjs.svg",
        "/logos/tailwind_css.svg",
        "/logos/shadcn.png",
        "/logos/figma.svg",
      ].map((src, idx) => (
        <IconImage
          key={src}
          src={src}
          width={idx === 4 ? 32 : 42}
          height={idx === 4 ? 32 : 42}
        />
      )),
  },
  {
    key: "backend",
    titleKey: "backend",
    demoCardId: "backend",
    items: ["Node.js", "PostgreSQL(Supabase)"],
    renderIcons: () => (
      [
        <div className="relative w-[72px] h-[72px]">
          {icon(
            "/logos/nodejsDark.svg",
            72,
            72,
            "absolute inset-0 h-full w-full object-contain"
          )}
        </div>,
        icon("/logos/elephant_full.png"),
        icon("/logos/supabase.svg")
      ]
    ),
  },
  {
    key: "devops",
    titleKey: "devops",
    demoCardId: "devops",
    items: [
      "GitLab",
      "CI/CD pipelines",
      "GitLab Pages",
      "Vercel",
      "Environment/config management",
    ],
    renderIcons: () => (
      [
        icon("/logos/gitlab-logo-500.svg"),
        <VercelLogoWithCircle size={42} />
      ]
    ),
  },
  {
    key: "testing",
    titleKey: "testing",
    demoCardId: "testing",
    items: ["Playwright (E2E)", "Test automation in CI"],
    renderIcons: () => icon("/logos/playwright.svg", 56, 56),
  },
  {
    key: "automation",
    titleKey: "automation",
    demoCardId: "automation",
    items: ["n8n workflows", "Webhooks", "API integrations", "Operational automation"],
    renderIcons: () => (
      <div className="relative w-[120px] h-[33px]">
        {icon(
          "/logos/n8n_pink+white_logo.svg",
          576,
          160,
          "absolute inset-0 h-full w-full object-contain"
        )}
      </div>
    ),
  },
  {
    key: "ai",
    titleKey: "ai",
    demoCardId: "ai",
    items: [
      "OpenAI (LLM APIs)",
      "ElevenLabs (TTS)",
      "Prompt + tool orchestration",
      "AI-assisted product flows",
    ],
    renderIcons: () => (
      [
        icon("/logos/openai.svg", 48, 48, "dark:invert"),
        icon("/logos/elevenlabs-logo-black.svg", 42, 42, "dark:invert"),
      ]
    ),
  },
];
