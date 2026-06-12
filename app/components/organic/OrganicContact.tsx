'use client'

import { Mail, Linkedin } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useGsap, gsap } from '../scroll/useGsap'

const LINKS = [
  { label: 'Email', value: 'migasoulou@gmail.com', href: 'mailto:migasoulou@gmail.com', icon: 'mail' },
  { label: 'LinkedIn', value: 'in/miguel-lourenço', href: 'https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/', icon: 'linkedin' },
  { label: 'GitLab', value: 'miguel-lourenco-main', href: 'https://gitlab.com/miguel-lourenco-main', icon: 'gitlab' },
]

export default function OrganicContact() {
  const { t } = useI18n()
  const tc = t('contact')

  const scope = useGsap<HTMLElement>(() => {
    gsap.from('[data-c-in]', {
      opacity: 0, y: 36, filter: 'blur(10px)', duration: 0.9, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '#contact', start: 'top 75%' },
    })
  }, [])

  return (
    <section ref={scope} id="contact" className="relative px-6 py-32">
      <div data-c-in className="org-glass mx-auto max-w-3xl rounded-[2rem] p-10 text-center sm:p-14">
        <h2 className="org-display text-4xl font-semibold text-white sm:text-6xl">{tc('title')}</h2>
        <p className="mx-auto mt-5 max-w-xl text-white/70">{tc('subtitle')}</p>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="org-glass org-glass-hover group flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-white"
            >
              {l.icon === 'mail' && <Mail className="size-4 text-emerald-300" />}
              {l.icon === 'linkedin' && <Linkedin className="size-4 text-emerald-300" />}
              {l.icon === 'gitlab' && (
                <svg viewBox="0 0 24 24" className="size-4 fill-emerald-300">
                  <path d="m12 21.42 3.684-11.333H8.32L12 21.42ZM3.16 10.087 2.04 13.53a.763.763 0 0 0 .277.853L12 21.42 3.16 10.087Zm5.16 0H3.16l1.57-4.823a.27.27 0 0 1 .513 0L8.32 10.087Zm12.52 0 1.12 3.443a.763.763 0 0 1-.277.853L12 21.42l8.84-11.333Zm0 0h-5.16l3.077-9.46a.27.27 0 0 1 .513 0l1.57 9.46Z" />
                </svg>
              )}
              <span className="text-sm">{l.value}</span>
            </a>
          ))}
        </div>
      </div>

      <footer data-c-in className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-between gap-3 px-2 text-xs text-white/45">
        <span>© {new Date().getFullYear()} Miguel Lourenço</span>
        <span>Built with Next.js · WebGL · static export</span>
      </footer>
    </section>
  )
}
