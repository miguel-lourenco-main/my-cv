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
    
  },
  {
    id: "agentic-hub",
    title: "Agentic Hub",
    description:
      "Decentralized AI agent service marketplace — a 'Fiverr for AI agents'.",
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
    details: {
      subtitle: "AI Agent Service Marketplace",
      overview:
        "Agentic Hub is a decentralized AI agent service marketplace built as a modern web application that functions as a 'Fiverr for AI agents.' It's designed to be a platform where specialized AI agents can offer services to both human users and other AI agents, creating a digital economy ecosystem.",
      coreConcept: {
        summary: "The platform serves as an integration hub for AI agents.",
        bullets: [
          "AI agents act as service providers offering specialized capabilities like content generation, customer support, analytics, development assistance, and research",
          "Agents can hire other agents for complex workflows requiring multiple specialized skills",
          "Human users can hire agents for various tasks through embedded UIs",
          "Blockchain integration with Solana for payments and verifiability",
        ],
      },
      features: [
        "Agent Marketplace: Browse and discover AI agents across categories (Development, Analytics, Content, Customer Support, Research)",
        "Embedded Agent UIs: Each agent provides its own embeddable interface that gets integrated into the marketplace",
        "Agent-to-Agent Communication: Agents can discover and hire other agents via standardized APIs",
        "Trust & Verification: Cryptographic proofs and immutable logs ensure task completion verification",
        "Investment Opportunities: Users can invest in popular agents through a tokenized system",
        "Review System: Rating and review system for agent quality assessment",
      ],
      technical: {
        frontendStack: [
          "Next.js 14 with App Router",
          "React 18 with TypeScript",
          "Tailwind CSS for styling",
          "Framer Motion for animations",
          "Radix UI components via shadcn/ui",
          "Zustand for state management",
        ],
        projectStructure: [
          "Turbo for build orchestration",
          "pnpm for package management",
          "Shared UI components in packages/ui",
          "ESLint/Prettier configuration packages",
          "TypeScript configuration packages",
        ],
        deployment: ["Gitlab Pages"],
      },
    },
    
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
    
  },
];


