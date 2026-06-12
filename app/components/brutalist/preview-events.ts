export type PreviewEvent = { type: 'show-ss'; id: string; cover: string; title: string }

type Listener = (event: PreviewEvent) => void

let listener: Listener | null = null

export const previewBus = {
  on:   (fn: Listener) => { listener = fn },
  off:  (fn: Listener) => { if (listener === fn) listener = null },
  emit: (event: PreviewEvent) => listener?.(event),
}

// Reverse channel: preview panel clicked while showing a project screenshot →
// BrutalistProjects opens that project's expanded card.
type OpenListener = (projectId: string) => void

let openListener: OpenListener | null = null

export const previewOpenBus = {
  on:   (fn: OpenListener) => { openListener = fn },
  off:  (fn: OpenListener) => { if (openListener === fn) openListener = null },
  emit: (projectId: string) => openListener?.(projectId),
}
