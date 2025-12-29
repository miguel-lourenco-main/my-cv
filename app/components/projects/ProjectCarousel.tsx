"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  filterProjectImagesByMode,
  type ProjectScreenshotMode,
} from "./project-images";

/**
 * Image carousel component for project galleries.
 * Features theme-aware image filtering (light/dark variants), navigation controls,
 * and a lightbox modal for full-screen viewing.
 * 
 * @param props - ProjectCarousel component props
 * @param props.images - Array of image paths (supports _L.png and _D.png suffixes for theme variants)
 * @param props.screenshotMode - User-selected screenshot mode (light or dark)
 * 
 * @example
 * ```tsx
 * <ProjectCarousel images={project.images} screenshotMode="dark" />
 * ```
 */
export function ProjectCarousel({
  images,
  screenshotMode = "dark",
}: {
  images: string[];
  screenshotMode?: ProjectScreenshotMode;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter images to the selected mode (light/dark), collapsing L/D pairs.
  const filteredImages = useMemo(() => {
    return filterProjectImagesByMode(images, screenshotMode);
  }, [images, screenshotMode]);

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
          {filteredImages.map((src, idx) => (
            <div className="min-w-0 flex-[0_0_100%]" key={`${src}-${idx}`}>
              <img
                src={src}
                alt={`Slide ${idx + 1}`}
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
        <div className="flex gap-2">
          {filteredImages.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              className={`h-2 w-2 rounded-full ${selectedIndex === idx ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-700"}`}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => emblaApi?.scrollTo(idx)}
            />
          ))}
        </div>
        <div className="flex gap-2 text-background">
          <button
            className="px-3 py-1 text-sm rounded-md bg-foreground hover:bg-muted-foreground"
            onClick={() => emblaApi?.scrollPrev()}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 text-sm rounded-md bg-foreground hover:bg-muted-foreground"
            onClick={() => emblaApi?.scrollNext()}
          >
            Next
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
        aria-label="Close"
        className="absolute top-4 right-4 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
        onClick={onClose}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <button
        aria-label="Previous image"
        className="absolute left-4 md:left-6 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        aria-label="Next image"
        className="absolute right-4 md:right-6 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="max-h-[90vh] max-w-[95vw] md:max-w-[90vw]">
        <img src={images[current]} alt="Expanded" className="object-contain w-full h-full" />
      </div>
    </div>
  );
}


