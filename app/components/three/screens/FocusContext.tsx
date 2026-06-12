'use client'

import { createContext, useContext } from 'react'
import type { ScreenId } from '../camera/layout'

export interface FocusValue {
  focusedId: ScreenId | null
  focus: (id: ScreenId) => void
  clear: () => void
}

export const FocusContext = createContext<FocusValue | null>(null)

export function useFocus(): FocusValue {
  const v = useContext(FocusContext)
  if (!v) throw new Error('useFocus must be used within FocusContext')
  return v
}
