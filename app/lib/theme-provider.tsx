'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'

/**
 * Theme provider wrapper component that configures next-themes with app-specific defaults.
 * Provides theme context to the application with dark mode as default and system preference detection.
 * 
 * @param props - Props from NextThemesProvider, including children, defaultTheme, storageKey, etc.
 * @param props.children - React children to wrap with theme context
 * @param props.defaultTheme - Override default theme (defaults to 'dark' if not provided)
 * @param props.storageKey - Key for localStorage (defaults to 'theme')
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
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

/**
 * Hook to access and control the theme from next-themes.
 * Re-exported for backwards compatibility with existing imports.
 * 
 * @returns Object with theme, setTheme, resolvedTheme, and systemTheme properties
 * 
 * @example
 * ```tsx
 * const { theme, setTheme } = useTheme();
 * setTheme('dark');
 * ```
 */
export const useTheme = useNextTheme