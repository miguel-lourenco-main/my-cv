import { useI18n } from '../lib/i18n'

/**
 * Footer component displaying copyright and attribution information.
 * Features responsive layout with laptop-specific snap scrolling support.
 * 
 * @param props - Component props
 * @param props.isLaptop - Whether device is detected as laptop (affects layout and snap scrolling)
 * 
 * @example
 * ```tsx
 * <Footer isLaptop={false} />
 * ```
 */
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