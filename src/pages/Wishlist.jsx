import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Check } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import wishlistData from '../data/wishlist.json'
import LiquidButton from '../components/LiquidButton.jsx'
import useUsdToUahRate from '../hooks/useUsdToUahRate.js'
import { readJson, readString, writeJson, writeString } from '../lib/storage.js'

const MONOBANK_JAR_URL = 'https://send.monobank.ua/jar/78kTAqpQPm'
// The donation banner is birthday-scoped: it hides itself after this date
// rather than needing a deploy to take it down.
const SUPPORT_BANNER_DEADLINE = new Date('2026-09-23T00:00:00')

const STORAGE_KEY = 'wishlist-acquired'
const CURRENCY_KEY = 'wishlist-currency'
const CURRENCIES = ['UAH', 'USD']
const priorityOrder = { high: 0, medium: 1, low: 2 }
// The only colour in the list: a dot per priority, sized to read as punctuation
// next to the mono meta line rather than as a badge.
const priorityDotClasses = {
  high: 'bg-rose-400 dark:bg-rose-500',
  medium: 'bg-amber-400 dark:bg-amber-500',
  low: 'bg-emerald-400 dark:bg-emerald-500',
}

// Ticking an item off is a local-only override on top of the JSON data, so the
// checkbox state survives a reload without needing a backend.
function loadAcquiredOverrides() {
  return readJson(STORAGE_KEY, {})
}

// Prices in wishlist.json are all USD; UAH is derived from the live NBU rate.
function formatPrice(priceUsd, currency, rate) {
  if (typeof priceUsd !== 'number') return '—'
  if (currency === 'USD') return `$${priceUsd.toLocaleString()}`
  if (!rate) return '…'
  return `₴${Math.round(priceUsd * rate).toLocaleString()}`
}

// Filter chips and the currency pair share one look: muted until selected,
// then inverted against the page ground the way the site's copy hierarchy runs.
function chipClasses(active) {
  return `shrink-0 select-none whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-xs transition-colors ${
    active
      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
  }`
}

