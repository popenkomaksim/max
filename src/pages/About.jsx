import { Briefcase, GraduationCap, Mountain } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import experience from '../data/experience.json'
import mountains from '../data/mountains.json'

const events = [...experience, ...mountains].sort((a, b) => b.year - a.year)

const iconByType = {
  work: Briefcase,
  education: GraduationCap,
  mountain: Mountain,
}

const dotClassByType = {
  work: 'bg-indigo-600',
  education: 'bg-indigo-600',
  mountain: 'bg-emerald-600',
}

const periodClassByType = {
  work: 'text-indigo-600 dark:text-indigo-400',
  education: 'text-indigo-600 dark:text-indigo-400',
  mountain: 'text-emerald-600 dark:text-emerald-400',
}

function EventCard({ entry, lang, align }) {
  const e = entry[lang]
  const isMountain = entry.type === 'mountain'
  const isEnd = align === 'end'

  return (
    <div className={`flex flex-col ${isEnd ? 'items-end text-right' : 'items-start text-left'}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${periodClassByType[entry.type]}`}>{e.period}</p>
      <h2 className={`mt-1 flex items-center gap-2 text-lg font-semibold ${isEnd ? 'flex-row-reverse' : ''}`}>
        {isMountain ? e.name : e.role}
        {e.location && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {e.location}
          </span>
        )}
      </h2>
      {!isMountain && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{e.org}</p>}
      <p className="mt-2 text-slate-600 dark:text-slate-300">{e.summary}</p>
    </div>
  )
}

export default function About() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.about.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t.about.subtitle}</p>
      </div>

      <div className="flex items-center justify-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Briefcase size={14} className="text-indigo-600 dark:text-indigo-400" />
          {t.about.workTitle}
        </span>
        <span className="flex items-center gap-1.5">
          <Mountain size={14} className="text-emerald-600 dark:text-emerald-400" />
          {t.about.mountainsTitle}
        </span>
      </div>

      <ol className="relative flex flex-col gap-10">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-200 dark:bg-slate-800" />
        {events.map((entry) => {
          const Icon = iconByType[entry.type]
          const isMountain = entry.type === 'mountain'
          return (
            <li key={entry.id} className="relative grid grid-cols-2 gap-x-8 sm:gap-x-12">
              <div className={isMountain ? 'invisible' : ''}>
                {!isMountain && <EventCard entry={entry} lang={lang} align="end" />}
              </div>
              <div className={isMountain ? '' : 'invisible'}>
                {isMountain && <EventCard entry={entry} lang={lang} align="start" />}
              </div>
              <span
                className={`absolute left-1/2 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-white ring-4 ring-white dark:ring-slate-900 ${dotClassByType[entry.type]}`}
              >
                <Icon size={13} />
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
