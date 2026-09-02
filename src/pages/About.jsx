import { Briefcase, GraduationCap } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import experience from '../data/experience.json'

export default function About() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.about.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t.about.subtitle}</p>
      </div>

      <ol className="relative flex flex-col gap-8 border-l border-slate-200 pl-6 dark:border-slate-800">
        {experience.map((entry) => {
          const e = entry[lang]
          return (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                {entry.type === 'education' ? <GraduationCap size={14} /> : <Briefcase size={14} />}
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                {e.period}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{e.role}</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{e.org}</p>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{e.summary}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