export default function Wishlist() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [acquiredOverrides, setAcquiredOverrides] = useState(loadAcquiredOverrides)
  // Acquired items sink to the bottom, but the ranking is a snapshot taken at
  // mount: ticking one off during the visit shouldn't slide the row out from
  // under the pointer that just clicked it, and neither should a filter change.
  // It's re-read on the next load, so the list still settles between visits.
  const [acquiredAtLoad] = useState(
    () => new Map(wishlistData.map((item) => [item.id, acquiredOverrides[item.id] ?? item.acquired])),
  )
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [hideAcquired, setHideAcquired] = useState(false)
  const [currency, setCurrency] = useState(() => (readString(CURRENCY_KEY) === 'USD' ? 'USD' : 'UAH'))
  const { rate, error: rateError } = useUsdToUahRate()
  const filterRowRef = useRef(null)
  // Keep the UAH button selected (and the "rate unavailable" note visible) but
  // show USD figures when the rate lookup failed — ₴ prices would be a guess.
  const effectiveCurrency = currency === 'UAH' && rateError ? 'USD' : currency

  useEffect(() => {
    writeJson(STORAGE_KEY, acquiredOverrides)
  }, [acquiredOverrides])

  useEffect(() => {
    writeString(CURRENCY_KEY, currency)
  }, [currency])

  // Outstanding items first, high priority first within each group; the JSON
  // keeps its own authoring order below that.
  const items = useMemo(
    () =>
      wishlistData
        .map((item) => ({
          ...item,
          acquired: acquiredOverrides[item.id] ?? item.acquired,
        }))
        .sort(
          (a, b) =>
            Number(acquiredAtLoad.get(a.id)) - Number(acquiredAtLoad.get(b.id)) ||
            priorityOrder[a.priorityKey] - priorityOrder[b.priorityKey],
        ),
    [acquiredOverrides, acquiredAtLoad],
  )

  const categories = useMemo(() => ['all', ...new Set(wishlistData.map((item) => item.categoryKey))], [])

  const visibleItems = items.filter((item) => {
    if (hideAcquired && item.acquired) return false
    if (categoryFilter !== 'all' && item.categoryKey !== categoryFilter) return false
    return true
  })

  function toggleAcquired(id, current) {
    setAcquiredOverrides((prev) => ({ ...prev, [id]: !current }))
  }

  function resetFilters() {
    setCategoryFilter('all')
    setHideAcquired(false)
  }

  // Arrow keys walk the filter row, so it behaves like one control rather than
  // a run of separate tab stops. Focus is read and moved straight off the DOM
  // — there's no React state that needs to know which chip is focused.
  function handleFilterKeyDown(event) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return

    // Chips only — the currency pair is nested in the same row but is its own
    // group, so arrow keys shouldn't walk out of one and into the other.
    const buttons = Array.from(filterRowRef.current?.querySelectorAll('[data-filter-chip]') ?? [])
    const current = buttons.indexOf(document.activeElement)
    if (current === -1) return

    event.preventDefault()
    buttons[(current + step + buttons.length) % buttons.length].focus()
  }

  return (
    <div className="stagger mx-auto max-w-[36.375rem] text-sm font-book leading-5 tracking-tightish text-slate-600 dark:text-slate-300">
      {new Date() < SUPPORT_BANNER_DEADLINE && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-slate-400 dark:text-slate-500">{t.wishlist.supportJoke}</p>
          <LiquidButton
            text={t.wishlist.supportButton}
            width={320}
            onClick={() => window.open(MONOBANK_JAR_URL, '_blank', 'noreferrer')}
          />
        </div>
      )}

      {/* One line, always: the row scrolls sideways rather than wrapping, so
          the controls stay a single band above the list at any width. The
          scrollbar is hidden — the chips running to the edge are the affordance. */}
      <div
        ref={filterRowRef}
        onKeyDown={handleFilterKeyDown}
        className="-ml-2.5 flex items-center gap-1 overflow-x-auto pt-8 [scrollbar-width:none] first:pt-0 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setCategoryFilter(category)}
            aria-pressed={categoryFilter === category}
            data-filter-chip=""
            className={chipClasses(categoryFilter === category)}
          >
            {category === 'all' ? t.wishlist.allCategories : t.category[category]}
          </button>
        ))}

        <span aria-hidden="true" className="mx-1 h-3 w-px shrink-0 bg-slate-100 dark:bg-slate-800" />

        {CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            aria-pressed={currency === c}
            className={chipClasses(currency === c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Same rhythm as the numbered sections on Beliefs/Guidelines: hairline
          rules between entries, no surrounding card. */}
      <ol className="flex flex-col pt-6">
        {visibleItems.map((item) => {
          const i = item[lang]
          return (
            <li
              key={item.id}
              className={`flex gap-3 border-t border-slate-100 py-4 transition-opacity first:border-t-0 first:pt-0 dark:border-slate-800 ${
                item.acquired ? 'opacity-50' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAcquired(item.id, item.acquired)}
                aria-pressed={item.acquired}
                aria-label={`${item.acquired ? t.wishlist.markNotAcquired : t.wishlist.markAcquired}: ${i.name}`}
                className={`mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 select-none items-center justify-center rounded-[3px] border transition-colors ${
                  item.acquired
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 text-transparent hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'
                }`}
              >
                <Check size={10} strokeWidth={3} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h2
                    className={`font-medium text-slate-900 dark:text-white ${
                      item.acquired ? 'line-through decoration-slate-300 dark:decoration-slate-600' : ''
                    }`}
                  >
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="basic-link inline-flex items-baseline gap-1.5"
                      >
                        {i.name}
                        <ExternalLink size={12} className="translate-y-px text-slate-400 dark:text-slate-500" />
                      </a>
                    ) : (
                      i.name
                    )}
                  </h2>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                    {formatPrice(item.price, effectiveCurrency, rate)}
                  </span>
                </div>

                {i.notes && (
                  <p className="whitespace-pre-line pt-1 text-slate-500 dark:text-slate-400">{i.notes}</p>
                )}

                <p className="flex items-center gap-2 pt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                  <span>{t.category[item.categoryKey]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={`inline-block h-1.5 w-1.5 rounded-full ${priorityDotClasses[item.priorityKey]}`}
                    />
                    {t.priority[item.priorityKey]}
                  </span>
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      {visibleItems.length === 0 && (
        // An empty state should hand back the action that resolves it; on a
        // read-only list that's clearing the filters that emptied it.
        <div className="flex flex-col items-start gap-2 pt-6">
          <p className="text-slate-400 dark:text-slate-500">{t.wishlist.empty}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="basic-link select-none text-slate-900 dark:text-white"
          >
            {t.wishlist.emptyReset}
          </button>
        </div>
      )}

      {/* Sits under the list it thins out, so the reader meets the rows first
          and the switch second. */}
      <label className="flex w-fit cursor-pointer select-none items-center gap-2 pt-8 font-mono text-xs text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <input
          type="checkbox"
          checked={hideAcquired}
          onChange={(event) => setHideAcquired(event.target.checked)}
          className="h-3.5 w-3.5 rounded-[3px] border-slate-300 text-slate-900 focus:ring-0 focus:ring-offset-0 dark:border-slate-700 dark:bg-transparent dark:text-white"
        />
        {t.wishlist.hideAcquired}
      </label>

      {/* Closes the page: the rate is a footnote to the prices above, not a
          heading for them. */}
      {currency === 'UAH' && (
        <p className="pt-10 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {rateError
            ? t.wishlist.rateUnavailable
            : rate
              ? `${t.wishlist.rateNote} 1 $ = ${rate.toFixed(2)} ₴`
              : t.wishlist.rateLoading}
        </p>
      )}
    </div>
  )
}
