import { Github, Linkedin, Mail } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import profile from '../data/profile.json'

export default function Home() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const p = profile[lang]

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col items-start gap-5">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
          {p.title}
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t.home.greetingPrefix} {profile.name.split(' ')[0]}.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">{p.tagline}</p>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">{p.bio}</p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Github size={18} /> {t.home.github}
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Linkedin size={18} /> {t.home.linkedin}
          </a>
          <a
            href={`mailto:${profile.links.email}`}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Mail size={18} /> {t.home.email}
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">{t.home.highlightsTitle}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {p.highlights.map((highlight) => (
            <li
              key={highlight}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
            >
              {highlight}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
