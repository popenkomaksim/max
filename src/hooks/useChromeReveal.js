import { useLayoutEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

// Holds the site chrome (navbar first, then footer) back for `seconds`, so a
// page whose copy animates in can finish before the frame around it arrives.
// Pages that don't call this get the chrome straight away.
//
// A layout effect rather than an effect: the delay lands before the browser
// paints, so the chrome never starts its entrance at the default timing first.
export default function useChromeReveal(seconds) {
  const { setChromeDelay } = useOutletContext()

  useLayoutEffect(() => {
    setChromeDelay(seconds)
    return () => setChromeDelay(0)
  }, [seconds, setChromeDelay])
}
