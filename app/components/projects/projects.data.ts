import { Project } from "./projects.types";

/**
 * Project data array with translatable content.
 * Uses i18n keys for internationalization - actual strings are in locale JSON files.
 * Images support theme variants with _L.png (light) and _D.png (dark) suffixes.
 * 
 * @example
 * ```ts
 * import { projects } from './projects.data';
 * <ProjectGrid projects={projects} />
 * ```
 */
export const projects: Project[] = [
  {
    id: "edgen-chat",
    type: "professional",
    company: {
      name: "Edgen",
      icon: "/logos/edgen-logo.svg",
      url: "https://edgen.co",
    },
    clients: [{
      name: "SIBS",
      icon: "/logos/sibs-logo.svg",
      url: "https://sibs.com",
    }],
    titleKey: "title",
    descriptionKey: "description",
    images: [
      "/projects_images/edgen-chat/main_L.png",
      "/projects_images/edgen-chat/main_D.png",
    ],
    websiteUrl: "#",
    gitlabUrl: "#",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "LLM", icon: "/logos/llm.svg" },
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
      personalExperience: {
        textKey: "personalExperience",
      },
    },
    experience: { name: "EdgenChat", org: "Edgen", date: "2024" },
  },
  {
    id: "edgen-code",
    type: "professional",
    company: {
      name: "Edgen",
      icon: "/logos/edgen-logo.svg",
      url: "https://edgen.co",
    },
    clients: [{
      name: "SIBS",
      icon: "/logos/sibs-logo.svg",
      url: "https://sibs.com",
    }],
    titleKey: "title",
    descriptionKey: "description",
    images: [
      "/projects_images/edgen-code/main_L.png",
      "/projects_images/edgen-code/main_D.png",
    ],
    websiteUrl: "#",
    gitlabUrl: "#",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "C#", icon: "/logos/c_sharp.svg" },
      { name: "LLM", icon: "/logos/llm.svg" },
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
      personalExperience: {
        textKey: "personalExperience",
      },
    },
    experience: { name: "EdgenCode", org: "Edgen", date: "2024" },
  },
  {
    id: "edgen-translate",
    type: "professional",
    company: {
      name: "Edgen",
      icon: "/logos/edgen-logo.svg",
      url: "https://edgen.co",
    },
    clients: [{
      name: "SIBS",
      icon: "/logos/sibs-logo.svg",
      url: "https://sibs.com",
    }],
    titleKey: "title",
    descriptionKey: "description",
    images: [
      "/projects_images/edgen-translate/main_L.png",
      "/projects_images/edgen-translate/main_D.png",
    ],
    websiteUrl: "#",
    gitlabUrl: "#",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "LLM", icon: "/logos/llm.svg" },
      { name: "File Processing", icon: "/logos/file_processing.svg" },
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
      personalExperience: {
        textKey: "personalExperience",
      },
    },
    experience: { name: "EdgenTranslate", org: "Edgen", date: "2024" },
  },
  {
    id: "sonora",
    type: "professional",
    company: {
      name: "Edgen",
      icon: "/logos/edgen-logo.svg",
      url: "https://edgen.co",
    },
    clients: [], // Add client icons here when provided
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
    gitlabUrl: "https://gitlab.com/public-work4/sonora",
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
      personalExperience: {
        textKey: "personalExperience",
      },
    },
    experience: { name: "Sonora", org: "Edgen", date: "2024-2025" }
  },
  {
    id: "agentic-hub",
    type: "professional",
    company: "Edgen",
    clients: [], // Add client icons here when provided
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
    gitlabUrl: "https://gitlab.com/public-work4/agentichub",
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
      personalExperience: {
        textKey: "personalExperience",
      },
    },
    experience: { name: "Agentic Hub", org: "Edgen", date: "2024" },
    
  },
  {
    id: "o-guardanapo",
    type: "personal",
    titleKey: "title",
    descriptionKey: "description",
    images: [
      "/projects_images/o-guardanapo/hero_L.png",
      "/projects_images/o-guardanapo/hero_D.png",
      "/projects_images/o-guardanapo/hero_menu_end_L.png",
      "/projects_images/o-guardanapo/hero_menu_end_D.png",
      "/projects_images/o-guardanapo/product_page_L.png",
      "/projects_images/o-guardanapo/product_page_D.png",
      "/projects_images/o-guardanapo/our_history_L.png",
      "/projects_images/o-guardanapo/our_history_D.png",
      "/projects_images/o-guardanapo/contact_us_card_L.png",
      "/projects_images/o-guardanapo/contact_us_card_D.png",
      "/projects_images/o-guardanapo/contact_us_page_L.png",
      "/projects_images/o-guardanapo/contact_us_page_D.png",
      "/projects_images/o-guardanapo/admin_menu_page_L.png",
      "/projects_images/o-guardanapo/admin_menu_page_D.png",
    ],
    websiteUrl: "https://o-guardanapo.site",
    gitlabUrl: "https://gitlab.com/miguel-lourenco-main/o-guardanapo",
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
      personalExperience: {
        textKey: "personalExperience",
      },
    },
    experience: { name: "O Guardanapo", org: "Freelance", date: "2025" },
  },
  {
    id: "ui-components",
    type: "personal",
    titleKey: "title",
    descriptionKey: "description",
    // Translation keys for this project
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
    gitlabUrl: "https://gitlab.com/public-work4/ui-components",
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
      personalExperience: {
        textKey: "personalExperience",
      },
    },
    experience: { name: "UI Components Playground", org: "Freelance", date: "2025" },

  },
  {
    id: "cash-register",
    type: "personal",
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
    gitlabUrl: "https://gitlab.com/public-work4/cash_register",
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
      personalExperience: {
        textKey: "personalExperience",
      },
    },
    experience: { name: "Cash Register", org: "Freelance", date: "2025" },
  },
];


