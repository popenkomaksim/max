import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import beliefs from '../data/beliefs.json'

export default function Beliefs() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="flex flex-col gap-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.beliefs.title}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{t.beliefs.subtitle}</p>
      </div>

      <ol className="flex flex-col">
        {beliefs.map((belief, index) => {
          const b = belief[lang]
          return (
            <li
              key={belief.id}
              className="border-t border-slate-200 py-10 first:border-t-0 first:pt-0 dark:border-slate-800"
            >
              <h2 className="flex items-baseline gap-4 text-lg font-semibold">
                <span className="font-mono text-sm font-normal text-slate-400 dark:text-slate-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {b.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 pl-9">
                {b.points.map((point) => (
                  <li key={point} className="text-slate-600 dark:text-slate-300">
                    <span className="mr-2 text-slate-300 dark:text-slate-700">—</span>
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
