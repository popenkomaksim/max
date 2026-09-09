import { useState } from 'react'
import { Briefcase, GraduationCap, Mountain } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import experience from '../data/experience.json'
import mountains from '../data/mountains.json'

// One merged, newest-first ordering; `type` picks both the marker icon and the
// swim lane the entry lands in.
const events = [...experience, ...mountains].sort((a, b) => b.year - a.year)

// Studying and working share the left lane — they're the same thread of a
// career — so the icon is still what tells a job from a degree.
const iconByType = {
  work: Briefcase,
  education: GraduationCap,
  mountain: Mountain,
}

// Sits in the lane's gutter, opaque so the spine passes behind it rather than
// through it. Shared by the lane headings and the entries, which is what keeps
// both pinned to the same rail.
function LaneMarker({ icon, className = '' }) {
  // Capitalised so JSX reads it as a component rather than an `<icon>` tag.
  const Icon = icon

  return (
    <span
      className={`absolute left-0 top-0 flex h-5 w-4 items-center justify-center bg-white dark:bg-slate-900 ${className}`}
    >
      <Icon size={13} />
    </span>
  )
}

// A heading that also folds its lane away. The last visible lane renders inert
// rather than disabled: a real `disabled` button drops out of the tab order, and
// the heading is still worth reaching and reading when it's the only one left.
function LaneHeading({ icon, label, lane, hiddenLane, onToggle }) {
  const visible = hiddenLane !== lane
  // Visible while something is hidden means this is the last lane standing.
  const inert = visible && hiddenLane !== null

  return (
    <button
      type="button"
      aria-pressed={visible}
      aria-disabled={inert}
      onClick={() => onToggle(lane)}
      className={`relative flex h-5 items-center rounded-sm pl-8 text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 ${
        inert
          ? 'cursor-default'
          : 'cursor-pointer hover:text-slate-900 dark:hover:text-white'
      } ${visible ? '' : 'text-slate-300 dark:text-slate-700'}`}
    >
      <LaneMarker icon={icon} />
      {label}
    </button>
  )
}

export default function About() {
  const { lang } = useLanguage()
  const t = translations[lang]

  // Both lanes open to start with. The invariant — never hide both — lives in
  // the updater rather than only in the markup, so it holds however the toggle
  // is reached.
  const [hiddenLane, setHiddenLane] = useState(null)
  const showWork = hiddenLane !== 'work'
  const showMountains = hiddenLane !== 'mountains'

  // Showing a lane always works; hiding one only works while the other is still
  // up, so a click on the last visible heading is a no-op.
  const toggleLane = (lane) =>
    setHiddenLane((current) => (current ? (current === lane ? null : current) : lane))

  // Filtered before the `gridRow` index is taken off it: numbering the full
  // `events` array would leave a blank row wherever a hidden entry used to sit.
  const visibleEvents = events.filter((entry) =>
    entry.type === 'mountain' ? showMountains : showWork,
  )

  return (
    <div className="stagger mx-auto max-w-[36.375rem] text-sm font-book leading-5 tracking-tightish text-slate-600 dark:text-slate-300">
      <header className="flex flex-col gap-1 pb-2">
        <h1 className="font-medium text-slate-900 dark:text-white">{t.about.title}</h1>
        <p className="text-slate-400 dark:text-slate-500">{t.about.subtitle}</p>
      </header>

      {/* Heads the lane it names on `sm` and up. Below that the lanes merge
          into one column, so the pair falls back to reading as a legend for
          the markers — and as the only handle on what's currently folded away. */}
      <div className="flex gap-5 pt-4 text-slate-400 dark:text-slate-500 sm:grid sm:grid-cols-2 sm:gap-0">
        <LaneHeading
          icon={Briefcase}
          label={t.about.workTitle}
          lane="work"
          hiddenLane={hiddenLane}
          onToggle={toggleLane}
        />
        <LaneHeading
          icon={Mountain}
          label={t.about.mountainsTitle}
          lane="mountains"
          hiddenLane={hiddenLane}
          onToggle={toggleLane}
        />
      </div>

      {/* The padding sits outside the list so the spines can measure off the
          first entry rather than off the gap above it. */}
      <div className="pt-8">
        <ol className="relative grid grid-cols-1 gap-y-8 sm:grid-cols-2">
          {/* One spine per lane, each dropped along with its lane. The columns
              are an even 50/50 split with no x-gap — entries space themselves
              with their own padding instead — which is what lets the second
              rail sit at a plain 50%, and what keeps a lone visible lane on its
              own side of the page rather than recentred. */}
          {showWork && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-2 left-2 w-px -translate-x-1/2 bg-slate-100 dark:bg-slate-800"
            />
          )}
          {showMountains && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-2 left-[calc(50%+0.5rem)] hidden w-px -translate-x-1/2 bg-slate-100 sm:block dark:bg-slate-800"
            />
          )}

          {visibleEvents.map((entry, index) => {
            const e = entry[lang]
            const isMountain = entry.type === 'mountain'

            return (
              // A row of its own per entry, so the newest-first order still
              // reads straight down the page. Left to itself, grid packing
              // would pair an entry with whatever sits opposite it and imply
              // the two happened at the same time.
              <li
                key={entry.id}
                style={{ gridRow: index + 1 }}
                className={`relative pl-8 ${isMountain ? 'sm:col-start-2' : 'sm:col-start-1 sm:pr-6'}`}
              >
                <LaneMarker
                  icon={iconByType[entry.type]}
                  className="text-slate-300 dark:text-slate-600"
                />
                <p className="text-slate-400 dark:text-slate-500">{e.period}</p>
                <h2 className="font-medium text-slate-900 dark:text-white">
                  {isMountain ? e.name : e.role}
                </h2>
                <p className="text-slate-400 dark:text-slate-500">{isMountain ? e.location : e.org}</p>
                <p className="pt-2">{e.summary}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
