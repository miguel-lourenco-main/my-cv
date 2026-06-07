import { isValidLocale } from '../i18n'
import { TranslationProvider, type InitialTranslations } from '../i18n/TranslationProvider'
import { loadCoreTranslations } from '../lib/server-i18n'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) {
    return <div>Locale not found</div>
  }

  const initialResources = (await loadCoreTranslations(params.locale)) as InitialTranslations

  return (
    <TranslationProvider locale={params.locale} initialResources={initialResources}>
      {children}
    </TranslationProvider>
  )
}
