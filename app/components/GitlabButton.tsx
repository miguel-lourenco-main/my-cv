import Image from "next/image";

export default function GitlabButton() {
  return (
    <a
        href="https://gitlab.com/miguel-lourenco-main"
        className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
    >
        <Image src="/gitlab-logo-500.svg" alt="GitLab" width={24} height={24} />
        <span className="hidden sm:inline">GitLab</span>
    </a>
  );
}