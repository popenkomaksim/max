import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

// Gap between the navbar and the footer arriving, so the chrome reads as
// closing in around the copy rather than snapping in as one block.
const FOOTER_OFFSET = 0.15

export default function Layout() {
  // Seconds to hold the chrome back for. Pages with their own entrance
  // animation raise it through `useChromeReveal`; everything else leaves it at
  // 0 and the chrome fades in with the page.
  const [chromeDelay, setChromeDelay] = useState(0)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar style={{ animationDelay: `${chromeDelay}s` }} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Outlet context={{ setChromeDelay }} />
      </main>
      <Footer style={{ animationDelay: `${chromeDelay + FOOTER_OFFSET}s` }} />
    </div>
  )
}
