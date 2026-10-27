import { useLayoutEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { CROWD_SIZE, GROUPS, PICK, POST, STATES, STATE_KEYS, drawCrowd } from '../data/sensorStatus.js'

// Prose column shared with the other content pages; the tile grid breaks out
// of it to the full layout width.
const PROSE = 'mx-auto max-w-[36.375rem]'

// Locale tags for the publication date — the site's `uk`/`en` keys aren't
// region-specific enough for Intl on their own.
const DATE_LOCALES = { uk: 'uk-UA', en: 'en-GB' }

// One aerial crop per tile, named by tile number (01.jpg … 30.jpg). Each is
// 1296×256: the swatch's exact 3 × 540:320 aspect at 2× the widest card, so
// object-cover neither crops nor upscales it.
const MAPS = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/sensor-maps/*.jpg', { eager: true, import: 'default' })).map(
    ([path, url]) => [Number(path.match(/(\d+)\.jpg$/)[1]), url],
  ),
)

// Numbering runs across groups, so the shortlist can refer to tiles by number.
// Every tile gets a fleet-scale crowd up front, for the crowd view.
let tileNum = 0
const NUMBERED_GROUPS = GROUPS.map((group) => ({
  ...group,
  items: group.items.map((item) => ({
    ...item,
    num: ++tileNum,
    crowdMarkup: drawCrowd(item.draw, CROWD_SIZE),
  })),
}))

// The shortlist's combined example. Unnumbered, on the crop of the badge tile
// it builds on.
const PICK_ITEM = { ...PICK, crowdMarkup: drawCrowd(PICK.draw, CROWD_SIZE) }

// Height of the site's sticky navbar, so the filter bar can stick right under
// it. Re-measured on resize, since the nav wraps at narrow widths.
function useNavbarHeight() {
  const [height, setHeight] = useState(0)
  useLayoutEffect(() => {
    const nav = document.querySelector('header.sticky')
    if (!nav) return
    const observer = new ResizeObserver(() => setHeight(nav.offsetHeight))
    observer.observe(nav)
    return () => observer.disconnect()
  }, [])
  return height
}

function Tile({ item, lang, copy, crowd }) {
  const { n, d, no } = item[lang]
  const tags = [
    ...(no ? [{ id: 'rejected', label: copy.rejected, rejected: true }] : []),
    { id: item.k, label: copy.kinds[item.k], std: item.k === 'std' },
    ...item.t.map((trait) => ({ id: trait, label: copy.traits[trait] })),
  ]

  return (
    <article
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-md border ${
        no ? 'border-rose-200 dark:border-rose-900/70' : 'border-slate-100 dark:border-slate-800'
      }`}
    >
      {/* A not-recommended variant is struck through corner to corner, over
          the swatch and the copy alike. */}
      {no && (
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full text-rose-500/60 dark:text-rose-400/50"
        >
          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {/* All three states side by side over one shared map crop, so each
          variant can be compared across them at a glance. */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <div className="sensor-swatch relative">
          {/* Lazy, so the crops only load as their tiles scroll in. */}
          <img
            src={MAPS[item.map ?? item.num]}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className={`relative grid grid-cols-3 ${crowd ? 'invisible' : ''}`}>
            {STATE_KEYS.map((key) => (
              // Markup comes from the static draw functions in sensorStatus.js.
              <svg
                key={key}
                viewBox="-170 -50 540 320"
                role="img"
                aria-label={`${n} — ${copy.states[key].label}`}
                className="block h-auto w-full"
                dangerouslySetInnerHTML={{ __html: item.draw(STATES[key], key) }}
              />
            ))}
          </div>
          {crowd && (
            // Fleet-scale view, shown in place of the three states.
            <svg
              viewBox="0 0 1620 320"
              aria-hidden="true"
              className="sensor-crowd absolute inset-0 h-full w-full"
              dangerouslySetInnerHTML={{ __html: item.crowdMarkup }}
            />
          )}
        </div>
        {crowd ? (
          <p className="truncate px-2 py-1 text-center font-mono text-[11px] text-slate-400 dark:text-slate-500">
            {copy.crowdCaption(CROWD_SIZE)}
          </p>
        ) : (
          <div className="grid grid-cols-3">
            {STATE_KEYS.map((key) => (
              <p key={key} className="truncate px-2 py-1 text-center font-mono text-[11px] text-slate-400 dark:text-slate-500">
                {copy.states[key].label}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
        <h3 className="flex items-baseline gap-2 font-medium text-slate-900 dark:text-white">
          {item.num && (
            <span className="font-mono text-xs font-normal tabular-nums text-slate-300 dark:text-slate-600">
              {String(item.num).padStart(2, '0')}
            </span>
          )}
          <span className={no ? 'line-through decoration-rose-500/70' : ''}>{n}</span>
        </h3>
        <p className={`flex-1 text-[13px] text-slate-500 dark:text-slate-400 ${no ? 'line-through decoration-slate-300 dark:decoration-slate-600' : ''}`}>
          {d}
        </p>
        {no && <p className="text-[13px] text-rose-600 dark:text-rose-400">{no}</p>}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className={`border px-1.5 py-px font-mono text-[11px] ${
                tag.rejected
                  ? 'border-rose-300 text-rose-600 dark:border-rose-500/60 dark:text-rose-300'
                  : tag.std
                  ? 'border-indigo-300 text-indigo-600 dark:border-indigo-500/60 dark:text-indigo-300'
                  : 'border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500'
              }`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function SensorStatus() {
  const { lang } = useLanguage()
  const copy = POST[lang]
  const navHeight = useNavbarHeight()
  const [crowd, setCrowd] = useState(false)
  const [hideRejected, setHideRejected] = useState(false)
  const groups = NUMBERED_GROUPS.map((group) => ({
    ...group,
    items: hideRejected ? group.items.filter((item) => !item[lang].no) : group.items,
  })).filter((group) => group.items.length > 0)
  const published = new Date(POST.published).toLocaleDateString(DATE_LOCALES[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article className="sensor-sheet stagger text-sm font-book leading-5 tracking-tightish text-slate-600 dark:text-slate-300">
      <header className={`${PROSE} flex flex-col gap-1 pb-2`}>
        <p className="font-mono text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">{copy.eyebrow}</p>
        <h1 className="font-medium text-slate-900 dark:text-white">{copy.title}</h1>
        <p className="text-slate-400 dark:text-slate-500">
          <time dateTime={POST.published}>{published}</time>
        </p>
      </header>

      <div className={PROSE}>
        {copy.intro.map((paragraph) => (
          <p key={paragraph} className="pt-4">
            {paragraph}
          </p>
        ))}
        <dl className="flex flex-wrap gap-x-5 gap-y-1 pt-4 font-mono text-xs">
          {POST.sidc.map(({ key, value }) => (
            <div key={key} className="flex gap-1.5">
              <dt className="text-slate-400 dark:text-slate-500">{key}</dt>
              <dd className="text-slate-900 dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Filters stick under the site navbar for the length of the sheet. */}
      <div
        style={{ top: navHeight }}
        className="sticky z-40 -mx-4 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-slate-100 bg-white/85 px-4 py-2.5 font-mono text-xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/85 sm:-mx-6 sm:px-6"
      >
        <div role="group" aria-label={copy.filters.count} className="flex items-center gap-2">
          <span className="text-slate-400 dark:text-slate-500">{copy.filters.count}</span>
          <div className="flex">
            {[false, true].map((value) => (
              <button
                key={String(value)}
                type="button"
                aria-pressed={crowd === value}
                onClick={() => setCrowd(value)}
                className={`border px-2 py-px tabular-nums first:rounded-l last:rounded-r last:-ml-px ${
                  crowd === value
                    ? 'relative border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-500/60 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : 'border-slate-200 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {value ? CROWD_SIZE : STATE_KEYS.length}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            checked={hideRejected}
            onChange={(event) => setHideRejected(event.target.checked)}
            className="accent-indigo-600"
          />
          {copy.filters.hideRejected}
        </label>
      </div>

      <div className="pt-8">
        <div className="flex flex-col gap-12">
          {groups.map((group) => (
            <section key={group.id} className="flex flex-col gap-3">
              <h2 className="font-medium text-slate-900 dark:text-white">{group[lang].title}</h2>
              <p className="max-w-[36.375rem] text-slate-500 dark:text-slate-400">{group[lang].note}</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3.5 pt-1">
                {group.items.map((item) => (
                  <Tile key={item.num} item={item} lang={lang} copy={copy} crowd={crowd} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className={`${PROSE} mt-14 border-t border-slate-100 pt-8 dark:border-slate-800`}>
        <h2 className="font-medium text-slate-900 dark:text-white">{copy.shortlistTitle}</h2>
        <ol className="flex list-decimal flex-col gap-2.5 pt-3 pl-5 marker:text-slate-300 dark:marker:text-slate-600">
          {copy.shortlist.map(({ lead, body }) => (
            <li key={lead}>
              <span className="font-medium text-slate-900 dark:text-white">{lead}</span> {body}
            </li>
          ))}
        </ol>

        <h2 className="pt-8 font-medium text-slate-900 dark:text-white">{copy.pickTitle}</h2>
        <div className="pt-3">
          <Tile item={PICK_ITEM} lang={lang} copy={copy} crowd={crowd} />
        </div>

        <h2 className="pt-8 font-medium text-slate-900 dark:text-white">{copy.limitsTitle}</h2>
        <ul className="flex flex-col gap-2 pt-3">
          {copy.limits.map((limit) => (
            <li key={limit}>
              <span className="mr-2 text-slate-300 dark:text-slate-600">—</span>
              {limit}
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
