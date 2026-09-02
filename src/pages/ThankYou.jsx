import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'

export default function ThankYou() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <img
        src="/smile.jpeg"
        alt={t.thankYou.imageAlt}
        className="h-60 w-60 rounded-full object-cover shadow-lg"
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.thankYou.title}</h1>
        <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">{t.thankYou.message}</p>
      </div>
      <Link
        to="/"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        {t.thankYou.backHome}
      </Link>
    </div>
  )
}
