import { Project } from "./projects.types";
import { getProjectImages } from "../../lib/get-project-images";

type ProjectData = Omit<Project, "images"> & { images?: string[]; imagesFirst?: string[] };

function applyImagesFirst(images: string[], imagesFirst?: string[]): string[] {
  if (!imagesFirst || imagesFirst.length === 0) return images;

  const picked: string[] = [];
  const pickedSet = new Set<string>();

  const tryPick = (wanted: string) => {
    const normalizedWanted = wanted.startsWith("/") ? wanted : wanted.trim();
    const match = images.find((img) => {
      if (pickedSet.has(img)) return false;
      if (img === normalizedWanted) return true;
      if (!normalizedWanted.startsWith("/")) {
        // Allow matching by filename
        return img.endsWith(`/${normalizedWanted}`) || img.endsWith(normalizedWanted);
      }
      return false;
    });
    if (match) {
      picked.push(match);
      pickedSet.add(match);
    }
  };

  imagesFirst.forEach(tryPick);

  return [...picked, ...images.filter((img) => !pickedSet.has(img))];
}

/**
 * Helper function to resolve project images.
 * If images array is manually provided, use it. Otherwise, auto-detect from directory.
 */
function resolveProjectImages(project: ProjectData): string[] {
  // Manual images array takes priority
  const baseImages =
    project.images && project.images.length > 0
      ? project.images
      : getProjectImages(project.id, project.imagesDir);

  return applyImagesFirst(baseImages, project.imagesFirst);
  }

/**
 * Project data array with translatable content.
 * Uses i18n keys for internationalization - actual strings are in locale JSON files.
 * Images support theme variants with _L.png (light) and _D.png (dark) suffixes.
 * 
 * Images are automatically detected from /public/projects_images/{id}/ unless:
 * - A manual images array is provided (takes priority)
 * - A custom imagesDir is specified
 * 
 * @example
 * ```ts
 * import { projects } from './projects.data';
 * <ProjectGrid projects={projects} />
 * ```
 */
