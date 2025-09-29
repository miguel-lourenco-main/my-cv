"use client";

import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export function ProjectCarousel({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

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
          {images.map((src, idx) => (
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
          {images.map((_, idx) => (
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


