import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import NumberedSections from '../components/NumberedSections.jsx'
import guidelines from '../data/guidelines.json'

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

      <NumberedSections sections={guidelines.map((section) => ({ id: section.id, ...section[lang] }))} />
    </div>
  )
}
