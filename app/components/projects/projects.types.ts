export type ProjectTechnology = {
  name: string;
  icon: string; // path to public asset, e.g. '/logos/react.svg'
};

export type ProjectDetails = {
  subtitle?: string;
  subtitleKey?: string;
  overview?: string;
  overviewKey?: string;
  coreConcept?: {
    summary?: string;
    summaryKey?: string;
    bullets?: string[];
    bulletsKeys?: string;
  };
  features?: string[];
  featuresKeys?: string;
  technical?: {
    frontendStack?: string[];
    frontendStackKeys?: string;
    projectStructure?: string[];
    projectStructureKeys?: string;
    deployment?: string[];
    deploymentKeys?: string;
  };
};

export type ProjectExperience = {
  name: string; // client/team/initiative name
  org: 'Edgen' | 'Freelance' | string; // where it was done
  date: string; // free-form date or range, e.g., '2024' or '2023–2024'
};

export type Project = {
  id: string;
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  images: string[]; // first one is the cover image
  websiteUrl: string;
  gitlabUrl: string;
  technologies: ProjectTechnology[];
  details?: ProjectDetails;
  experience?: ProjectExperience;
};

