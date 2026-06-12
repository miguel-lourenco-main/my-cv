"use client";

import type { ReactNode } from "react";
import { SmoothScrollProvider } from "../scroll/SmoothScrollProvider";

type ParallaxRootProps = {
  children: ReactNode;
};

export default function ParallaxRoot({ children }: ParallaxRootProps) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
