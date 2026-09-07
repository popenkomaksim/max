import { useEffect, useState } from 'react'
import { writeString } from '../lib/storage.js'

// The initial value comes from the DOM, not from storage: the inline script in
// index.html has already applied the stored/OS preference before React mounts.
export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    // Same key and raw-string shape the index.html pre-mount script reads.
    writeString('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return [isDark, setIsDark]
}
