'use client'

import dynamic from 'next/dynamic'
import Shell2D from './Shell2D'
import { useShellMode } from './capability/useShellMode'

// The entire 3D bundle (three / drei / postprocessing / maath) is code-split
// behind this dynamic import with `ssr:false`, so it never enters the static
// HTML and is only downloaded once the gate resolves to '3d'.
const Shell3D = dynamic(() => import('./Shell3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-[#05060a]" />,
})

/**
 * Chooses the immersive 3D shell vs the classic 2D shell based on device
 * capability (see {@link useShellMode}). Renders 2D during SSR / first paint /
 * while probing, so the static export and fallback users get the polished site.
 */
export default function ShellGate({ greeting }: { greeting: string }) {
  const mode = useShellMode()
  return mode === '3d' ? <Shell3D greeting={greeting} /> : <Shell2D greeting={greeting} />
}
