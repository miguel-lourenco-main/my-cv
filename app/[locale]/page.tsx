import HomeClient from './HomeClient'

export default function Home() {
  return <HomeClient />
}

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'fr' },
    { locale: 'es' }
  ]
}



