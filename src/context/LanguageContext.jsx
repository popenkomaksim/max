import { createContext, useContext, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'lang'
const SUPPORTED = ['uk', 'en']
const DEFAULT_LANG = 'uk'

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED.includes(stored) ? stored : null
  } catch {
    return null
  }
}

export function LanguageProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlLang = searchParams.get('lang')
  const lastLangRef = useRef(SUPPORTED.includes(urlLang) ? urlLang : (readStoredLang() ?? DEFAULT_LANG))

  // The URL wins whenever it carries a valid ?lang (e.g. a shared link or a
  // manual edit); otherwise fall back to whatever language was active last,
  // so navigating to a plain link (no query) doesn't reset the choice.
  const lang = SUPPORTED.includes(urlLang) ? urlLang : lastLangRef.current
  lastLangRef.current = lang

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // localStorage may be unavailable (e.g. private browsing); ignore.
    }
  }, [lang])

  // Re-append ?lang after any navigation that dropped it, so the active
  // language always persists in the URL/link.
  useEffect(() => {
    if (urlLang !== lang) {
      const next = new URLSearchParams(searchParams)
      next.set('lang', lang)
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlLang, lang])

  function setLang(next) {
    if (!SUPPORTED.includes(next)) return
    const params = new URLSearchParams(searchParams)
    params.set('lang', next)
    setSearchParams(params, { replace: true })
  }

  function toggleLang() {
    setLang(lang === 'uk' ? 'en' : 'uk')
  }

  return <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
