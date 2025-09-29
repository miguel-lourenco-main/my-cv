import { Project } from "./projects.types";

// Temporary seed data; links and images will be updated later by the user.
export const projects: Project[] = [
  {
    id: "ui-components",
    title: "UI Components Playground",
    description:
      "Component library and playground to browse, test, and copy React UI across themes.",
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
    details: {
      subtitle: "React Component Library & Playground",
      overview:
        "A modern library and playground for reusable React components across multiple themes. Discover components, tweak props live, and copy production‑ready code.",
      coreConcept: {
        summary: "An integration hub for themed UI components.",
        bullets: [
          "One set of components, 6+ themes (Minimal, Modern, Gradient, Rounded, Dark, Neon)",
          "Live props with instant preview and code output",
          "Copyable, production‑ready snippets",
          "Consistent light/dark behavior",
        ],
      },
      features: [
        "Curated components: Button, Card, Input, Slider, Switch, Textarea, Toggle",
        "Multiple themes with consistent palettes",
        "Interactive examples and real‑time preview",
        "Type‑safe prop editing and code generation",
        "Mobile‑friendly UI with resizable panels",
        "Theme gallery for side‑by‑side comparison",
      ],
      technical: {
        frontendStack: [
          "Next.js 14 with App Router",
          "React 18 with TypeScript",
          "Tailwind CSS with extensive safelist for dynamic class generation",
          "Framer Motion for animations",
          "Radix UI components via shadcn/ui",
          "Monaco Editor for code editing and syntax highlighting",
        ],
        projectStructure: [
          "Dynamic Component Loading: runtime discovery and registration",
          "Example‑based usage demos",
          "Theme integration: components adapt to selected theme",
          "Component tests for props and behavior",
          "Performance: dynamic imports and code splitting",
          "Mobile‑first responsive design",
          "Theme management via CSS variables",
          "Component registry for discovery and metadata",
        ],
        deployment: [
          "GitLab Pages",
          "Static export with dynamic features where needed",
          "Optimized bundle via code splitting and lazy loading",
        ],
      },
    },
    
  },
  {
    id: "sonora",
    title: "Sonora",
    description:
      "Interactive audiobooks with AI narration and branching stories.",
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
    details: {
      subtitle: "AI-Powered Interactive Audiobook Platform",
      overview:
        "Interactive audiobook platform with AI narration and choice-driven stories. Pick a voice, explore multiple paths, and generate audio in real time.",
      coreConcept: {
        summary: "Interactive audiobooks with AI narration.",
        bullets: [
          "Branching stories with multiple endings",
          "AI voices via ElevenLabs and OpenAI",
          "Real‑time audio with word‑level timing and subtitles",
          "Custom voice creation and management",
          "Pre‑recorded audio fallback",
          "Responsive player with timeline, replay, and choices",
        ],
      },
      features: [
        "Library: 10+ interactive stories (e.g., The Enchanted Forest, The Midnight Library, Project Hail Mary)",
        "Voices: create and preview custom voices; high‑quality TTS",
        "Branching navigation with user choices",
        "Player: timeline, replay, auto‑advance",
        "Performance: pre‑recorded fallback and smart source detection",
        "Design: mobile‑optimized with light/dark themes",
      ],
      technical: {
        frontendStack: [
          "Next.js 15 (App Router, static generation)",
          "React 19 with TypeScript",
          "Tailwind CSS",
          "Framer Motion (3D card effects)",
          "Radix UI via shadcn/ui",
          "Custom 3D card components",
        ],
        projectStructure: [
          "Node‑based story engine (choices, timing)",
          "Audio pipeline for TTS and subtitles",
          "Voice management CRUD",
          "Advanced player (timeline, replay, choices)",
          "Type‑safe story data",
          "Integrations: ElevenLabs + OpenAI",
          "Static generation with lazy loading and code splitting",
        ],
        deployment: [
          "Static site with dynamic features",
          "Organized audio assets with metadata",
          "Secure env config and optimized builds",
        ],
      },
    }
  },
  {
    id: "agentic-hub",
    title: "Agentic Hub",
    description:
      "Marketplace where AI agents sell services to people and to other agents.",
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
        "A decentralized marketplace for specialized AI agents. Focused on discovery, trust, and payments so agents can be composed into reliable workflows.",
      coreConcept: {
        summary: "An integration hub for composable AI agents.",
        bullets: [
          "Specialized agents for content, support, analytics, dev help, research",
          "Agent‑to‑agent hiring for multi‑step jobs",
          "Embedded UIs for human users",
          "Solana payments and verifiable logs",
        ],
      },
      features: [
        "Marketplace across Development, Analytics, Content, Support, Research",
        "Embeddable UIs per agent",
        "Agent‑to‑agent APIs for orchestration",
        "Verifiable execution: cryptographic proofs and immutable logs",
        "Tokenized investing in top agents",
        "Ratings and reviews",
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
        projectStructure: ["Turbo repo, shared UI, linting and TS configs"],
        deployment: ["Gitlab Pages"],
      },
    },
    
  },
  {
    id: "cash-register",
    title: "Cash Register",
    description:
      "Mobile‑first POS for restaurants and bars.",
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
    details: {
      subtitle: "Modern Point of Sale System",
      overview:
        "A web‑based POS that streamlines ordering with an interface tuned for touch and small screens.",
      coreConcept: {
        summary: "A complete POS flow from menu to history.",
        bullets: [
          "Browse categorized menus (drinks and food)",
          "Build orders with real‑time cart",
          "Store orders with full history",
          "Floating cart for quick navigation on mobile",
        ],
      },
      features: [
        "Catalog: drinks and food with prices and icons",
        "Ordering: one‑tap add, quantity controls, totals, smooth feedback",
        "Mobile: floating cart, smooth scroll, badges",
        "Orders: history, timestamps, detail view, live updates",
      ],
      technical: {
        frontendStack: [
          "Next.js 15 with App Router and static export capability",
          "React 19 with TypeScript",
          "Tailwind CSS for responsive styling",
          "Radix UI via shadcn/ui",
          "Lucide React for iconography",
          "Sonner for toast notifications",
        ],
        projectStructure: [
          "Supabase backend with PostgreSQL, typed schema, and RLS",
          "Real‑time subscriptions for live updates",
          "Client/server components separated by concern",
          "Type‑safe DB operations with generated types",
          "Modular UI in /components/ui and business logic in /lib",
          "Key components: CashRegister, FloatingCartButton, OrderList, OrderDetails",
        ],
        deployment: [
          "GitLab Pages for frontend",
          "Supabase managed backend",
        ],
      },
    },
  },
];


