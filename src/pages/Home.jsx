import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import profile from '../data/profile.json'
import AnimatedText from '../components/AnimatedText.jsx'
import ScrambleText from '../components/ScrambleText.jsx'
import { daysSince, formatDays } from '../lib/daysCounter.js'

// Order of the entrance cascade in `.stagger` (50ms per child), used to delay
// the letter-level animations so they start as their own section fades in.
const STATEMENT_DELAY = 0.25

function renderDaysCounter(template, values) {
  const tokens = ['{days1}', '{days2}', '{days3}']
  return template
    .split(new RegExp(`(${tokens.map((token) => token.replace(/[{}]/g, '\\$&')).join('|')})`))
    .map((part, i) => {
      const index = tokens.indexOf(part)
      if (index === -1) return part
      const { text, startDelay } = values[index]
      return (
        <ScrambleText
          key={i}
          text={text}
          startDelay={startDelay}
          className="font-semibold text-slate-900 dark:text-white"
        />
      )
    })
}

export default function Home() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const p = profile[lang]
  const statementLine1 = t.home.statementLine1
  const statementLine2 = t.home.statementLine2
  const line1LetterCount = statementLine1.replace(/\s/g, '').length

  const daysAlive = formatDays(daysSince(8, 9, 1990), lang)
  const daysOfAggression = formatDays(daysSince(20, 2, 2014), lang)
  const daysOfFullScaleInvasion = formatDays(daysSince(24, 2, 2022), lang)

  const pages = [
    { to: '/wishlist', label: t.nav.wishlist },
    { to: '/about', label: t.nav.about },
    { to: '/beliefs', label: t.nav.beliefs },
    { to: '/guidelines', label: t.nav.guidelines },
  ]

  return (
    <div className="stagger mx-auto max-w-[36.375rem] text-sm font-book leading-5 tracking-tightish text-slate-600 dark:text-slate-300">
      <header className="flex flex-col gap-1 pb-2">
        <h1 className="font-medium text-slate-900 dark:text-white">{profile.name}</h1>
        <p className="text-slate-400 dark:text-slate-500">{p.title}</p>
      </header>

      <p className="pt-4">{p.tagline}</p>

      <p className="pt-4">{p.bio}</p>

      {/* The days counter closes the prose block: last paragraph of the article
          is the position that carries the most weight in this layout. */}
      <p className="pt-4">
        {renderDaysCounter(t.home.daysCounterTemplate, [
          { text: daysAlive, startDelay: 0.2 },
          { text: daysOfAggression, startDelay: 0.5 },
          { text: daysOfFullScaleInvasion, startDelay: 0.8 },
        ])}
      </p>

      <p className="pt-4">
        {t.home.contactPrefix}{' '}
        <a className="basic-link" href={`mailto:${profile.links.email}`}>
          {t.home.contactLink}
        </a>
        .
      </p>

      <section className="pt-12">
        <p className="font-serif text-2xl italic leading-tight tracking-tight sm:text-3xl">
          <AnimatedText
            text={statementLine1}
            startDelay={STATEMENT_DELAY}
            className="text-slate-900 dark:text-white"
          />
          <br />
          <AnimatedText
            text={statementLine2}
            startDelay={STATEMENT_DELAY + line1LetterCount * 0.035}
            className="text-slate-400 dark:text-slate-500"
          />
        </p>
      </section>

      <section className="pt-12">
        <h2 className="border-b border-slate-100 pb-2 text-slate-400 dark:border-slate-800 dark:text-slate-500">
          {t.home.exploreTitle}
        </h2>
        <ul className="dim-list flex flex-col">
          {pages.map((page) => (
            <li key={page.to} className="dim-row border-b border-slate-100 last:border-none dark:border-slate-800">
              <Link
                to={page.to}
                className="group flex items-center justify-between gap-4 py-3 text-slate-900 dark:text-white"
              >
                {page.label}
                <span
                  aria-hidden="true"
                  className="text-slate-400 transition-transform duration-200 ease-out group-hover:translate-x-1 dark:text-slate-500"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-12">
        <h2 className="border-b border-slate-100 pb-2 text-slate-400 dark:border-slate-800 dark:text-slate-500">
          {t.home.highlightsTitle}
        </h2>
        <ul className="dim-list flex flex-col">
          {p.highlights.map((highlight) => (
            <li
              key={highlight}
              className="dim-row border-b border-slate-100 py-3 last:border-none dark:border-slate-800"
            >
              {highlight}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
