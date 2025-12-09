/**
 * Technology used in a project.
 */
export type ProjectTechnology = {
  /** Technology name */
  name: string;
  /** Path to public asset icon, e.g. '/logos/react.svg' */
  icon: string;
};

/**
 * Detailed project information with translatable content.
 * Supports both direct strings and i18n keys for translations.
 */
export type ProjectDetails = {
  /** Direct subtitle string */
  subtitle?: string;
  /** i18n key for subtitle */
  subtitleKey?: string;
  /** Direct overview text */
  overview?: string;
  /** i18n key for overview */
  overviewKey?: string;
  /** Core concept information */
  coreConcept?: {
    /** Direct summary text */
    summary?: string;
    /** i18n key for summary */
    summaryKey?: string;
    /** Direct bullet points array */
    bullets?: string[];
    /** i18n key for bullets array */
    bulletsKeys?: string;
  };
  /** Direct features array */
  features?: string[];
  /** i18n key for features array */
  featuresKeys?: string;
  /** Technical details */
  technical?: {
    /** Direct frontend stack array */
    frontendStack?: string[];
    /** i18n key for frontend stack */
    frontendStackKeys?: string;
    /** Direct project structure array */
    projectStructure?: string[];
    /** i18n key for project structure */
    projectStructureKeys?: string;
    /** Direct deployment array */
    deployment?: string[];
    /** i18n key for deployment */
    deploymentKeys?: string;
  };
  /** Personal experience working with the project */
  personalExperience?: {
    /** Direct experience text */
    text?: string;
    /** i18n key for experience text */
    textKey?: string;
  };
};

/**
 * Project experience/work context information.
 */
export type ProjectExperience = {
  /** Client/team/initiative name */
  name: string;
  /** Organization where project was done */
  org: 'Edgen' | 'Freelance' | string;
  /** Free-form date or range, e.g., '2024' or '2023–2024' */
  date: string;
};

/**
 * Project data structure.
 * Supports both direct strings and i18n keys for internationalization.
 */
export type Project = {
  /** Unique project identifier */
  id: string;
  /** Direct title string */
  title?: string;
  /** i18n key for title */
  titleKey?: string;
  /** Direct description text */
  description?: string;
  /** i18n key for description */
  descriptionKey?: string;
  /** Array of image paths (first one is the cover image) */
  images: string[];
  /** Project website URL */
  websiteUrl: string;
  /** GitLab repository URL */
  gitlabUrl: string;
  /** Technologies used in the project */
  technologies: ProjectTechnology[];
  /** Optional detailed project information */
  details?: ProjectDetails;
  /** Optional experience/work context */
  experience?: ProjectExperience;
};

