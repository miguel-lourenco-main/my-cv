"use client";

import React, { useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTheme } from "../../lib/theme-provider";

export function ProjectCarousel({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme, systemTheme } = useTheme();

  const resolvedTheme = (theme === "system" ? systemTheme : theme) ?? "light";

  const filteredImages = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    const suffix = isDark ? "_D.png" : "_L.png";
    const candidates = images.filter((src) => src.endsWith(suffix));
    return candidates.length > 0 ? candidates : images;
  }, [images, resolvedTheme]);

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
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {filteredImages.map((src, idx) => (
            <div className="min-w-0 flex-[0_0_100%]" key={`${src}-${idx}`}>
              <img
                src={src}
                alt={`Slide ${idx + 1}`}
                className="w-full h-60 md:h-72 lg:h-80 object-cover"
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
    </div>
  );
}


