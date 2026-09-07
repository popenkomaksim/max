import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import profile from '../data/profile.json'
import AnimatedText from '../components/AnimatedText.jsx'
import ScrambleText from '../components/ScrambleText.jsx'
import useChromeReveal from '../hooks/useChromeReveal.js'
import { daysSince, formatDays } from '../lib/daysCounter.js'

// Order of the entrance cascade in `.stagger` (50ms per child), used to delay
// the letter-level animations so they start as their own section fades in.
const STATEMENT_DELAY = 0.3

// Seconds per letter in the statement's entrance animation; line 2 is offset by
// line 1's letter count so the two lines read as one continuous sweep.
const LETTER_STEP = 0.035

// Run time of a single letter, mirroring `animation.letter-in` in
// tailwind.config.js — the last letter *starts* one step before the end of the
// sweep, so the statement isn't fully rendered until this has elapsed too.
const LETTER_DURATION = 0.55

// Swaps the `{days1}`/`{days2}`/`{days3}` placeholders in a localised sentence
// for scrambling counters. Capturing just the digit makes `split` alternate
// literal text and token index — parts[0] text, parts[1] "1", parts[2] text, …
function renderDaysCounter(template, counters) {
  return template.split(/\{days(\d)\}/).map((part, i) => {
    if (i % 2 === 0) return part
    const { text, startDelay } = counters[Number(part) - 1]
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
  const line1LetterCount = t.home.statementLine1.replace(/\s/g, '').length
  const line2LetterCount = t.home.statementLine2.replace(/\s/g, '').length

  // The statement is the last thing on the page to finish animating, so the
  // navbar and footer wait for it: copy first, then the frame around it.
  useChromeReveal(
    STATEMENT_DELAY + (line1LetterCount + line2LetterCount) * LETTER_STEP + LETTER_DURATION,
  )

  return (
    <div className="stagger mx-auto max-w-[36.375rem] text-sm font-book leading-5 tracking-tightish text-slate-600 dark:text-slate-300">
      <header className="flex flex-col gap-1 pb-2">
        <h1 className="font-medium text-slate-900 dark:text-white">{profile.name}</h1>
        <p className="text-slate-400 dark:text-slate-500">{p.title}</p>
      </header>

      <p className="pt-4">{p.tagline}</p>

      <p className="pt-4">{p.bio}</p>

      <ul className="list-disc pt-4 pl-4 marker:text-slate-300 dark:marker:text-slate-600">
        {p.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>

      {/* The days counter closes the prose block: last paragraph of the article
          is the position that carries the most weight in this layout. */}
      <p className="pt-4">
        {renderDaysCounter(t.home.daysCounterTemplate, [
          { text: formatDays(daysSince(8, 9, 1990), lang), startDelay: 0.2 },
          { text: formatDays(daysSince(20, 2, 2014), lang), startDelay: 0.5 },
          { text: formatDays(daysSince(24, 2, 2022), lang), startDelay: 0.8 },
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
            text={t.home.statementLine1}
            startDelay={STATEMENT_DELAY}
            step={LETTER_STEP}
            className="text-slate-900 dark:text-white"
          />
          <br />
          <AnimatedText
            text={t.home.statementLine2}
            startDelay={STATEMENT_DELAY + line1LetterCount * LETTER_STEP}
            step={LETTER_STEP}
            className="text-slate-400 dark:text-slate-500"
          />
        </p>
      </section>
    </div>
  )
}
