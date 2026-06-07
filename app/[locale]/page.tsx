import HomeClient from './HomeClient'
import { getNavigationGreeting, loadProjectImagesManifest } from '../lib/server-i18n'

export default async function Home({ params }: { params: { locale: string } }) {
  const [greeting, projectImagesManifest] = await Promise.all([
    getNavigationGreeting(params.locale),
    loadProjectImagesManifest(),
  ])

  return (
    <HomeClient greeting={greeting} projectImagesManifest={projectImagesManifest} />
  )
}

export { generateStaticLocaleParams as generateStaticParams } from '../i18n'
