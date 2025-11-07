import EmailButton from "./EmailButton";
import GitlabButton from "./GitlabButton";
import LinkedInButton from "./LinkedInButton";
import { useI18n } from "../lib/i18n";

export default function Contact({ isLaptop = false }: { isLaptop?: boolean }) {
  const { t } = useI18n();
  const tc = t('contact');
  
  const sectionClasses = [
    "max-w-7xl mx-auto",
    isLaptop ? "h-screen flex-none snap-center flex items-center justify-center py-0" : "py-20"
  ].filter(Boolean).join(" ");

  return (
    <section id="contact" className={sectionClasses}>
      <div className="text-center w-full">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{tc('title')}</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">{tc('subtitle')}</p>
        {/* Social Links */}
        <div className="flex justify-center space-x-6">
          <GitlabButton width={46} height={46} />
          <LinkedInButton width={42} height={42} />
          <EmailButton width={52} height={52} />
        </div>
      </div>
    </section>
  )
} 