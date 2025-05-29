import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Your Portfolio | Full Stack Developer',
  description: 'Portfolio and CV of [Your Name] - Full Stack Developer specializing in modern web technologies',
  keywords: 'portfolio, developer, full stack, web development, react, nextjs',
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yoursite.com',
    title: 'Your Portfolio | Full Stack Developer',
    description: 'Portfolio and CV of [Your Name] - Full Stack Developer',
    siteName: 'Your Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Portfolio | Full Stack Developer',
    description: 'Portfolio and CV of [Your Name] - Full Stack Developer',
    creator: '@yourusername',
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
        {children}
      </body>
    </html>
  )
} 