"use client";

import { CloudDownloadIcon, EyeIcon } from "lucide-react";
import { RevealStagger } from "./Reveal";
import NameBadge from "./identity/NameBadge";
import ProfileAvatar from "./identity/ProfileAvatar";
import { Button } from "./shadcn/button";
import { useI18n } from "../lib/i18n";
import CvFocusModal from "./cv/CvFocusModal";
import { useEffect, useMemo, useState } from "react";

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
export default function Hero({
  showShared = true,
  greeting,
  isLaptop = false,
  onCursorModeChange,
  onCursorVisibilityChange,
}: {
  showShared?: boolean;
  greeting?: string;
  isLaptop?: boolean;
  onCursorModeChange?: (mode: "default" | "view") => void;
  onCursorVisibilityChange?: (hidden: boolean) => void;
}) {
  const { locale, t } = useI18n();
  // Select CV file based on locale
  const cvPath = locale === 'pt' ? '/cv_pt.pdf' : '/cv_en.pdf';
  const th = t('hero');
  const downloadName = "Miguel_Lourenco_CV.pdf";
  const [isFocusOpen, setIsFocusOpen] = useState(false);

  // Hide the smooth cursor while the focus modal is open (native PDF viewer shows its own cursor)
  useEffect(() => {
    onCursorVisibilityChange?.(isFocusOpen);
    if (isFocusOpen) onCursorModeChange?.("default");
  }, [isFocusOpen, onCursorModeChange, onCursorVisibilityChange]);
  
  // Function to underline specific terms in text
  const underlineText = (text: string | undefined) => {
    // Safety check: return text as-is if undefined, null, or not a string
    if (!text || typeof text !== 'string') {
      return text || '';
    }
    
    // Terms to underline: country + tools/languages mentioned in hero copy (keep in sync with i18n strings)
    const countryTerms = ["Portugal"];
    const techAndToolTerms = [
      "TypeScript/JavaScript",
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Node.js",
      "SQL/Postgres",
      "SQL",
      "Postgres",
      "REST APIs",
      "REST API",
      "APIs REST",
    ];
    const allTerms = [...countryTerms, ...techAndToolTerms];
    
    // Create a regex pattern that matches any of the terms (case-insensitive, word boundaries)
    const pattern = new RegExp(
      `(${allTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    );
    
    // Split text and wrap matches in underline spans
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add underlined match
      parts.push(
        <span key={match.index} className="underline font-semibold">
          {match[0]}
        </span>
      );
      
      lastIndex = pattern.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  // Build section classes with conditional laptop styling
  const sectionClasses = [
    "flex flex-col max-w-7xl mx-auto",
    isLaptop ? "h-screen snap-center justify-center" : "gap-y-12"
  ].filter(Boolean).join(" ");

  const handleDownload = () => {
    // Programmatically trigger CV download
    const link = document.createElement('a');
    link.href = cvPath;
    link.download = downloadName;
    link.target = "_self";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    // Clean up temporary link element
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  const focusTitle = useMemo(() => th("ctaViewCv"), [th]);
  const cvEmbedSrc = useMemo(() => {
    // Best-effort: reduce native viewer panes/toolbars where supported.
    // Note: Some browsers (notably Firefox) may ignore these parameters.
    const base = cvPath.split("#")[0];
    const rawHash = cvPath.includes("#") ? (cvPath.split("#")[1] ?? "") : "";

    const params = new Map<string, string>();
    for (const part of rawHash.split("&")) {
      const p = part.trim();
      if (!p) continue;
      const [k, v = ""] = p.split("=");
      if (!k) continue;
      params.set(k, v);
    }

    // Standard-ish viewer hints (support depends on the browser/PDF viewer).
    if (!params.has("pagemode")) params.set("pagemode", "none");
    if (!params.has("navpanes")) params.set("navpanes", "0");
    if (!params.has("toolbar")) params.set("toolbar", "0");
    // Try to scale to fill width (support varies by browser/PDF viewer).
    // Common values: page-width, FitH, Fit, or a numeric percentage.
    if (!params.has("zoom")) params.set("zoom", "page-width");
    if (!params.has("view")) params.set("view", "FitH");

    const hash = Array.from(params.entries())
      .map(([k, v]) => (v ? `${k}=${v}` : k))
      .join("&");

    return `${base}#${hash}`;
  }, [cvPath]);

  return (
    <section id="hero" className={sectionClasses}>
      <div
        className={"flex flex-col size-full items-center lg:gap-y-36 gap-y-24"}
      >
        {showShared && <NameBadge layoutId="intro-name" greeting={greeting} />}
        <div className="flex flex-col lg:flex-row size-full justify-center items-center gap-24">
          {/* Right: PDF preview + controls */}
          <RevealStagger delay={1.9} interval={0.04} className="w-full lg:size-full lg:block hidden">
            <CvPreview className="lg:block hidden" cvEmbedSrc={cvEmbedSrc} onCursorModeChange={onCursorModeChange} onCursorVisibilityChange={onCursorVisibilityChange} setIsFocusOpen={setIsFocusOpen} th={th} />
          </RevealStagger>
          <div className="flex flex-col items-center text-center gap-y-12 lg:w-full w-[75%]">
            <RevealStagger delay={2} interval={0.04}>
              <div
                className={[
                  "flex flex-col items-center text-center gap-y-8 text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto",
                ].join(" ")}
              >
                {(th("intro1") || "").split("\n\n").filter((p: string) => p.trim()).map((paragraph: string, index: number) => (
                  <p key={index}>{underlineText(paragraph)}</p>
                ))}
              </div>
            </RevealStagger>
            <RevealStagger delay={2.1} interval={0.04}>
              <Button size="lg" className="gap-x-2" onClick={handleDownload}>
                <span className="font-semibold text-lg">{th("ctaDownloadCv")}</span>
                <CloudDownloadIcon className="size-6" />
              </Button>
            </RevealStagger>
          </div>
          <RevealStagger delay={1.9} interval={0.04} className="w-full block lg:hidden flex justify-center">
            <CvPreview className="block lg:hidden" cvEmbedSrc={cvEmbedSrc} onCursorModeChange={onCursorModeChange} onCursorVisibilityChange={onCursorVisibilityChange} setIsFocusOpen={setIsFocusOpen} th={th} />
          </RevealStagger>
        </div>
      </div>

      <CvFocusModal
        open={isFocusOpen}
        onClose={() => setIsFocusOpen(false)}
        cvPath={cvEmbedSrc}
        title={focusTitle}
      />
    </section>
  )
} 

