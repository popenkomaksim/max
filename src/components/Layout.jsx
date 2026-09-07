import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BirthdayFireworks from './BirthdayFireworks.jsx'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

// Gap between the navbar and the footer arriving, so the chrome reads as
// closing in around the copy rather than snapping in as one block.
const FOOTER_OFFSET = 0.15

// Delays are summed from per-letter fractions, so round off the float noise
// before it reaches the DOM (1.5850000000000002s → 1.585s).
const delayStyle = (seconds) => ({ animationDelay: `${seconds.toFixed(3)}s` })

export default function Layout() {
  // Seconds to hold the chrome back for. Pages with their own entrance
  // animation raise it through `useChromeReveal`; everything else leaves it at
  // 0 and the chrome fades in with the page.
  const [chromeDelay, setChromeDelay] = useState(0)

  return (
    <div className="flex min-h-screen flex-col">
      <BirthdayFireworks />
      <Navbar style={delayStyle(chromeDelay)} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Outlet context={{ setChromeDelay }} />
      </main>
      <Footer style={delayStyle(chromeDelay + FOOTER_OFFSET)} />
    </div>
  )
}
