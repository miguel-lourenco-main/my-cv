"use client";

import { cn } from "../lib/utils";
import { useState } from "react";

export default function EmailButton({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setShowFeedback(true);
    
    // Reset feedback after 2 seconds
    setTimeout(() => {
      setShowFeedback(false);
      setIsClicked(false);
    }, 2000);
  };

  return (
    <a
      href="mailto:migasoulou@gmail.com"
      className={cn(
        "flex items-center rounded-md px-4 py-2 space-x-2 text-slate-800 font-bold dark:text-slate-200 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:scale-125 active:scale-95",
        isClicked && "scale-95 bg-green-50 dark:bg-green-900/20",
        className
      )}
      onClick={handleClick}
    >
      <svg 
        width={width} 
        height={height} 
        fill="none" 
        stroke={isClicked ? "#16a34a" : "currentColor"} 
        viewBox="0 0 24 24"
        className="transition-colors duration-200"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    </a>
  );
}