function CvPreview({ className, cvEmbedSrc, onCursorModeChange, onCursorVisibilityChange, setIsFocusOpen, th }: { className: string, cvEmbedSrc: string, onCursorModeChange?: (mode: "default" | "view") => void, onCursorVisibilityChange?: (hidden: boolean) => void, setIsFocusOpen: (open: boolean) => void, th: (key: string) => string }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    setIsSmallScreen(window.innerHeight < 1000);
  }, [window.innerHeight]);

  return (
    <div
      className={["relative isolate overflow-hidden size-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 shadow-sm", className].join(" ")}
      onMouseEnter={() => onCursorModeChange?.("view")}
      onMouseLeave={() => onCursorModeChange?.("default")}
      onPointerEnter={() => onCursorVisibilityChange?.(true)}
      onPointerLeave={() => onCursorVisibilityChange?.(false)}
    >
      <div className={["relative z-0 w-full ", isSmallScreen ? "h-[400px]" : "h-[600px]"].join(" ")}>
        <iframe
          title="CV preview"
          src={cvEmbedSrc}
          className="relative z-0 h-full w-full"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 gap-2 bg-white/90 dark:bg-slate-950/90 pointer-events-auto"
        onClick={() => setIsFocusOpen(true)}
        aria-label={th("ctaViewCv")}
      >
        <EyeIcon className="size-4" />
        <span className="font-semibold">{th("ctaViewCv")}</span>
      </Button>
    </div>
  )
}