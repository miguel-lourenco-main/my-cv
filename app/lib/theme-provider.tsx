'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'

// Re-export a ThemeProvider compatible with existing imports, backed by next-themes
export function ThemeProvider(props: React.ComponentProps<typeof NextThemesProvider>) {
  const { children, defaultTheme, storageKey, ...rest } = props
  return (
    <NextThemesProvider
      attribute="class"
      enableSystem
      disableTransitionOnChange
      defaultTheme={'dark'}
      storageKey={storageKey ?? 'theme'}
      {...rest}
    >
      {children}
    </NextThemesProvider>
  )
}

// Re-export the hook so existing components can keep importing from this path
export const useTheme = useNextTheme