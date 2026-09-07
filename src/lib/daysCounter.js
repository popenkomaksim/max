// Dates below are DD/MM/YYYY.
export function daysSince(day, month, year) {
  const startUTC = Date.UTC(year, month - 1, day)
  const now = new Date()
  const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil((nowUTC - startUTC) / 86400000)
}

function pluralizeUk(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function formatDays(n, lang) {
  if (lang === 'uk') return `${n} ${pluralizeUk(n, 'день', 'дні', 'днів')}`
  return `${n} ${n === 1 ? 'day' : 'days'}`
}
