import Image from "next/image";
import { cn } from "../lib/utils";

export default function GitlabButton({
  className,
  width,
  height,
  href = "https://gitlab.com/miguel-lourenco-main",
}: {
  className?: string;
  width: number;
  height: number;
  href?: string;
}) {
  return (
    <a
        href={href}
        className={cn("flex items-center rounded-md px-4 py-2 space-x-2 text-slate-800 font-bold dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors", className)}
        target="_blank"
        rel="noopener noreferrer"
    >
        <Image src="logos/gitlab-logo-500.svg" alt="GitLab" width={width} height={height} />
    </a>
  );
}