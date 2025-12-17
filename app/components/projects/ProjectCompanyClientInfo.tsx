"use client";

import React from "react";
import type { Project } from "./projects.types";
import { CompanyClientCircles } from "./CompanyClientCircles";
import { User } from "lucide-react";

export function ProjectCompanyClientInfo({ project }: { project: Project }) {
  const leadingCircles =
    project.type === "personal" || project.type === "hybrid"
      ? [
          {
            name: "Personal",
            iconNode: <User className="text-black" size={14} />,
            tooltipText:
              project.type === "hybrid"
                ? "Project personal continuation"
                : "Personal project",
          },
        ]
      : [];

  const showCompanyClient =
    leadingCircles.length > 0 ||
    !!project.company ||
    (project.clients?.length ?? 0) > 0;

  if (!showCompanyClient) return null;

  return (
    <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/30 p-3 sm:p-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Context
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            {project.type === "personal"
              ? "This is a personal project."
              : "Where this project was built and who it was made for."}
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <CompanyClientCircles
            className="justify-start"
            leadingCircles={leadingCircles}
            company={project.company}
            clients={project.clients}
            size={30}
          />
        </div>
      </div>

      <div className="sm:grid hidden mt-3 gap-3 sm:grid-cols-2">
        {project.company ? (
          <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-3">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
              Company
            </div>
            <div className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              {typeof project.company === "string" ? project.company : project.company.name}
            </div>
          </div>
        ) : null}

        {(project.clients?.length ?? 0) > 0 ? (
          <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-3">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
              Clients
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              {project.clients?.map((c) => (
                <span
                  key={c.name}
                  className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

