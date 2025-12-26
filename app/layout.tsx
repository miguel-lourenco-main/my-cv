import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

/**
 * Root layout metadata for SEO and social sharing.
 */
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

/**
 * Root layout component wrapping the entire application.
 * Provides theme provider, font loading, and scroll restoration handling.
 * 
 * @param props - RootLayout component props
 * @param props.children - Application content
 * 
 * @returns Root HTML structure with providers
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`} suppressHydrationWarning>
        {/* Disable browser scroll restoration to prevent unwanted scroll positions */}
        <Script id="disable-scroll-restoration" strategy="beforeInteractive">{`
          (function(){
            try {
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
            } catch (_) {}

            var docEl = document.documentElement;
            var previous = docEl.style.scrollBehavior;
            docEl.style.scrollBehavior = 'auto';
            window.scrollTo(0, 0);
            docEl.style.scrollBehavior = previous;

            window.addEventListener('pageshow', function(event) {
              if (event.persisted) {
                var previousPersisted = docEl.style.scrollBehavior;
                docEl.style.scrollBehavior = 'auto';
                window.scrollTo(0, 0);
                docEl.style.scrollBehavior = previousPersisted;
              }
            });
          })();
        `}</Script>
        {children}
      </body>
    </html>
  )
} 