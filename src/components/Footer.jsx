import { Github, Linkedin, Mail } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import profile from '../data/profile.json'

const iconLinkClasses =
  'text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'

export default function Footer({ style }) {
  const year = new Date().getFullYear()
  const { lang } = useLanguage()
  const t = translations[lang]

  // mailto: is same-tab; the two profile links open in a new tab.
  const socials = [
    { label: 'GitHub', href: profile.links.github, Icon: Github, external: true },
    { label: 'LinkedIn', href: profile.links.linkedin, Icon: Linkedin, external: true },
    { label: 'Email', href: `mailto:${profile.links.email}`, Icon: Mail, external: false },
  ]

  return (
    <footer style={style} className="chrome-in border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {year} {profile.name}. {t.footer.vibecoded}
        </p>
        <div className="flex items-center gap-4">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className={iconLinkClasses}
              {...(social.external && { target: '_blank', rel: 'noreferrer' })}
            >
              <social.Icon size={20} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
