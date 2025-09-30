"use client";

import { cn } from "../lib/utils";
import { useState } from "react";

export default function LinkedInButton({
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
      href="https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/"
      className={cn(
        "flex items-center rounded-md px-4 py-2 space-x-2 text-slate-800 font-bold dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-125 active:scale-95",
        isClicked && "scale-95 bg-blue-50 dark:bg-blue-900/20",
        className
      )}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      <svg 
        width={width} 
        height={height} 
        fill={isClicked ? "#0a66c2" : "#2867b2"} 
        viewBox="0 0 24 24"
        className="transition-colors duration-200"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </a>
  );
}