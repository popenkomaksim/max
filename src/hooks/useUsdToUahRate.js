import { useEffect, useState } from 'react'

const CACHE_KEY = 'nbu-usd-uah-rate'
const CACHE_TTL = 1000 * 60 * 60 * 12
const NBU_URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json'

function loadCachedRate() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    return typeof cached?.rate === 'number' ? cached : null
  } catch {
    return null
  }
}

export default function useUsdToUahRate() {
  const [rate, setRate] = useState(() => loadCachedRate()?.rate ?? null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cached = loadCachedRate()
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return

    fetch(NBU_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('bad response'))))
      .then((data) => {
        const nextRate = data?.[0]?.rate
        if (typeof nextRate !== 'number') throw new Error('no rate in response')
        setRate(nextRate)
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: nextRate, fetchedAt: Date.now() }))
      })
      .catch(() => {
        if (!cached) setError(true)
      })
  }, [])

  return { rate, error }
}
