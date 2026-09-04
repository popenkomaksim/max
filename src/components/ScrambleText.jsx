import { useEffect, useState } from 'react'

const SCRAMBLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const STATIC_CHARS = new Set([' ', ',', '.', '-', '—'])

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
}

function scrambleFrame(text, elapsed, stagger) {
  let resolved = true
  const chars = text.split('').map((ch, i) => {
    if (STATIC_CHARS.has(ch)) return ch
    if (elapsed >= i * stagger) return ch
    resolved = false
    return randomChar()
  })
  return { text: chars.join(''), resolved }
}

// Cascading character-scramble reveal, in the style of rauno.me/projects.
export default function ScrambleText({ text, className = '', startDelay = 0, stagger = 0.03, tickMs = 40 }) {
  const [display, setDisplay] = useState(() => scrambleFrame(text, -Infinity, stagger).text)

  useEffect(() => {
    const startAt = performance.now() + startDelay * 1000
    setDisplay(scrambleFrame(text, -Infinity, stagger).text)

    const id = setInterval(() => {
      const elapsed = (performance.now() - startAt) / 1000
      const frame = scrambleFrame(text, elapsed, stagger)
      setDisplay(frame.text)
      if (frame.resolved) clearInterval(id)
    }, tickMs)

    return () => clearInterval(id)
  }, [text, startDelay, stagger, tickMs])

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true" className="font-mono tabular-nums">
        {display}
      </span>
    </span>
  )
}
