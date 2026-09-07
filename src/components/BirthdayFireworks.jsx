import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'

// 8 September 1990 — the same date the home page counts days from.
const BIRTH_DAY = 8
const BIRTH_MONTH = 9
const BIRTH_YEAR = 1990

// Spacing between shells, and the beat the greeting gets to itself before the
// first one goes up. The show is one burst per year lived, so its length grows
// by a third of a second every birthday.
const BURST_INTERVAL = 320
const GREETING_LEAD = 500
const GREETING_DURATION = 3600
const GREETING_FADE = 700

// Fired in pairs from the same point — a wide, slow half and a tight, fast one
// — which is what reads as a shell bursting rather than a puff of confetti.
const BURST_SHAPES = [
  { spread: 62, startVelocity: 42, particleCount: 34, decay: 0.92, scalar: 1 },
  { spread: 130, startVelocity: 26, particleCount: 22, decay: 0.9, scalar: 0.8 },
]

// Anywhere across the upper half — the greeting sits in the bottom corner, so
// the shells have the full width to themselves.
function randomOrigin() {
  return { x: 0.1 + Math.random() * 0.8, y: 0.15 + Math.random() * 0.3 }
}

// The show runs once a year, so the library is fetched only on the day rather
// than riding in the main bundle for the other 364.
export default function BirthdayFireworks() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [searchParams] = useSearchParams()
  // false → absent, 'in' → held, 'out' → fading; the last step is what keeps
  // the greeting from vanishing on a frame.
  const [greeting, setGreeting] = useState(false)

  // `?birthday=1` runs the show on any date, for previewing it out of season.
  const forced = searchParams.get('birthday') === '1'

  useEffect(() => {
    const today = new Date()
    const isBirthday = today.getDate() === BIRTH_DAY && today.getMonth() === BIRTH_MONTH - 1
    if (!isBirthday && !forced) return

    // Same opt-out the CSS entrance animations honour.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Years lived, so the show counts the birthdays rather than a fixed number.
    const bursts = Math.max(1, today.getFullYear() - BIRTH_YEAR)
    const timers = []
    let confetti
    let cancelled = false

    setGreeting('in')
    timers.push(setTimeout(() => setGreeting('out'), GREETING_DURATION - GREETING_FADE))
    timers.push(setTimeout(() => setGreeting(false), GREETING_DURATION))

    import('canvas-confetti').then((module) => {
      if (cancelled) return
      confetti = module.default

      for (let i = 0; i < bursts; i += 1) {
        timers.push(
          setTimeout(() => {
            const origin = randomOrigin()
            BURST_SHAPES.forEach((shape) => confetti({ ...shape, origin, ticks: 90, disableForReducedMotion: true }))
          }, GREETING_LEAD + i * BURST_INTERVAL),
        )
      }
    })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      // Leaving the page mid-show shouldn't leave a canvas painting over it.
      confetti?.reset()
    }
  }, [forced])

  if (!greeting) return null

  return (
    <div
      // Above the confetti canvas, which parks itself at z-index 100. Pinned to
      // the bottom-right corner, clear of the viewport edge and never wider
      // than the screen it's wrapping inside.
      className={`pointer-events-none fixed bottom-6 right-4 z-[101] max-w-[calc(100vw-2rem)] transition-opacity duration-700 sm:right-6 ${
        greeting === 'out' ? 'opacity-0' : 'opacity-100'
      }`}
      role="status"
    >
      <p className="greeting-text animate-stagger-in text-right font-serif text-xl leading-tight tracking-tight text-slate-900 sm:text-2xl dark:text-white">
        {t.birthday.greeting}
      </p>
    </div>
  )
}
