import { Project } from "./projects.types";

// Project data with translatable strings - the actual strings are now in the i18n system
export const projects: Project[] = [
  {
    id: "ui-components",
    // Translation keys for this project
    titleKey: "title",
    descriptionKey: "description",
    images: [
      "/projects_images/ui-components/hero_start_L.png",
      "/projects_images/ui-components/hero_start_D.png",
      "/projects_images/ui-components/hero_end_L.png",
      "/projects_images/ui-components/hero_end_D.png",
      "/projects_images/ui-components/full_playground_L.png",
      "/projects_images/ui-components/full_playground_D.png",
      "/projects_images/ui-components/playground_start_L.png",
      "/projects_images/ui-components/playground_start_D.png",
      "/projects_images/ui-components/theme_start_L.png",
      "/projects_images/ui-components/theme_start_D.png",
      "/projects_images/ui-components/theme_middle_L.png",
      "/projects_images/ui-components/theme_middle_D.png",
      "/projects_images/ui-components/theme_end_L.png",
      "/projects_images/ui-components/theme_end_D.png",
      "/projects_images/ui-components/themes_grid_L.png",
      "/projects_images/ui-components/themes_grid_D.png",
      "/projects_images/ui-components/themes_gallery_L.png",
      "/projects_images/ui-components/themes_gallery_D.png",
      "/projects_images/ui-components/component_list_L.png",
      "/projects_images/ui-components/component_list_D.png",
      "/projects_images/ui-components/component_start_L.png",
      "/projects_images/ui-components/component_start_D.png",
      "/projects_images/ui-components/component_examples_L.png",
      "/projects_images/ui-components/component_examples_D.png",
      "/projects_images/ui-components/component_end_L.png",
      "/projects_images/ui-components/component_end_D.png",
    ],
    websiteUrl: "https://ui-components-5218c2.gitlab.io/",
    gitlabUrl: "https://gitlab.com/miguel-lourenco-main/ui-components",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
    ],
    details: {
      subtitleKey: "subtitle",
      overviewKey: "overview",
      coreConcept: {
        summaryKey: "coreConcept.summary",
        bulletsKeys: "coreConcept.bullets",
      },
      featuresKeys: "features",
      technical: {
        frontendStackKeys: "technical.frontendStack",
        projectStructureKeys: "technical.projectStructure",
        deploymentKeys: "technical.deployment",
      },
    },
    experience: { name: "UI Components Playground", org: "Freelance", date: "2025" },

  },
  {
    id: "sonora",
    titleKey: "title",
    descriptionKey: "description",
    images: [
      "/projects_images/sonora/main_page_L.png",
      "/projects_images/sonora/main_page_D.png",
      "/projects_images/sonora/voices_page_L.png",
      "/projects_images/sonora/voices_page_D.png",
      "/projects_images/sonora/story_page_L.png",
      "/projects_images/sonora/story_page_D.png",
    ],
    websiteUrl: "https://sonora-d09e63.gitlab.io/",
    gitlabUrl: "https://gitlab.com/miguel-lourenco-main/sonora",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
    ],
    details: {
      subtitleKey: "subtitle",
      overviewKey: "overview",
      coreConcept: {
        summaryKey: "coreConcept.summary",
        bulletsKeys: "coreConcept.bullets",
      },
      featuresKeys: "features",
      technical: {
        frontendStackKeys: "technical.frontendStack",
        projectStructureKeys: "technical.projectStructure",
        deploymentKeys: "technical.deployment",
      },
    },
    experience: { name: "Sonora", org: "Binedge", date: "2024-2025" }
  },
  {
    id: "agentic-hub",
    titleKey: "title",
    descriptionKey: "description",
    images: [
      "/projects_images/agentic-hub/main_page_L.png",
      "/projects_images/agentic-hub/main_page_D.png",
      "/projects_images/agentic-hub/agents_list_L.png",
      "/projects_images/agentic-hub/agents_list_D.png",
      "/projects_images/agentic-hub/agent_info_L.png",
      "/projects_images/agentic-hub/agent_info_D.png",
      "/projects_images/agentic-hub/agent_hire_L.png",
      "/projects_images/agentic-hub/agent_hire_D.png",
      "/projects_images/agentic-hub/agent_invest_L.png",
      "/projects_images/agentic-hub/agent_invest_D.png",
    ],
    websiteUrl: "https://agentichub-64abdc.gitlab.io",
    gitlabUrl: "https://gitlab.com/miguel-lourenco-main/agentichub",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
    ],
    details: {
      subtitleKey: "subtitle",
      overviewKey: "overview",
      coreConcept: {
        summaryKey: "coreConcept.summary",
        bulletsKeys: "coreConcept.bullets",
      },
      featuresKeys: "features",
      technical: {
        frontendStackKeys: "technical.frontendStack",
        projectStructureKeys: "technical.projectStructure",
        deploymentKeys: "technical.deployment",
      },
    },
    experience: { name: "Agentic Hub", org: "Binedge", date: "2024" },
    
  },
  {
    id: "cash-register",
    titleKey: "title",
    descriptionKey: "description",
    images: [
      "/projects_images/cash-register/register_L.png",
      "/projects_images/cash-register/register_D.png",
      "/projects_images/cash-register/orders_list_L.png",
      "/projects_images/cash-register/orders_list_D.png",
      "/projects_images/cash-register/order_info_L.png",
      "/projects_images/cash-register/order_info_D.png",
    ],
    websiteUrl: "https://cash-register-a85839.gitlab.io/",
    gitlabUrl: "https://gitlab.com/miguel-lourenco-main/cash_register",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
    ],
    details: {
      subtitleKey: "subtitle",
      overviewKey: "overview",
      coreConcept: {
        summaryKey: "coreConcept.summary",
        bulletsKeys: "coreConcept.bullets",
      },
      featuresKeys: "features",
      technical: {
        frontendStackKeys: "technical.frontendStack",
        projectStructureKeys: "technical.projectStructure",
        deploymentKeys: "technical.deployment",
      },
    },
    experience: { name: "Cash Register", org: "Freelance", date: "2025" },
  },
];


