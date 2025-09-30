"use client";

import Image from "next/image";
import { cn } from "../lib/utils";
import { useState } from "react";

export default function GitlabButton({
  className,
  width,
  height,
  href = "https://gitlab.com/miguel-lourenco-main",
}: {
  className?: string;
  width: number;
  height: number;
  href?: string;
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
      href={href}
      className={cn(
        "flex items-center rounded-md px-4 py-2 space-x-2 text-slate-800 font-bold dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 hover:scale-125 active:scale-95",
        isClicked && "scale-95 bg-orange-50 dark:bg-orange-900/20",
        className
      )}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      <Image 
        src="logos/gitlab-logo-500.svg" 
        alt="GitLab" 
        width={width} 
        height={height}
        className={cn(
          "transition-all duration-200",
          isClicked && "brightness-110"
        )}
      />
    </a>
  );
}