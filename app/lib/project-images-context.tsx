"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ProjectImagesManifest = Record<string, string[]>;

const ProjectImagesContext = createContext<ProjectImagesManifest | null>(null);

export function ProjectImagesProvider({
  manifest,
  children,
}: {
  manifest: ProjectImagesManifest;
  children: ReactNode;
}) {
  return (
    <ProjectImagesContext.Provider value={manifest}>
      {children}
    </ProjectImagesContext.Provider>
  );
}

export function useProjectImagesManifest(): ProjectImagesManifest {
  const manifest = useContext(ProjectImagesContext);
  if (!manifest) {
    throw new Error("useProjectImagesManifest must be used within ProjectImagesProvider");
  }
  return manifest;
}
