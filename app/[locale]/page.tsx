import HomeClient from './HomeClient'
import { getNavigationGreeting } from '../lib/server-i18n'

export default async function Home({ params }: { params: { locale: string } }) {
  const greeting = await getNavigationGreeting(params.locale)
  return <HomeClient greeting={greeting} />
}

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'fr' },
    { locale: 'es' }
  ]
}



