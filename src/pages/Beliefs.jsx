import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import NumberedSections from '../components/NumberedSections.jsx'
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

      <NumberedSections sections={beliefs.map((belief) => ({ id: belief.id, ...belief[lang] }))} />
    </div>
  )
}