const projectsData: ProjectData[] = [
  {
    id: "oflat",
    type: "personal",
    startDate: "2023-02-01",
    endDate: "2023-09-30",
    titleKey: "title",
    descriptionKey: "description",
    imagesFirst: [
      "oflat_main_L.png",
      "oflat_main_D.png",
    ],
    websiteUrl: "https://oflat-ocamlflat-pages-d4fe77.gitlab.io/",
    gitlabUrl: "https://gitlab.com/public-work4/oflat-ocamlflat-pages",
    deployment: "gitlab_pages",
    technologies: [
      { name: "OCaml", icon: "/logos/ocaml.svg" },
      { name: "JavaScript", icon: "/logos/javaScript.png" },
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
    experience: { name: "OCamlFlat", org: "Thesis Project", date: "2023" },
  },
  {
    id: "edgen-chat",
    type: "professional",
    startDate: "2024-02-01",
    endDate: "2024-12-31",
    company: {
      name: "EdgenAI",
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

    // Top picks (based on previous manual ordering)
    imagesFirst: [
      "edgen_chat_no_msg_L.png", "edgen_chat_no_msg_D.png",
      "edgen_chat_chat_L.png", "edgen_chat_chat_D.png",
    ],
    websiteUrl: "https://edgenchat-d831b2.gitlab.io",
    gitlabUrl: "https://gitlab.com/public-work4/edgenchat",
    deployment: "gitlab_pages",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Next.js", icon: "/logos/nextjs.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "Supabase", icon: "/logos/supabase.svg" },
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
    experience: { name: "EdgenChat", org: "EdgenAI", date: "2024" },
  },
  {
    id: "edgen-code",
    type: "professional",
    startDate: "2024-04-01",
    endDate: "2024-11-30",
    company: {
      name: "EdgenAI",
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
    // Top picks (based on previous manual ordering)
    imagesFirst: ["sibicode_chat_L.png", "sibicode_chat_D.png"],
    websiteUrl: "#",
    gitlabUrl: "#",
    deployment: "none",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Next.js", icon: "/logos/nextjs.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "C#", icon: "/logos/c_sharp.svg" },
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
    experience: { name: "EdgenCode", org: "EdgenAI", date: "2024" },
  },
  {
    id: "edgen-translate",
    type: "professional",
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    company: {
      name: "EdgenAI",
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
    // Images auto-detected from /public/projects_images/edgen-translate/
    // Top 3 per theme (based on previous manual ordering)
    imagesFirst: [
      "edgen-translate_hero_L.png",
      "edgen-translate_hero_dnd_L.png",
      "edgen-translate_hero_feature_preview_L.png",
      "edgen-translate_hero_D.png",
      "edgen-translate_hero_dnd_D.png",
      "edgen-translate_hero_feature_preview_D.png",
    ],
    websiteUrl: "https://edgentranslate-41c1b4.gitlab.io",
    gitlabUrl: "https://gitlab.com/public-work4/edgentranslate",
    deployment: "gitlab_pages",
    technologies: [
      { name: "React", icon: "/logos/react.svg" },
      { name: "Next.js", icon: "/logos/nextjs.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "Supabase", icon: "/logos/supabase.svg" },
      { name: "Playwright", icon: "/logos/playwright.svg" },
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
    experience: { name: "EdgenTranslate", org: "EdgenAI", date: "2024" },
  },
  {
    id: "sonora",
    type: "hybrid",
    startDate: "2024-06-01",
    company: {
      name: "EdgenAI",
      icon: "/logos/edgen-logo.svg",
      url: "https://edgen.co",
    },
    clients: [], // Add client icons here when provided
    titleKey: "title",
    descriptionKey: "description",
    // Images auto-detected from /public/projects_images/sonora/
    // Top 3 per theme (based on previous manual ordering)
    imagesFirst: [
      "hero_L.png",
      "settings_L.png",
      "story1_L.png",
      "story2_L.png",
      "hero_D.png",
      "settings_D.png",
      "story1_D.png",
      "story2_D.png",
    ],
    websiteUrl: "https://sonora-d09e63.gitlab.io/",
    gitlabUrl: "https://gitlab.com/public-work4/sonora",
    deployment: "gitlab_pages",
    logo: "/projects/logos/sonora.svg",
    technologies: [
      { name: "Next.js", icon: "/logos/nextjs.svg" },
      { name: "React", icon: "/logos/react.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "n8n", icon: "/logos/n8n_pink+black_logo.svg" },
      { name: "Supabase", icon: "/logos/supabase.svg" },
      { name: "ElevenLabs", icon: "/logos/elevenlabs-logo-black.svg" },
      { name: "OpenAI", icon: "/logos/openai.svg" },

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
    experience: { name: "Sonora", org: "EdgenAI", date: "2024-2025" }
  },
  {
    id: "agentic-hub",
    type: "hybrid",
    startDate: "2024-07-01",
    endDate: "2024-12-31",
    company: {
      name: "EdgenAI",
      icon: "/logos/edgen-logo.svg",
      url: "https://edgen.co",
    },
    clients: [], // Add client icons here when provided
    titleKey: "title",
    descriptionKey: "description",
    // Images auto-detected from /public/projects_images/agentic-hub/
    // Top 3 per theme (based on previous manual ordering)
    imagesFirst: [
      "main_page_L.png",
      "agents_list_L.png",
      "agent_info_L.png",
      "main_page_D.png",
      "agents_list_D.png",
      "agent_info_D.png",
    ],
    websiteUrl: "https://agentichub-64abdc.gitlab.io",
    gitlabUrl: "https://gitlab.com/public-work4/agentichub",
    deployment: "gitlab_pages",
    logo: "/projects/logos/agentic_hub.svg",
    technologies: [
      { name: "Next.js", icon: "/logos/nextjs.svg" },
      { name: "React", icon: "/logos/react.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "n8n", icon: "/logos/n8n_pink+black_logo.svg" },
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
    experience: { name: "Agentic Hub", org: "EdgenAI", date: "2024" },
    
  },
  {
    id: "o-guardanapo",
    type: "personal",
    startDate: "2025-01-15",
    titleKey: "title",
    descriptionKey: "description",
    // Images auto-detected from /public/projects_images/o-guardanapo/
    // Top 3 per theme (based on previous manual ordering)
    imagesFirst: [
      "todays_menu_L.png",
      "todays_menu_D.png",
      "marketing_reviews_L.png",
      "marketing_reviews_D.png",
      "marketing_contact_us_L.png",
      "marketing_contact_us_D.png",
      "main_product_list_L.png",
      "main_product_list_D.png",
      "product_page_L.png",
      "product_page_D.png",
      "campaings_L.png",
      "campaings_D.png",
      "contact_page_1_L.png",
      "contact_page_1_D.png",
      "contact_page_2_L.png",
      "contact_page_2_D.png",
      "admin_menu_preview_L.png",
      "admin_menu_preview_D.png",
      "admin_campaings_L.png",
      "admin_campaings_D.png",
      "admin_product_list_L.png",
      "admin_product_list_D.png",
      "admin_reviews_L.png",
      "admin_reviews_D.png",
      "create_menu_L.png",
      "create_menu_D.png",
      "product_form_L.png",
      "product_form_D.png",
      "users_contest_L.png",
      "users_contest_D.png",
      "user_review_L.png",
      "user_review_D.png",
    ],
    websiteUrl: "https://o-guardanapo.site",
    gitlabUrl: "https://gitlab.com/miguel-lourenco-main/o-guardanapo",
    deployment: "vercel",
    logo: "/projects/logos/o_guardanapo.png",
    technologies: [
      { name: "Next.js 15.0.5", icon: "/logos/nextjs.svg" },
      { name: "TypeScript 5.7.2", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS 3.4.16", icon: "/logos/tailwind_css.svg" },
      { name: "Supabase 2.22.12", icon: "/logos/supabase.svg" },
      { name: "Playwright 1.51.1", icon: "/logos/playwright.svg" },
      { name: "Turbo 2.3.3", icon: "/logos/turborepo-logo.svg" },
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
    startDate: "2025-02-01",
    titleKey: "title",
    descriptionKey: "description",
    // Images auto-detected from /public/projects_images/ui-components/
    // Top 3 per theme (based on previous manual ordering)
    imagesFirst: [
      "hero_start_L.png",
      "hero_end_L.png",
      "full_playground_L.png",
      "hero_start_D.png",
      "hero_end_D.png",
      "full_playground_D.png",
    ],
    websiteUrl: "https://ui-components-5218c2.gitlab.io/",
    gitlabUrl: "https://gitlab.com/public-work4/ui-components",
    deployment: "gitlab_pages",
    logo: "/projects/logos/ui_components.svg",
    technologies: [
      { name: "Next.js", icon: "/logos/nextjs.svg" },
      { name: "React", icon: "/logos/react.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "Playwright", icon: "/logos/playwright.svg" },
      { name: "n8n", icon: "/logos/n8n_pink+black_logo.svg" },
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
    startDate: "2025-03-01",
    titleKey: "title",
    descriptionKey: "description",
    // Images auto-detected from /public/projects_images/cash-register/
    // Top 3 per theme (based on previous manual ordering)
    imagesFirst: [
      "register_L.png",
      "orders_list_L.png",
      "order_info_L.png",
      "register_D.png",
      "orders_list_D.png",
      "order_info_D.png",
    ],
    websiteUrl: "https://cash-register-a85839.gitlab.io/",
    gitlabUrl: "https://gitlab.com/public-work4/cash_register",
    deployment: "gitlab_pages",
    logo: "/projects/logos/cash_register.png",
    technologies: [
      { name: "Next.js", icon: "/logos/nextjs.svg" },
      { name: "React", icon: "/logos/react.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "Supabase", icon: "/logos/supabase.svg" },
      { name: "n8n", icon: "/logos/n8n_pink+black_logo.svg" },
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
  {
    id: "job-ai-hub",
    type: "personal",
    startDate: "2026-02-10",
    titleKey: "title",
    descriptionKey: "description",
    imagesFirst: [
      "hero_L.png",
      "pillars_L.png",
      "more_features_L.png",
      "dashboard_L.png",
      "job_applications_L.png",
      "id_job_application_L.png",
      "ai_chat_L.png",
      "resume_editor_L.png",
      "interview_L.png",
      "user_profile_L.png",
      "hero_D.png",
      "pillars_D.png",
      "more_features_D.png",
      "dashboard_D.png",
      "job_applications_D.png",
      "id_job_application_D.png",
      "ai_chat_D.png",
      "resume_editor_D.png",
      "interview_D.png",
      "user_profile_D.png",
    ],
    websiteUrl: "https://v0-job-hunting-platform-two.vercel.app",
    gitlabUrl: "https://gitlab.com/public-work4/personal-job-hunt-hub",
    deployment: "vercel",
    logo: "/projects/logos/job_ai_hub.svg",
    technologies: [
      { name: "Next.js", icon: "/logos/nextjs.svg" },
      { name: "React", icon: "/logos/react.svg" },
      { name: "TypeScript", icon: "/logos/typescript.svg" },
      { name: "Tailwind CSS", icon: "/logos/tailwind_css.svg" },
      { name: "Supabase", icon: "/logos/supabase.svg" },
      { name: "Playwright", icon: "/logos/playwright.svg" },
      { name: "OpenAI", icon: "/logos/openai.svg" },
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
    experience: { name: "Job AI Hub", org: "Freelance", date: "2026" },
  }
];

/**
 * Processed projects with resolved images.
 * Images are automatically detected from directories if not manually specified.
 */
export const projects: Project[] = projectsData.map((project) => ({
  ...project,
  images: resolveProjectImages(project) || [], // Ensure images is always an array
}));

