"use client";

import React from "react";
import type { Project } from "./projects.types";
import { CompanyClientCircles } from "./CompanyClientCircles";
import { User } from "lucide-react";
import { getInitials, resolveCompanyClientLogo } from "./company-client-logos";

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

  const companyName = project.company
    ? typeof project.company === "string"
      ? project.company
      : project.company.name
    : null;

  const showCompanyClient =
    leadingCircles.length > 0 ||
    !!project.company ||
    (project.clients?.length ?? 0) > 0;

  if (!showCompanyClient) return null;

  return (
    <div className="w-full">
      {/* Compact (<500px): icons/avatars only */}
      <div className="inline-flex xs:hidden w-fit max-w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/30 p-3">
        <CompanyClientCircles
          className="justify-start"
          leadingCircles={leadingCircles}
          company={project.company}
          clients={project.clients}
          size={30}
        />
      </div>

      {/* Spacious (500px+): text + icons */}
      <div className="hidden xs:block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              Context
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-[55ch]">
              {project.type === "personal"
                ? "This is a personal project."
                : "Where this project was built and who it was made for."}
            </div>
          </div>

          <div className="shrink-0">
            <CompanyClientCircles
              className="justify-end"
              leadingCircles={leadingCircles}
              company={project.company}
              clients={project.clients}
              size={28}
            />
          </div>
        </div>

        {(project.company || (project.clients?.length ?? 0) > 0) ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {project.company ? (
              <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                  Company
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs mt-2 px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                  <span className="inline-flex">
                    <CompanyClientCircles company={project.company} size={20} />
                  </span>
                  <span>{companyName}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                  Company
                </div>
                <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  —
                </div>
              </div>
            )}

            {(project.clients?.length ?? 0) > 0 ? (
              <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                  Clients
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.clients?.map((c) => (
                    <span
                      key={c.name}
                      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
                    >
                      <span className="inline-flex">
                        <CompanyClientCircles clients={[c]} size={20} />
                      </span>
                      <span>{c.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                  Clients
                </div>
                <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  —
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

