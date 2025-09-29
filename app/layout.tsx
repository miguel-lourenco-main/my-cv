import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './lib/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://miguel-lourenco-main.gitlab.io/my-cv/'),
  title: 'Miguel Lourenço | Full Stack Developer',
  description: 'Portfolio and CV of Miguel Lourenço - Full Stack Developer specializing in modern web technologies',
  keywords: 'portfolio, developer, full stack, web development, react, nextjs, miguel lourenço',
  authors: [{ name: 'Miguel Lourenço' }],
  creator: 'Miguel Lourenço',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://miguel-lourenco-main.gitlab.io/my-cv/',
    title: 'Miguel Lourenço | Full Stack Developer',
    description: 'Portfolio and CV of Miguel Lourenço - Full Stack Developer',
    siteName: 'Miguel Lourenço Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miguel Lourenço | Full Stack Developer',
    description: 'Portfolio and CV of Miguel Lourenço - Full Stack Developer',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}>
        <ThemeProvider attribute="class" defaultTheme="system" storageKey="theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 