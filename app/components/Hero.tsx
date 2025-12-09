"use client";

import { CloudDownloadIcon } from "lucide-react";
import { RevealStagger } from "./Reveal";
import NameBadge from "./identity/NameBadge";
import ProfileAvatar from "./identity/ProfileAvatar";
import { Button } from "./shadcn/button";
import { useI18n } from "../lib/i18n";

/**
 * Hero section component displaying profile information and introduction.
 * Features animated reveals, CV download functionality, and responsive layout.
 * 
 * @param props - Component props
 * @param props.showShared - Whether to show shared elements (avatar, name badge) for page transitions
 * @param props.greeting - Optional greeting text to display in the name badge
 * @param props.isLaptop - Whether the device is detected as a laptop (affects layout and snap scrolling)
 * 
 * @example
 * ```tsx
 * <Hero showShared={true} greeting="Hello" isLaptop={false} />
 * ```
 */
export default function Hero({ showShared = true, greeting, isLaptop = false }: { showShared?: boolean; greeting?: string; isLaptop?: boolean }) {
  const { locale, t } = useI18n();
  // Select CV file based on locale
  const cvPath = locale === 'pt' ? '/cv_pt.pdf' : '/cv_en.pdf';
  const th = t('hero');
  
  // Build section classes with conditional laptop styling
  const sectionClasses = [
    "flex flex-col max-w-7xl mx-auto",
    isLaptop ? "h-screen flex-none snap-center justify-center" : "gap-y-12"
  ].filter(Boolean).join(" ");

  return (
    <section id="hero" className={sectionClasses}>
      <div className={`flex flex-col lg:flex-row justify-center size-full ${isLaptop ? "space-x-8 items-center" : "space-x-0 space-y-12 lg:space-y-0 lg:space-x-12 items-center"}`}>
        {/* Avoid double animation for shared elements; keep subtle reveal for non-shared parts if needed */}
        {showShared && (
          <ProfileAvatar
            layoutId="intro-avatar"
            width={isLaptop ? 320 : 360}
            height={isLaptop ? 192 : 216}
            imageClassName="rounded-xl object-cover"
          />
        )}
        <div className={`flex flex-col items-center text-center ${isLaptop ? "gap-y-4" : "gap-y-6"}`}> 
          {showShared && <NameBadge layoutId="intro-name" greeting={greeting} />}
          <RevealStagger delay={2} interval={0.04}>
            <div className={`text-xl sm:text-2xl text-slate-600 dark:text-slate-300 ${isLaptop ? "mb-6" : "mb-8"} max-w-2xl mx-auto`}>
              <p>
                {th('intro1')}
              </p>
              <p className={isLaptop ? "mt-6" : "mt-8"}>
                <span className="font-bold">{th('intro2')}</span>
              </p>
            </div>
          </RevealStagger>
          <RevealStagger delay={2.1} interval={0.04}>
            <Button size="lg" className="gap-x-2" onClick={() => {
              // Programmatically trigger CV download
              const link = document.createElement('a');
              link.href = cvPath;
              link.download = "Miguel_Lourenco_CV.pdf";
              link.target = "_self";
              link.style.display = "none";
              document.body.appendChild(link);
              link.click();
              // Clean up temporary link element
              setTimeout(() => {
                document.body.removeChild(link);
              }, 100);
            }}>
              <span className="font-semibold text-lg">{th('ctaDownloadCv')}</span>
              <CloudDownloadIcon className="size-6"/>
            </Button>
          </RevealStagger>
        </div>
      </div>
    </section>
  )
} 