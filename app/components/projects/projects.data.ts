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
    experience: { name: "EdgenTranslate", org: "Edgen", date: "2024" },
  },
  {
    id: "sonora",
    type: "hybrid",
    company: {
      name: "Edgen",
      icon: "/logos/edgen-logo.svg",
      url: "https://edgen.co",
    },
    clients: [], // Add client icons here when provided
    titleKey: "title",
    descriptionKey: "description",
    // Images auto-detected from /public/projects_images/sonora/
    // Top 3 per theme (based on previous manual ordering)
    imagesFirst: [
      "main_page_L.png",
      "voices_page_L.png",
      "story_page_L.png",
      "main_page_D.png",
      "voices_page_D.png",
      "story_page_D.png",
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
    type: "hybrid",
    company: "Edgen",
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
    // Images auto-detected from /public/projects_images/o-guardanapo/
    // Top 3 per theme (based on previous manual ordering)
    imagesFirst: [
      "hero_L.png",
      "hero_menu_end_L.png",
      "product_page_L.png",
      "hero_D.png",
      "hero_menu_end_D.png",
      "product_page_D.png",
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

/**
 * Processed projects with resolved images.
 * Images are automatically detected from directories if not manually specified.
 */
export const projects: Project[] = projectsData.map((project) => ({
  ...project,
  images: resolveProjectImages(project) || [], // Ensure images is always an array
}));

