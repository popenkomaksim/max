import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import beliefs from '../data/beliefs.json'

export default function Beliefs() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.beliefs.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t.beliefs.subtitle}</p>
      </div>

      <ol className="flex flex-col gap-6">
        {beliefs.map((belief, index) => {
          const b = belief[lang]
          return (
            <li
              key={belief.id}
              className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <h2 className="flex items-start gap-3 text-lg font-semibold">
                <span className="text-indigo-600 dark:text-indigo-400">{String(index + 1).padStart(2, '0')}</span>
                {b.heading}
              </h2>
              <ul className="mt-3 flex flex-col gap-2 pl-9">
                {b.points.map((point) => (
                  <li key={point} className="list-disc text-slate-600 marker:text-slate-400 dark:text-slate-300">
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
