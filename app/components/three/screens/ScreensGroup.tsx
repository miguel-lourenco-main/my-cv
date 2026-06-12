'use client'

import { SCREEN_LAYOUT } from '../camera/layout'
import type { BridgedContexts } from '../ScreenContextBridge'
import ScreenPlane from './ScreenPlane'

/** Places every section screen around the front hemisphere. */
export default function ScreensGroup({
  bridged,
  greeting,
}: {
  bridged: BridgedContexts
  greeting: string
}) {
  return (
    <>
      {SCREEN_LAYOUT.map((slot) => (
        <ScreenPlane key={slot.id} slot={slot} bridged={bridged} greeting={greeting} />
      ))}
    </>
  )
}
