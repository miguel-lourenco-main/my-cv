'use client'

import type { ReactNode } from 'react'
import type { ScreenId } from '../camera/layout'
import { SCREEN_ACCENT, SCREEN_THEME, type ScreenTheme } from './screen-theme'

/**
 * Wraps a section's content in a per-window art direction (background + framing
 * + storytelling header). Four distinct styles, one per screen, so all the
 * looks are visible side by side. Lives only in the immersive shell.
 */
export default function ScreenStage({ id, children }: { id: ScreenId; children: ReactNode }) {
  const theme = SCREEN_THEME[id]
  const accent = SCREEN_ACCENT[id]
  switch (theme.kind) {
    case 'cosmic':
      return <CosmicStage accent={accent} theme={theme}>{children}</CosmicStage>
    case 'hud':
      return <HudStage accent={accent} theme={theme}>{children}</HudStage>
    case 'aurora':
      return <AuroraStage accent={accent} theme={theme}>{children}</AuroraStage>
    case 'terminal':
      return <TerminalStage accent={accent} theme={theme}>{children}</TerminalStage>
  }
}

interface StageProps {
  accent: string
  theme: ScreenTheme
  children: ReactNode
}

function Eyebrow({ accent, children, mono }: { accent: string; children: ReactNode; mono?: boolean }) {
  return (
    <div
      className={`text-xs font-semibold uppercase tracking-[0.28em] ${mono ? 'font-mono' : ''}`}
      style={{ color: accent }}
    >
      {children}
    </div>
  )
}

/* ── About · Cosmic editorial ─────────────────────────────────────────── */
function CosmicStage({ accent, theme, children }: StageProps) {
  return (
    <div
      className="relative min-h-full overflow-hidden text-white"
      style={{ background: 'radial-gradient(125% 90% at 50% -10%, #1b1145 0%, #0a0a1c 48%, #05060a 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-28 left-1/4 size-[460px] rounded-full opacity-40 blur-3xl"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 65%)` }}
        />
        <div className="absolute right-[-80px] top-1/3 size-[380px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 65%)' }} />
        <div
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.5) 0.7px, transparent 0.7px)', backgroundSize: '44px 44px' }}
        />
      </div>
      <div className="relative z-10 px-10 py-12">
        <Eyebrow accent={accent}>{theme.eyebrow}</Eyebrow>
        <h2 className="mt-3 text-5xl font-bold tracking-tight text-white">{theme.title}</h2>
        <p className="mt-3 max-w-xl text-lg text-white/55">{theme.lead}</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  )
}

/* ── Tech · Holographic HUD ───────────────────────────────────────────── */
function HudStage({ accent, theme, children }: StageProps) {
  const bracket = 'pointer-events-none absolute size-7'
  return (
    <div className="cv-scanlines relative min-h-full overflow-hidden bg-[#05080d] px-10 py-10 text-white">
      <div
        className="cv-grid-bg pointer-events-none absolute inset-0 opacity-60"
        style={{ WebkitMaskImage: 'radial-gradient(130% 80% at 50% 0, #000, transparent 75%)', maskImage: 'radial-gradient(130% 80% at 50% 0, #000, transparent 75%)' }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28" style={{ background: `linear-gradient(${accent}22, transparent)` }} />
      <span className={`${bracket} left-3 top-3 border-l-2 border-t-2`} style={{ borderColor: accent }} />
      <span className={`${bracket} right-3 top-3 border-r-2 border-t-2`} style={{ borderColor: accent }} />
      <span className={`${bracket} bottom-3 left-3 border-b-2 border-l-2`} style={{ borderColor: accent }} />
      <span className={`${bracket} bottom-3 right-3 border-b-2 border-r-2`} style={{ borderColor: accent }} />

      <div className="relative z-10">
        <Eyebrow accent={accent} mono>{theme.eyebrow}</Eyebrow>
        <h2 className="mt-2 text-4xl font-bold uppercase tracking-wide">{theme.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
            STATUS: ONLINE
          </span>
          <span className="text-white/25">·</span>
          <span>{theme.lead}</span>
        </div>
        <div className="my-6 h-px w-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
        <div>{children}</div>
      </div>
    </div>
  )
}

/* ── Projects · Glass / aurora ────────────────────────────────────────── */
function AuroraStage({ accent, theme, children }: StageProps) {
  return (
    <div className="relative min-h-full overflow-hidden bg-[#070510] px-10 py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="cv-aurora-blob absolute -left-24 -top-28 size-[480px] rounded-full opacity-40 blur-[90px]" style={{ background: accent }} />
        <div className="cv-aurora-blob absolute right-0 top-8 size-[380px] rounded-full opacity-30 blur-[90px]" style={{ background: '#22d3ee', animationDelay: '-5s' }} />
        <div className="cv-aurora-blob absolute bottom-0 left-1/3 size-[440px] rounded-full opacity-30 blur-[90px]" style={{ background: '#a855f7', animationDelay: '-9s' }} />
      </div>
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
          <Eyebrow accent={accent}>{theme.eyebrow}</Eyebrow>
        </div>
        <h2
          className="mt-3 text-5xl font-bold tracking-tight text-transparent"
          style={{ backgroundImage: `linear-gradient(90deg, #ffffff, ${accent})`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
        >
          {theme.title}
        </h2>
        <p className="mt-3 text-lg text-white/55">{theme.lead}</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  )
}

/* ── Contact · Terminal / command ─────────────────────────────────────── */
function TerminalStage({ accent, theme, children }: StageProps) {
  return (
    <div className="relative min-h-full overflow-hidden bg-[#04060a] px-10 py-10 text-white">
      <div className="cv-grid-bg pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative z-10">
        <div className="font-mono text-xs text-white/40">miguel@portfolio ~ %</div>
        <div className="mt-2 font-mono text-2xl sm:text-3xl" style={{ color: accent }}>
          &gt; establish_connection
          <span className="cv-blink">▌</span>
        </div>
        <div className="mt-2 font-mono text-sm text-white/50">{'// '}{theme.lead}</div>
        <div className="my-6 h-px w-full bg-white/10" />
        <div>{children}</div>
      </div>
    </div>
  )
}
