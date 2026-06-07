"use client";

import type { ReactNode } from "react";

type ParallaxRootProps = {
  children: ReactNode;
};

export default function ParallaxRoot({ children }: ParallaxRootProps) {
  return <>{children}</>;
}
