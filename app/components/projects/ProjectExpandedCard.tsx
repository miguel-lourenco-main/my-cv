"use client";

import React, { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../lib/hooks/use-outside-click";
import type { Project } from "./projects.types";
import { ProjectCarousel } from "./ProjectCarousel";
import * as Tooltip from "@radix-ui/react-tooltip";
import { GlobeIcon } from "lucide-react";
import Link from "next/link";
import GitlabButton from "../GitlabButton";

export function ProjectExpandedCard({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

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
            layoutId={`card-${project.title}-${id}`}
            className="w-full max-w-[900px] h-full md:h-fit md:max-h-[90%] p-8 flex flex-col gap-y-4 bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-lg z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    {project.title}
                  </h3>
                  {project.details?.subtitle ? (
                    <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {project.details.subtitle}
                    </p>
                  ) : null}
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {project.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={project.websiteUrl}
                    target="_blank"
                    className="flex items-center gap-2 p-2 text-sm rounded-full font-bold bg-green-600 hover:bg-green-700 text-white"
                    rel="noreferrer"
                  >
                    Visit <GlobeIcon className="size-5" />
                  </Link>
                  <GitlabButton href={project.gitlabUrl} width={20} height={20} className='bg-orange-100 rounded-full p-2 hover:bg-orange-200'/>
                </div>
            </div>

            <ProjectCarousel images={project.images} />

            <div className="flex flex-col gap-6 overflow-auto">
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

              {project.details ? (
                <div className="space-y-6">
                  {project.details.overview ? (
                    <section>
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Overview</h4>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {project.details.overview}
                      </p>
                    </section>
                  ) : null}

                  {project.details.coreConcept ? (
                    <section>
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Core Concept</h4>
                      {project.details.coreConcept.summary ? (
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">
                          {project.details.coreConcept.summary}
                        </p>
                      ) : null}
                      {project.details.coreConcept.bullets?.length ? (
                        <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                          {project.details.coreConcept.bullets.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ) : null}

                  {project.details.features?.length ? (
                    <section>
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Key Features</h4>
                      <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                        {project.details.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {project.details.technical && (
                    <section className="space-y-4">
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-100">Technical Architecture</h4>
                      {project.details.technical.frontendStack?.length ? (
                        <div>
                          <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Frontend Stack</h5>
                          <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                            {project.details.technical.frontendStack.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {project.details.technical.projectStructure?.length ? (
                        <div>
                          <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Project Structure</h5>
                          <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                            {project.details.technical.projectStructure.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {project.details.technical.deployment?.length ? (
                        <div>
                          <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Deployment</h5>
                          <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                            {project.details.technical.deployment.map((item) => (
                              <li key={item}>{item}</li>
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


