import { useEffect, useState } from 'react'
import { writeString } from '../lib/storage.js'

// The initial value comes from the DOM, not from storage: the inline script in
// index.html has already applied the stored/OS preference before React mounts.
export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const root = document.documentElement

    // Theme switching shouldn't animate: `.theme-switching` kills every
    // transition on the page for the length of the swap, so the new colours
    // land in one paint instead of the document cross-fading into them.
    root.classList.add('theme-switching')
    root.classList.toggle('dark', isDark)
    // Same key and raw-string shape the index.html pre-mount script reads.
    writeString('theme', isDark ? 'dark' : 'light')

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

  return [isDark, setIsDark]
}
