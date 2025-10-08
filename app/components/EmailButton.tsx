"use client";

import BaseButton from "./Button";
import { cn } from "../lib/utils";

export default function EmailButton({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <BaseButton 
      href="mailto:migasoulou@gmail.com"
      className={cn("group", className)} 
      theme="green"
      target="_self"
      rel=""
    >
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 24 24"
        className="transition-colors duration-200 stroke-[#16a34a] group-hover:stroke-[#15803d]"
        fill="none"
        stroke="#16a34a"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    </BaseButton>
  );
}