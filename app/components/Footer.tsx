import { useI18n } from '../lib/i18n'

export default function Footer() {
  const { t } = useI18n()
  const tf = t('footer')
  return (
    <footer className="py-8 text-center">
      <p className="text-slate-400">
        {`Miguel Lourenço. ${tf('builtWith')}`}
      </p>
    </footer>
  )
} 