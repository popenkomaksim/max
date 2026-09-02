import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Check } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import wishlistData from '../data/wishlist.json'

const STORAGE_KEY = 'wishlist-acquired'
const priorityOrder = { high: 0, medium: 1, low: 2 }
const priorityClasses = {
  high: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
}

function loadAcquiredOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export default function Wishlist() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [acquiredOverrides, setAcquiredOverrides] = useState(loadAcquiredOverrides)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [hideAcquired, setHideAcquired] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(acquiredOverrides))
  }, [acquiredOverrides])

  const items = useMemo(
    () =>
      wishlistData
        .map((item) => ({
          ...item,
          acquired: acquiredOverrides[item.id] ?? item.acquired,
        }))
        .sort((a, b) => priorityOrder[a.priorityKey] - priorityOrder[b.priorityKey]),
    [acquiredOverrides],
  )

  const categories = useMemo(() => ['all', ...new Set(wishlistData.map((item) => item.categoryKey))], [])

  const visibleItems = items.filter((item) => {
    if (hideAcquired && item.acquired) return false
    if (categoryFilter !== 'all' && item.categoryKey !== categoryFilter) return false
    return true
  })

  const totalValue = items
    .filter((item) => !item.acquired && typeof item.price === 'number')
    .reduce((sum, item) => sum + item.price, 0)

  function toggleAcquired(id, current) {
    setAcquiredOverrides((prev) => ({ ...prev, [id]: !current }))
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.wishlist.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t.wishlist.subtitlePrefix}{' '}
          <span className="font-semibold text-slate-900 dark:text-white">${totalValue.toLocaleString()}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                categoryFilter === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {category === 'all' ? t.wishlist.allCategories : t.category[category]}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={hideAcquired}
            onChange={(event) => setHideAcquired(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
          />
          {t.wishlist.hideAcquired}
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">{t.wishlist.colItem}</th>
              <th className="px-4 py-3">{t.wishlist.colCategory}</th>
              <th className="px-4 py-3">{t.wishlist.colPriority}</th>
              <th className="px-4 py-3">{t.wishlist.colPrice}</th>
              <th className="px-4 py-3">{t.wishlist.colAcquired}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {visibleItems.map((item) => {
              const i = item[lang]
              return (
                <tr key={item.id} className={item.acquired ? 'opacity-60' : undefined}>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {i.name} <ExternalLink size={14} />
                        </a>
                      ) : (
                        i.name
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{i.notes}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.category[item.categoryKey]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityClasses[item.priorityKey]}`}
                    >
                      {t.priority[item.priorityKey]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {typeof item.price === 'number' ? `$${item.price.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleAcquired(item.id, item.acquired)}
                      aria-pressed={item.acquired}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                        item.acquired
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 text-transparent hover:border-slate-400 dark:border-slate-700'
                      }`}
                    >
                      <Check size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visibleItems.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">{t.wishlist.empty}</p>
        )}
      </div>
    </div>
  )
}
