// Reveals `text` one letter at a time via the `animate-letter-in` keyframes,
// staggered by `step` seconds. Letters are counted across the whole string, so
// the sweep stays continuous from word to word.
export default function AnimatedText({ text, startDelay = 0, step = 0.035, className = '' }) {
  let letterIndex = 0

  return text.split(' ').flatMap((word, wordIndex) => {
    const wordStart = letterIndex
    letterIndex += word.length

    const rendered = (
      // Each word is a nowrap inline-block so a line break never lands between
      // two letters of the same word.
      <span key={wordIndex} className="inline-block whitespace-nowrap">
        {word.split('').map((char, charIndex) => (
          <span
            key={charIndex}
            className={`inline-block animate-letter-in ${className}`}
            style={{ animationDelay: `${startDelay + (wordStart + charIndex) * step}s` }}
          >
            {char}
          </span>
        ))}
      </span>
    )

    // Put back the space `split` consumed, so words don't run together.
    return wordIndex === 0 ? [rendered] : [' ', rendered]
  })
}
