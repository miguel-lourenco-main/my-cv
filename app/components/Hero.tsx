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
          <RevealStagger className="flex flex-col items-center text-center gap-y-6" delay={0.1} interval={0.08}>
            {showShared && <NameBadge layoutId="intro-name" />}
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              I’m an engineer who loves building systems. I enjoy the whole lifecycle, from designing the architecture of the repository, to shaping UX flows and crafting UI's and implementing core backend features. I’m looking for a role where I can do exactly that.
            </p>
            <Button size="lg" className="gap-x-2" onClick={() => {
              const link = document.createElement('a');
              link.href = "/cv.pdf";
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
    </section>
  )
} 