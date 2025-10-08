"use client";

import { CloudDownloadIcon } from "lucide-react";
import { RevealStagger } from "./Reveal";
import NameBadge from "./identity/NameBadge";
import ProfileAvatar from "./identity/ProfileAvatar";
import { Button } from "./shadcn/button";

export default function Hero({ showShared = true }: { showShared?: boolean }) {
  return (
    <section className="pt-48 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col max-w-7xl mx-auto gap-y-12">
        <div className="flex justify-center w-full space-x-12 items-center">
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
                  I’m an engineer who thrives on building systems and has hands-on experience across all aspects of the development process, from architecting repositories and shaping user experrience flows to building intuitive UIs and implementing core backend features.
                </p>
                <p className="mt-8">
                  I enjoy working across the stack and collaborating with teams, and <span className="font-bold">I'm now looking for a role where I can continue to grow as an engineer.</span>
                </p>
              </div>
            </RevealStagger>
            <RevealStagger delay={2.1} interval={0.04}>
              <Button size="lg" className="gap-x-2" onClick={() => {
                const link = document.createElement('a');
                link.href = "cv.pdf";
                link.download = "Miguel_Lourenco_CV.pdf";
                link.target = "_self";
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                  document.body.removeChild(link);
                }, 100);
              }}>
                <span className="font-semibold text-lg">Download CV</span>
                <CloudDownloadIcon className="size-6"/>
              </Button>
            </RevealStagger>
          </div>
        </div>
      </div>
    </section>
  )
} 