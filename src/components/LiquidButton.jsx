import { useEffect, useRef } from 'react'
import { LiquidButton as LiquidButtonEngine } from '../lib/liquidButton.js'

export default function LiquidButton({
  text,
  onClick,
  width = 220,
  height = 48,
  margin = 30,
  backColor = 'rgba(0, 0, 0, 0)',
  mainColor = '#9226a4',
  hoverColor = '#e406d6',
  textColor = '#ffffff',
  className = '',
}) {
  const svgRef = useRef(null)
  const engineRef = useRef(null)

  useEffect(() => {
    engineRef.current = new LiquidButtonEngine(svgRef.current, { text })
    return () => engineRef.current?.destroy()
  }, [text])

  function handleActivate() {
    onClick?.()
  }

  return (
    <svg
      ref={svgRef}
      role="button"
      tabIndex={0}
      aria-label={text}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleActivate()
        }
      }}
      className={`liquid-button cursor-pointer font-sans text-sm font-bold uppercase tracking-wide outline-none ${className}`}
      data-hover-factor="-10"
      data-width={width}
      data-height={height}
      data-margin={margin}
      data-color1={backColor}
      data-color2={mainColor}
      data-color3={hoverColor}
      data-text-color={textColor}
    />
  )
}
