import { useI18n } from '../lib/i18n'

export default function Footer({ isLaptop = false }: { isLaptop?: boolean }) {
  const { t } = useI18n()
  const tf = t('footer')
  
  const footerClasses = [
    "text-center",
    isLaptop ? "h-screen flex-none snap-center flex items-center justify-center py-0" : "py-8"
  ].filter(Boolean).join(" ");

  return (
    <footer className={footerClasses}>
      <p className="text-slate-400">
        {`Miguel Lourenço. ${tf('builtWith')}`}
      </p>
    </footer>
  )
} 