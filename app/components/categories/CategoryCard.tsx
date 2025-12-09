"use client";

import React, { useEffect, useRef, useState } from "react";
import { RevealStagger } from "../Reveal";
import { Reveal } from "../Reveal";
import { useIsPhone } from "@/app/lib/use-mobile-detection";

/**
 * Props for the CategoryCard component.
 */
type CategoryCardProps = {
  /** Category title */
  title: string;
  /** Array of item names to display */
  items: string[];
  /** Icon elements to display */
  children: React.ReactNode;
};

/**
 * Category card component displaying skills/technologies in a category.
 * Features scroll-based activation on mobile, hover effects on desktop,
 * and animated icon positioning based on distance from center.
 * 
 * @param props - CategoryCard component props
 * @param props.title - Category title
 * @param props.items - Array of item names
 * @param props.children - Icon elements to display
 * 
 * @example
 * ```tsx
 * <CategoryCard title="Frontend" items={['React', 'Next.js']}>
 *   <IconImage src="/logos/react.svg" />
 * </CategoryCard>
 * ```
 */
export default function CategoryCard({ title, items, children }: CategoryCardProps) {
  const iconsContainerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const isPhone = useIsPhone();

  // Intersection observer for scroll-based triggering on phones
  useEffect(() => {
    if (!isPhone || !titleRef.current) return;

    const titleElement = titleRef.current;
    const cardElement = titleElement.closest('[data-category-card="true"]');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;
          const middleOfViewport = viewportHeight / 2;
          
          // Check if title is crossing the middle of the viewport
          const isCrossingMiddle = rect.top <= middleOfViewport && rect.bottom >= middleOfViewport;
          
          if (isCrossingMiddle) {
            // Deactivate all other cards first
            const allCards = document.querySelectorAll('[data-category-card="true"]');
            allCards.forEach((card) => {
              if (card !== cardElement) {
                card.classList.remove('phone-active');
              }
            });
            
            setIsActive(true);
            cardElement?.classList.add('phone-active');
          } else if (entry.intersectionRatio === 0) {
            // Title has left the viewport completely
            setIsActive(false);
            cardElement?.classList.remove('phone-active');
          }
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    observer.observe(titleElement);

    return () => {
      observer.disconnect();
    };
  }, [isPhone]);

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
    <Reveal type="fade" 
      className={`group flex flex-col gap-y-8 items-center justify-center h-full p-12 bg-white dark:bg-slate-800 rounded-lg shadow-md transition-shadow duration-300 ease-in-out overflow-hidden ${
        isPhone ? '' : 'hover:shadow-lg'
      }`}
    >
      <RevealStagger className="flex flex-col items-center text-center" delay={0.05} interval={0.06}>
        <h3 
          ref={titleRef}
          className="text-xl font-semibold text-slate-900 dark:text-white mb-2"
        >
          {title}
        </h3>
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
