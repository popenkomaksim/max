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

  // The engine reads its config from the SVG's data-attributes on construction
  // and renders the label itself, so a text change (e.g. switching language)
  // has to tear the instance down and build a new one.
  useEffect(() => {
    const engine = new LiquidButtonEngine(svgRef.current, { text })
    return () => engine.destroy()
  }, [text])

  return (
    <svg
      ref={svgRef}
      role="button"
      tabIndex={0}
      aria-label={text}
      onClick={() => onClick?.()}
      onKeyDown={(e) => {
        // An <svg role="button"> isn't natively keyboard-activatable.
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={`liquid-button cursor-pointer select-none rounded-2xl font-sans text-sm font-bold uppercase tracking-wide ${className}`}
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
