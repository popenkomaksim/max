import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'

export default function NotFound() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-4xl font-bold">{t.notFound.title}</h1>
      <p className="text-slate-600 dark:text-slate-300">{t.notFound.message}</p>
      <Link
        to="/"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        {t.notFound.backHome}
      </Link>
    </div>
  )
}
