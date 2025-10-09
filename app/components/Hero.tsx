"use client";

import { CloudDownloadIcon } from "lucide-react";
import { RevealStagger } from "./Reveal";
import NameBadge from "./identity/NameBadge";
import ProfileAvatar from "./identity/ProfileAvatar";
import { Button } from "./shadcn/button";
import { useI18n } from "../lib/i18n";

export default function Hero({ showShared = true }: { showShared?: boolean }) {
  const { locale, t } = useI18n();
  const cvPath = locale === 'pt' ? '/cv_pt.pdf' : '/cv_en.pdf';
  const th = t('hero');
  return (
    <section id="hero" className="flex flex-col max-w-7xl mx-auto gap-y-12">
      <div className="flex flex-col lg:flex-row justify-center w-full space-x-0 space-y-12 lg:space-y-0 lg:space-x-12 items-center">
        {/* Avoid double animation for shared elements; keep subtle reveal for non-shared parts if needed */}
        {showShared && (
          <ProfileAvatar
            layoutId="intro-avatar"
            width={360}
            height={216}
            imageClassName="rounded-xl object-cover"
          />
        )}
        <div className="flex flex-col items-center text-center gap-y-6"> 
          {showShared && <NameBadge layoutId="intro-name" />}
          <RevealStagger delay={2} interval={0.04}>
            <div className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              <p>
                {th('intro1')}
              </p>
              <p className="mt-8">
                <span className="font-bold">{th('intro2')}</span>
              </p>
            </div>
          </RevealStagger>
          <RevealStagger delay={2.1} interval={0.04}>
            <Button size="lg" className="gap-x-2" onClick={() => {
              const link = document.createElement('a');
              link.href = cvPath;
              link.download = "Miguel_Lourenco_CV.pdf";
              link.target = "_self";
              link.style.display = "none";
              document.body.appendChild(link);
              link.click();
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