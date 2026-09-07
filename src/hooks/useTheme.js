import { useEffect, useState } from 'react'
import { readString, writeString } from '../lib/storage.js'

// The order the navbar button cycles through. `system` leads because it's the
// default for anyone who has never touched the control.
export const THEME_MODES = ['system', 'light', 'dark']

const DARK_QUERY = '(prefers-color-scheme: dark)'

const prefersDark = () => window.matchMedia(DARK_QUERY).matches

// Anything unrecognised (missing key, hand-edited value) means "follow the OS".
// Same key and raw-string shape the index.html pre-mount script reads.
function readMode() {
  const stored = readString('theme')
  return THEME_MODES.includes(stored) ? stored : 'system'
}

export default function useTheme() {
  const [mode, setMode] = useState(readMode)
  const [systemDark, setSystemDark] = useState(prefersDark)

  // Tracked as state rather than read on demand, so `system` follows the OS
  // while the page is open — not just at load.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const onChange = (event) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const isDark = mode === 'system' ? systemDark : mode === 'dark'

  useEffect(() => {
    writeString('theme', mode)
  }, [mode])

  useEffect(() => {
    const root = document.documentElement

    // Theme switching shouldn't animate: `.theme-switching` kills every
    // transition on the page for the length of the swap, so the new colours
    // land in one paint instead of the document cross-fading into them.
    root.classList.add('theme-switching')
    root.classList.toggle('dark', isDark)

    // Two frames: the first lets the browser paint the new colours with
    // transitions suppressed, the second hands them back for ordinary hovers.
    let innerFrame
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => root.classList.remove('theme-switching'))
    })

    return () => {
      cancelAnimationFrame(outerFrame)
      cancelAnimationFrame(innerFrame)
      root.classList.remove('theme-switching')
    }
  }, [isDark])

  const cycleMode = () => setMode((prev) => THEME_MODES[(THEME_MODES.indexOf(prev) + 1) % THEME_MODES.length])

  return { mode, isDark, setMode, cycleMode }
}
