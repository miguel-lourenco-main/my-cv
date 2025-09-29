"use client";

import React, { useEffect, useRef } from "react";
import { Reveal, RevealStagger } from "../Reveal";

type CategoryCardProps = {
  title: string;
  items: string[];
  children: React.ReactNode;
};

export default function CategoryCard({ title, items, children }: CategoryCardProps) {
  const iconsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = iconsContainerRef.current;
    if (!container) return;

    const updateDistances = () => {
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const centerY = containerRect.top + containerRect.height / 2;

      const iconElements = Array.from(
        container.querySelectorAll<HTMLElement>("[data-icon-item='true']")
      );

      if (iconElements.length === 0) return;

      const distances = iconElements.map((el) => {
        const r = el.getBoundingClientRect();
        const elCenterX = r.left + r.width / 2;
        const elCenterY = r.top + r.height / 2;
        return Math.hypot(elCenterX - centerX, elCenterY - centerY);
      });

      const maxDistance = Math.max(1, ...distances);

      iconElements.forEach((el, idx) => {
        const ratio = distances[idx] / maxDistance * -1.7; // 0..1
        el.style.setProperty("--dist-ratio", ratio.toFixed(3));
      });
    };

    updateDistances();

    const resizeObserver = new ResizeObserver(() => updateDistances());
    resizeObserver.observe(container);

    const handleWindowResize = () => updateDistances();
    window.addEventListener("resize", handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [children]);

  return (
    <Reveal type="fade" className="group flex flex-col gap-y-8 items-center justify-center h-full p-12 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden">
      <RevealStagger className="flex flex-col items-center text-center" delay={0.05} interval={0.06}>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{items.join(', ')}</p>
      </RevealStagger>
      <div ref={iconsContainerRef} className="mt-6 flex flex-wrap items-center justify-center gap-6 group-hover:scale-110 transition-transform duration-300 ease-in-out">
        {React.Children.map(children, (child, idx) => (
          <Reveal key={idx} type="slide" direction="up" delay={0.1 + idx * 0.06}>
            <div
              data-icon-item="true"
              className="transform transition-transform duration-300 ease-in-out group-hover:translate-y-[calc(var(--dist-ratio,0)*8px)]"
            >
              {child}
            </div>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}
