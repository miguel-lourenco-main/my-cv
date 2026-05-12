"use client";

import Image from "next/image";
import React, { useMemo } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  LayoutGrid,
  User,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useI18n } from "../../lib/i18n";
import type { Project } from "./projects.types";
import {
  AFFILIATION_ALL,
  AFFILIATION_PERSONAL,
  deriveCompanyFilterOptions,
  type AffiliationFilterValue,
  type ProjectSortMode,
} from "./project-browse";

type ProjectBrowseBarProps = {
  projects: Project[];
  affiliation: AffiliationFilterValue;
  onAffiliationChange: (value: AffiliationFilterValue) => void;
  sortMode: ProjectSortMode;
  onSortModeChange: (mode: ProjectSortMode) => void;
};

export function ProjectBrowseBar({
  projects,
  affiliation,
  onAffiliationChange,
  sortMode,
  onSortModeChange,
}: ProjectBrowseBarProps) {
  const { t } = useI18n();
  const tp = t("projects");
  const companyOptions = useMemo(() => deriveCompanyFilterOptions(projects), [projects]);

  return (
    <div className="mt-4 flex w-full max-w-2xl flex-col items-center gap-4">
      <div
        role="group"
        aria-label={tp("filters.sortGroupLabel")}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <IconToggle
          pressed={sortMode === "recent"}
          onClick={() => onSortModeChange("recent")}
          label={tp("filters.sortRecent")}
        >
          <ArrowDownWideNarrow className="size-5 shrink-0" aria-hidden />
        </IconToggle>
        <IconToggle
          pressed={sortMode === "start_asc"}
          onClick={() => onSortModeChange("start_asc")}
          label={tp("filters.sortOldest")}
        >
          <ArrowUpNarrowWide className="size-5 shrink-0" aria-hidden />
        </IconToggle>
      </div>

      <div
        role="group"
        aria-label={tp("filters.groupLabel")}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <IconToggle
          pressed={affiliation === AFFILIATION_ALL}
          onClick={() => onAffiliationChange(AFFILIATION_ALL)}
          label={tp("filters.all")}
        >
          <LayoutGrid className="size-5 shrink-0" aria-hidden />
        </IconToggle>
        <IconToggle
          pressed={affiliation === AFFILIATION_PERSONAL}
          onClick={() => onAffiliationChange(AFFILIATION_PERSONAL)}
          label={tp("filters.personalChip")}
        >
          <User className="size-5 shrink-0 opacity-90" aria-hidden />
        </IconToggle>
        {companyOptions.map((opt) => (
          <IconToggle
            key={opt.id}
            pressed={affiliation === opt.id}
            onClick={() => onAffiliationChange(opt.id)}
            label={tp("filters.companyChip", { company: opt.name })}
          >
            <Image
              src={opt.icon}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 object-contain"
            />
          </IconToggle>
        ))}
      </div>
    </div>
  );
}

function IconToggle({
  pressed,
  onClick,
  label,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md border transition-colors",
        pressed
          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
      )}
    >
      {children}
    </button>
  );
}
