"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../lib/hooks/use-outside-click";
import type { Project } from "./projects.types";
import { ProjectCarousel } from "./ProjectCarousel";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Briefcase, GlobeIcon, User, X } from "lucide-react";
import GitlabButton from "../GitlabButton";
import BaseButton from "../Button";
import { useI18n } from "../../lib/i18n";
import { cn } from "@/app/lib/utils";
import { GitlabReadmeViewer } from "./GitlabReadmeViewer";
import Image from "next/image";
import { CompanyClientCircles } from "./CompanyClientCircles";

/**
 * Expanded project card modal component.
 * Displays detailed project information including carousel, technologies, and descriptions.
 * Supports keyboard navigation (Escape to close) and outside click to close.
 * 
 * @param props - ProjectExpandedCard component props
 * @param props.project - Project data to display (null to hide modal)
 * @param props.onClose - Close handler function
 * 
 * @example
 * ```tsx
 * <ProjectExpandedCard 
 *   project={activeProject} 
 *   onClose={() => setActiveProject(null)} 
 * />
 * ```
 */
export function ProjectExpandedCard({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const { getProjectString, getProjectArray, t } = useI18n();

  const [activeTab, setActiveTab] = useState<"info" | "experience">("info");

  // Handle keyboard navigation and prevent body scroll when modal is open
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    // Prevent body scroll when modal is open
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [project, onClose]);

  // Close modal when clicking outside
  useOutsideClick(ref, () => onClose());

  const tp = t("projects");

  return (
    <AnimatePresence>
      {project ? (
        <div className="fixed inset-0 z-[100] grid place-items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <motion.div
            ref={ref}
            layoutId={`card-${getProjectString(project, "title")}-${id}`}
            className="relative w-full max-w-[900px] h-full md:max-h-[90%] p-8 flex flex-col gap-y-4 bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-scroll shadow-lg z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {/* X button for screens smaller than xl */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 xl:hidden flex items-center justify-center size-7 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="size-4 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex flex-col items-start gap-1 w-full">
              <div className="flex items-center justify-between mb-3 w-full">
                <h3 className="flex items-center gap-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  {getProjectString(project, "title")}
                  <CompanyClientCircles
                    leadingCircles={
                      project.type === "personal" || project.type === "hybrid"
                        ? [
                            {
                              name: "Personal",
                              iconNode: (
                                <User
                                  className="text-black"
                                  size={14}
                                />
                              ),
                              tooltipText:
                                project.type === "hybrid"
                                  ? "Project personal continuation"
                                  : "Personal project",
                            },
                          ]
                        : []
                    }
                    company={
                      project.type === "professional" || project.type === "hybrid"
                        ? project.company
                        : undefined
                    }
                    clients={
                      project.type === "professional" || project.type === "hybrid"
                        ? project.clients
                        : undefined
                    }
                    size={30}
                  />
                </h3>
                <ProjectButtons project={project} />
              </div>
              {project.details?.subtitle || project.details?.subtitleKey ? (
                <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {getProjectString({ ...project.details, id: project.id }, "subtitle")}
                </p>
              ) : null}
              <p className="text-neutral-600 dark:text-neutral-400">
                {getProjectString(project, "description")}
              </p>
            </div>

            <ProjectCarousel images={project.images} />

            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-[300px]">
              <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "info"
                      ? "border-green-500 text-neutral-900 dark:text-neutral-50"
                      : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  )}
                  onClick={() => setActiveTab("info")}
                >
                  {tp("projectInfoHeading")}
                </button>

                {project.details?.personalExperience &&
                  (project.details.personalExperience.text ||
                    project.details.personalExperience.textKey) && (
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "experience"
                          ? "border-green-500 text-neutral-900 dark:text-neutral-50"
                          : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                      )}
                      onClick={() => setActiveTab("experience")}
                    >
                      {tp("personalExperienceHeading")}
                    </button>
                  )}
              </div>

              <div className="relative flex-1 min-h-0">
                {activeTab === "info" && (
                  <div className="h-full overflow-y-auto pr-1 space-y-6">
                    <GitlabReadmeViewer projectId={project.id} />
                  </div>
                )}

                {activeTab === "experience" &&
                  project.details?.personalExperience &&
                  (project.details.personalExperience.text ||
                    project.details.personalExperience.textKey) && (
                    <div className="h-full overflow-y-auto pr-1">
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                        {getProjectString(
                          { ...project.details.personalExperience, id: project.id },
                          "text"
                        )}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function ProjectButtons({ project }: { project: Project }) {
  return (
    <div className="flex w-fit shrink-0 gap-2">
      <BaseButton
        href={project.websiteUrl}
        className="flex items-center gap-2 p-2 text-sm rounded-full font-bold bg-green-600 hover:bg-green-700 text-white"
        theme="green"
      >
        Visit <GlobeIcon className="size-5" />
      </BaseButton>
      <GitlabButton
        href={project.gitlabUrl}
        width={20}
        height={20}
        className="bg-orange-100 rounded-full p-2 hover:bg-orange-200"
      />
    </div>
  );
}