import HomeClient from './HomeClient'
import { getNavigationGreeting } from '../lib/server-i18n'

/**
 * Server component for the home page.
 * Fetches locale-specific greeting and passes it to the client component.
 * 
 * @param props - Page component props
 * @param props.params - Route parameters
 * @param props.params.locale - Locale code from URL
 * 
 * @returns HomeClient component with greeting prop
 */
export default async function Home({ params }: { params: { locale: string } }) {
  const greeting = await getNavigationGreeting(params.locale)
  return <HomeClient greeting={greeting} />
}

/**
 * Generate static params for all supported locales.
 * Used by Next.js for static site generation.
 * 
 * @returns Array of locale params for static generation
 */
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'fr' },
    { locale: 'es' }
  ]
}



