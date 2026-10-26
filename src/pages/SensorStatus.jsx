import { useLanguage } from '../context/LanguageContext.jsx'
import { GROUPS, POST, STATES, STATE_KEYS } from '../data/sensorStatus.js'

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
let tileNum = 0
const NUMBERED_GROUPS = GROUPS.map((group) => ({
  ...group,
  items: group.items.map((item) => ({ ...item, num: ++tileNum })),
}))

function Tile({ item, lang, copy }) {
  const { n, d } = item[lang]
  const tags = [
    { id: item.k, label: copy.kinds[item.k], std: item.k === 'std' },
    ...item.t.map((trait) => ({ id: trait, label: copy.traits[trait] })),
  ]

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-md border border-slate-100 dark:border-slate-800">
      {/* All three states side by side over one shared map crop, so each
          variant can be compared across them at a glance. */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <div className="sensor-swatch relative">
          {/* Lazy, so the crops only load as their tiles scroll in. */}
          <img
            src={MAPS[item.num]}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative grid grid-cols-3">
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
        </div>
        <div className="grid grid-cols-3">
          {STATE_KEYS.map((key) => (
            <p key={key} className="truncate px-2 py-1 text-center font-mono text-[11px] text-slate-400 dark:text-slate-500">
              {copy.states[key].label}
            </p>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
        <h3 className="flex items-baseline gap-2 font-medium text-slate-900 dark:text-white">
          <span className="font-mono text-xs font-normal tabular-nums text-slate-300 dark:text-slate-600">
            {String(item.num).padStart(2, '0')}
          </span>
          {n}
        </h3>
        <p className="flex-1 text-[13px] text-slate-500 dark:text-slate-400">{d}</p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className={`border px-1.5 py-px font-mono text-[11px] ${
                tag.std
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

      <div className="pt-10">
        <div className="flex flex-col gap-12">
          {NUMBERED_GROUPS.map((group) => (
            <section key={group.id} className="flex flex-col gap-3">
              <h2 className="font-medium text-slate-900 dark:text-white">{group[lang].title}</h2>
              <p className="max-w-[36.375rem] text-slate-500 dark:text-slate-400">{group[lang].note}</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3.5 pt-1">
                {group.items.map((item) => (
                  <Tile key={item.num} item={item} lang={lang} copy={copy} />
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
