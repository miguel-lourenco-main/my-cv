import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './lib/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://miguel-lourenco-main.gitlab.io/my-cv/'),
  title: 'Miguel de Sousa Lourenço | Full Stack Developer',
  description: 'Portfolio and CV of Miguel de Sousa Lourenço - Full Stack Developer specializing in modern web technologies',
  keywords: 'portfolio, developer, full stack, web development, react, nextjs, miguel lourenço',
  authors: [{ name: 'Miguel de Sousa Lourenço' }],
  creator: 'Miguel de Sousa Lourenço',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://miguel-lourenco-main.gitlab.io/my-cv/',
    title: 'Miguel de Sousa Lourenço | Full Stack Developer',
    description: 'Portfolio and CV of Miguel de Sousa Lourenço - Full Stack Developer',
    siteName: 'Miguel Lourenço Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miguel de Sousa Lourenço | Full Stack Developer',
    description: 'Portfolio and CV of Miguel de Sousa Lourenço - Full Stack Developer',
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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 