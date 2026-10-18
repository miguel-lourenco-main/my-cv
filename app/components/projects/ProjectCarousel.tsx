"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  filterProjectImagesByMode,
  type ProjectScreenshotMode,
} from "./project-images";
import { assetPath } from "../../lib/asset-path";
import { useI18n } from "../../lib/i18n";
import { useReducedMotion } from "../../lib/use-reduced-motion";
import type { ProjectVideo } from "./projects.types";

/**
 * Image carousel component for project galleries.
 * Features theme-aware image filtering (light/dark variants), navigation controls,
 * and a lightbox modal for full-screen viewing.
 * 
 * @param props - ProjectCarousel component props
 * @param props.images - Array of image paths (supports _L.png and _D.png suffixes for theme variants)
 * @param props.screenshotMode - User-selected screenshot mode (light or dark)
 * @param props.video - Optional walkthrough video, shown as the first slide. It
 *   plays (muted) while its slide is selected — unless the user prefers reduced
 *   motion — and pauses when the user slides on to the screenshots.
 * 
 * @example
 * ```tsx
 * <ProjectCarousel images={project.images} screenshotMode="dark" />
 * ```
 */
export function ProjectCarousel({
  images,
  screenshotMode = "dark",
  video,
}: {
  images: string[];
  screenshotMode?: ProjectScreenshotMode;
  video?: ProjectVideo;
}) {
  const { t } = useI18n();
  const tp = t("projects");
  const reducedMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter images to the selected mode (light/dark), collapsing L/D pairs.
  const filteredImages = useMemo(() => {
    return filterProjectImagesByMode(images, screenshotMode);
  }, [images, screenshotMode]);

  // Slide 0 is the video when there is one; images follow it.
  const videoOffset = video ? 1 : 0;
  const slideCount = filteredImages.length + videoOffset;

  // Play the video only while its slide is showing.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (selectedIndex === 0 && !reducedMotion) {
      void el.play().catch(() => {
        /* autoplay blocked: the native controls still let the user start it */
      });
    } else {
      el.pause();
    }
  }, [selectedIndex, reducedMotion]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800" ref={emblaRef}>
        <div className="flex">
          {video && (
            <div className="min-w-0 flex-[0_0_100%]" key="video">
              <video
                ref={videoRef}
                className="w-full h-60 md:h-72 lg:h-80 object-cover bg-black"
                poster={video.poster ? assetPath(video.poster) : undefined}
                muted
                loop
                playsInline
                controls
                preload="metadata"
                aria-label={tp("carousel.video")}
              >
                {video.sources?.map((s) => (
                  <source key={s.src} src={assetPath(s.src)} type={s.type} />
                ))}
                <source src={assetPath(video.src)} />
              </video>
            </div>
          )}
          {filteredImages.map((src, idx) => (
            <div className="min-w-0 flex-[0_0_100%]" key={`${src}-${idx}`}>
              <img
                src={assetPath(src)}
                alt={tp("carousel.slide", { n: idx + 1 + videoOffset })}
                loading={idx + videoOffset === selectedIndex ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-60 md:h-72 lg:h-80 object-cover cursor-zoom-in"
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {Array.from({ length: slideCount }, (_, idx) =>
            video && idx === 0 ? (
              // The video's dot is a small play triangle so it reads as "the video".
              <button
                key="dot-video"
                className={`h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent ${selectedIndex === 0 ? "border-l-slate-900 dark:border-l-slate-100" : "border-l-slate-300 dark:border-l-slate-700"}`}
                aria-label={tp("carousel.goToVideo")}
                onClick={() => emblaApi?.scrollTo(0)}
              />
            ) : (
              <button
                key={`dot-${idx}`}
                className={`h-2 w-2 rounded-full ${selectedIndex === idx ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-700"}`}
                aria-label={tp("carousel.goToSlide", { n: idx + 1 })}
                onClick={() => emblaApi?.scrollTo(idx)}
              />
            )
          )}
        </div>
        <div className="flex gap-2 text-background">
          <button
            className="px-3 py-1 text-sm rounded-md bg-foreground hover:bg-muted-foreground"
            onClick={() => emblaApi?.scrollPrev()}
          >
            {tp("carousel.prev")}
          </button>
          <button
            className="px-3 py-1 text-sm rounded-md bg-foreground hover:bg-muted-foreground"
            onClick={() => emblaApi?.scrollNext()}
          >
            {tp("carousel.next")}
          </button>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={filteredImages}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + filteredImages.length) % filteredImages.length)}
          onNext={() => setLightboxIndex((i) => (i + 1) % filteredImages.length)}
        />
      )}
    </div>
  );
}

/**
 * Full-screen lightbox modal for viewing images.
 * Supports keyboard navigation (arrow keys, escape) and backdrop click to close.
 * 
 * @param props - Lightbox component props
 * @param props.images - Array of image paths to display
 * @param props.index - Current image index
 * @param props.onClose - Close handler
 * @param props.onPrev - Previous image handler
 * @param props.onNext - Next image handler
 */
function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();
  const tp = t("projects");
  const [current, setCurrent] = useState(index);

  // Sync current index when prop changes
  useEffect(() => setCurrent(index), [index]);

  // Handle keyboard navigation and prevent body scroll
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    // Prevent body scroll when lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onPrev, onNext]);

  // Close lightbox when clicking backdrop (not the image)
  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4" onClick={handleBackdrop}>
      <button
        aria-label={t("navigation")("close")}
        className="absolute top-4 right-4 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
        onClick={onClose}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <button
        aria-label={tp("carousel.previousImage")}
        className="absolute left-4 md:left-6 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        aria-label={tp("carousel.nextImage")}
        className="absolute right-4 md:right-6 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="max-h-[90vh] max-w-[95vw] md:max-w-[90vw]">
        <img
          src={assetPath(images[current])}
          alt={tp("carousel.expanded")}
          decoding="async"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}


