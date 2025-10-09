import { locales } from '../i18n'
import { TranslationProvider } from '../i18n/TranslationProvider'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate locale
  if (!locales.includes(params.locale as any)) {
    return <div>Locale not found</div>
  }

  return (
    <TranslationProvider locale={params.locale}>
      {children}
    </TranslationProvider>
  )
}


