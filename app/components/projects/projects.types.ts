export type ProjectTechnology = {
  name: string;
  icon: string; // path to public asset, e.g. '/logos/react.svg'
};

export type ProjectDetails = {
  subtitle?: string;
  overview?: string;
  coreConcept?: {
    summary?: string;
    bullets?: string[];
  };
  features?: string[];
  technical?: {
    frontendStack?: string[];
    projectStructure?: string[];
    deployment?: string[];
  };
};

export type Project = {
  id: string;
  title: string;
  description: string;
  images: string[]; // first one is the cover image
  websiteUrl: string;
  gitlabUrl: string;
  technologies: ProjectTechnology[];
  details?: ProjectDetails;
};

