import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import guidelines from '../data/guidelines.json'

function renderPoint(text) {
  return text.split(/(`[^`]+`)/g).map((chunk, index) => {
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          {chunk.slice(1, -1)}
        </code>
      )
    }
    return chunk
  })
}

export default function Guidelines() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="flex flex-col gap-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.guidelines.title}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          {t.guidelines.subtitle}{' '}
          <a
            href="https://interfaces.rauno.me/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900 dark:decoration-slate-700 dark:hover:text-white"
          >
            interfaces.rauno.me
          </a>
        </p>
      </div>

      <ol className="flex flex-col">
        {guidelines.map((section, index) => {
          const s = section[lang]
          return (
            <li
              key={section.id}
              className="border-t border-slate-200 py-10 first:border-t-0 first:pt-0 dark:border-slate-800"
            >
              <h2 className="flex items-baseline gap-4 text-lg font-semibold">
                <span className="font-mono text-sm font-normal text-slate-400 dark:text-slate-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {s.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 pl-9">
                {s.points.map((point) => (
                  <li key={point} className="text-slate-600 dark:text-slate-300">
                    <span className="mr-2 text-slate-300 dark:text-slate-700">—</span>
                    {renderPoint(point)}
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
