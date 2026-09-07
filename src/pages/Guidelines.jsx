import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import NumberedSections from '../components/NumberedSections.jsx'
import guidelines from '../data/guidelines.json'

export default function Guidelines() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="stagger mx-auto max-w-[36.375rem] text-sm font-book leading-5 tracking-tightish text-slate-600 dark:text-slate-300">
      <header className="flex flex-col gap-1 pb-2">
        <h1 className="font-medium text-slate-900 dark:text-white">{t.guidelines.title}</h1>
        <p className="text-slate-400 dark:text-slate-500">
          {t.guidelines.subtitle}{' '}
          <a className="basic-link" href="https://interfaces.rauno.me/" target="_blank" rel="noreferrer">
            interfaces.rauno.me
          </a>
        </p>
      </header>

      <NumberedSections sections={guidelines.map((section) => ({ id: section.id, ...section[lang] }))} />
    </div>
  )
}
