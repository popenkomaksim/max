import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import NumberedSections from '../components/NumberedSections.jsx'
import beliefs from '../data/beliefs.json'

export default function Beliefs() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="stagger mx-auto max-w-[36.375rem] text-sm font-book leading-5 tracking-tightish text-slate-600 dark:text-slate-300">
      <header className="flex flex-col gap-1 pb-2">
        <h1 className="font-medium text-slate-900 dark:text-white">{t.beliefs.title}</h1>
        <p className="text-slate-400 dark:text-slate-500">{t.beliefs.subtitle}</p>
      </header>

      <NumberedSections sections={beliefs.map((belief) => ({ id: belief.id, ...belief[lang] }))} />
    </div>
  )
}
