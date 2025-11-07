"use client";

import React, { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../lib/hooks/use-outside-click";
import type { Project } from "./projects.types";
import { ProjectCarousel } from "./ProjectCarousel";
import * as Tooltip from "@radix-ui/react-tooltip";
import { GlobeIcon, X } from "lucide-react";
import GitlabButton from "../GitlabButton";
import BaseButton from "../Button";
import { useI18n } from "../../lib/i18n";

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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
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

  useOutsideClick(ref, () => onClose());

  const tp = t('projects');

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
            layoutId={`card-${getProjectString(project, 'title')}-${id}`}
            className="relative w-full max-w-[900px] h-full md:h-fit md:max-h-[90%] p-8 flex flex-col gap-y-4 bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-lg z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {/* X button for screens smaller than xl */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 xl:hidden flex items-center justify-center size-7 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="size-4 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center justify-between gap-4 w-full">
              <div>
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  {getProjectString(project, 'title')}
                </h3>
                {project.details?.subtitle || project.details?.subtitleKey ? (
                  <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {getProjectString({ ...project.details, id: project.id }, 'subtitle')}
                  </p>
                ) : null}
                <p className="text-neutral-600 dark:text-neutral-400">
                  {getProjectString(project, 'description')}
                </p>
              </div>
              <div className="flex w-fit shrink-0 gap-2">
                <BaseButton href={project.websiteUrl} className="flex items-center gap-2 p-2 text-sm rounded-full font-bold bg-green-600 hover:bg-green-700 text-white" theme="green">
                  Visit <GlobeIcon className="size-5" />
                </BaseButton>
                <GitlabButton href={project.gitlabUrl} width={20} height={20} className='bg-orange-100 rounded-full p-2 hover:bg-orange-200'/>
              </div>
            </div>

            <ProjectCarousel images={project.images} />

            <div className="flex items-center gap-3 flex-wrap">
              {project.technologies.map((tech) => (
                <Tooltip.Provider delayDuration={150} key={tech.name}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="h-6 w-6"
                        />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        sideOffset={6}
                        className="rounded bg-black text-white px-2 py-1 text-xs shadow"
                      >
                        {tech.name}
                        <Tooltip.Arrow className="fill-black" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              ))}
            </div>

            <div className="flex flex-col gap-6 overflow-auto">

              {project.details ? (
                <div className="space-y-6">
                  {project.details?.overview || project.details?.overviewKey ? (
                    <section>
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">{tp('overviewHeading')}</h4>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {getProjectString({ ...project.details, id: project.id }, 'overview')}
                      </p>
                    </section>
                  ) : null}

                  {project.details?.coreConcept ? (
                    <section>
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">{tp('coreConceptHeading')}</h4>
                      {(project.details.coreConcept.summary || project.details.coreConcept.summaryKey) ? (
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">
                          {getProjectString({ ...project.details.coreConcept, id: project.id }, 'summary')}
                        </p>
                      ) : null}
                      {(project.details.coreConcept.bullets || project.details.coreConcept.bulletsKeys) ? (
                        <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                          {getProjectArray({ ...project.details.coreConcept, id: project.id }, 'bullets').map((item, idx) => (
                            <li key={`${item}-${idx}`}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ) : null}

                  {(project.details?.features || project.details?.featuresKeys) ? (
                    <section>
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">{tp('featuresHeading')}</h4>
                      <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                        {getProjectArray({ ...project.details, id: project.id }, 'features').map((feature, idx) => (
                          <li key={`${feature}-${idx}`}>{feature}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {project.details?.technical && (
                    <section className="space-y-4">
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-100">{tp('technicalHeading')}</h4>
                      {(project.details.technical.frontendStack || project.details.technical.frontendStackKeys) ? (
                        <div>
                          <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{tp('frontendStackHeading')}</h5>
                          <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                            {getProjectArray({ ...project.details.technical, id: project.id }, 'frontendStack').map((item, idx) => (
                              <li key={`${item}-${idx}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {(project.details.technical.projectStructure || project.details.technical.projectStructureKeys) ? (
                        <div>
                          <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{tp('projectStructureHeading')}</h5>
                          <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                            {getProjectArray({ ...project.details.technical, id: project.id }, 'projectStructure').map((item, idx) => (
                              <li key={`${item}-${idx}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {(project.details.technical.deployment || project.details.technical.deploymentKeys) ? (
                        <div>
                          <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{tp('deploymentHeading')}</h5>
                          <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                            {getProjectArray({ ...project.details.technical, id: project.id }, 'deployment').map((item, idx) => (
                              <li key={`${item}-${idx}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </section>
                  )}
                </div>
              ) : null}

            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}


