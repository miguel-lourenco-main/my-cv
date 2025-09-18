export default function EmailButton() {
  return (
    <a
        href="mailto:migasoulou@gmail.com"
        className="flex items-center rounded-md px-4 py-2 space-x-2 text-slate-800 font-bold dark:text-slate-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
    >
        <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
    </a>
  );
}