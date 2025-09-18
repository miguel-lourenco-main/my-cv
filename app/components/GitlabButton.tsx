import Image from "next/image";

export default function GitlabButton() {
  return (
    <a
        href="https://gitlab.com/miguel-lourenco-main"
        className="flex items-center rounded-md px-4 py-2 space-x-2 text-slate-800 font-bold dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
    >
        <Image src="/gitlab-logo-500.svg" alt="GitLab" width={42} height={42} />
    </a>
  );
}