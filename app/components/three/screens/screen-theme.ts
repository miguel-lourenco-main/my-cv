import type { ScreenId } from '../camera/layout'

/** Per-screen accent colour (shared by the bezel/rim and the content stage). */
export const SCREEN_ACCENT: Record<ScreenId, string> = {
  about: '#5b8bff',
  tech: '#36d6c3',
  projects: '#c084fc',
  contact: '#ffb454',
}

export type StageKind = 'cosmic' | 'hud' | 'aurora' | 'terminal'

export interface ScreenTheme {
  kind: StageKind
  eyebrow: string
  title: string
  lead: string
}

/**
 * Every window uses the Holographic HUD art direction, each with its own accent
 * and a short storytelling header. Scoped to the immersive shell only.
 */
export const SCREEN_THEME: Record<ScreenId, ScreenTheme> = {
  about: {
    kind: 'hud',
    eyebrow: '// Profile',
    title: 'About',
    lead: 'The developer behind the cursor — and the CV to prove it.',
  },
  tech: {
    kind: 'hud',
    eyebrow: '// Capabilities',
    title: 'Tech Stack',
    lead: 'The tools I reach for, every day.',
  },
  projects: {
    kind: 'hud',
    eyebrow: '// Selected work',
    title: 'Projects',
    lead: 'Designed, built, and shipped to production.',
  },
  contact: {
    kind: 'hud',
    eyebrow: '// Connect',
    title: 'Get in touch',
    lead: "Open a channel — let's build something together.",
  },
}
