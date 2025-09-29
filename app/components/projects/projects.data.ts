import { Project } from "./projects.types";

// Temporary seed data; links and images will be updated later by the user.
export const projects: Project[] = [
  {
    id: "ui-components",
    title: "UI Components Playground",
    description:
      "A playground for custom UI components with interactions and patterns.",
    images: [
      "/projects/ui_components_preview.png",
      "/placeholder.svg",
    ],
    websiteUrl: "https://ui-components-5218c2.gitlab.io/",
    gitlabUrl: "https://gitlab.com/replace-later/ui-components",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
    ],
    experience:
      "Built a component lab and refined design tokens, motion, and accessibility.",
  },
  {
    id: "sonora",
    title: "Sonora",
    description:
      "Storytelling app for children with LLM-powered narration voices.",
    images: [
      "/projects/sonora_preview.png",
      "/placeholder.svg",
    ],
    websiteUrl: "https://sonora-d09e63.gitlab.io/",
    gitlabUrl: "https://gitlab.com/replace-later/sonora",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
    ],
    experience:
      "Worked on voice pipeline integration and kid-friendly UX with parental controls.",
  },
  {
    id: "agentic-hub",
    title: "Agentic Hub",
    description:
      "A hub to invest, hire, and create agentic systems.",
    images: [
      "/projects/agentic_hub_preview.png",
      "/placeholder.svg",
    ],
    websiteUrl: "https://agentichub-64abdc.gitlab.io",
    gitlabUrl: "https://gitlab.com/replace-later/agentic-hub",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
    ],
    experience:
      "Designed modular agent architecture and marketplace interactions.",
  },
  {
    id: "cash-register",
    title: "Cash Register",
    description:
      "A simple cash register with add/remove items and totals.",
    images: [
      "/projects/cash_register_preview.png",
      "/placeholder.svg",
    ],
    websiteUrl: "https://cash-register-a85839.gitlab.io/",
    gitlabUrl: "https://gitlab.com/replace-later/cash-register",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
    ],
    experience:
      "Explored state management patterns and receipt printing edge cases.",
  },
];


