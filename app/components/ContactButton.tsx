"use client";

import type { ReactNode } from "react";
import BaseButton, { type ButtonTheme } from "./Button";
import { useI18n } from "../lib/i18n";

type ContactKind = "email" | "linkedin" | "gitlab";

const CONTACT_BUTTONS: Record<
  ContactKind,
  {
    href: string;
    theme: ButtonTheme;
    ariaLabelKey: string;
    target?: string;
    rel?: string;
  }
> = {
  email: {
    href: "mailto:migasoulou@gmail.com",
    theme: "green",
    ariaLabelKey: "emailAlt",
    target: "_self",
    rel: "",
  },
  linkedin: {
    href: "https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/",
    theme: "blue",
    ariaLabelKey: "linkedinAlt",
  },
  gitlab: {
    href: "https://gitlab.com/miguel-lourenco-main",
    theme: "orange",
    ariaLabelKey: "githubAlt",
  },
};

export function ContactButton({
  kind,
  href,
  className,
  children,
}: {
  kind: ContactKind;
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const config = CONTACT_BUTTONS[kind];

  return (
    <BaseButton
      href={href ?? config.href}
      className={className}
      theme={config.theme}
      target={config.target}
      rel={config.rel}
      aria-label={String(t("navigation")(config.ariaLabelKey))}
      data-contact={kind}
    >
      {children}
    </BaseButton>
  );
}
