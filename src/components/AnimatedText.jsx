export default function AnimatedText({ text, startDelay = 0, step = 0.035, className = '' }) {
  const words = text.split(' ')
  let letterIndex = 0
  const nodes = []

  words.forEach((word, wi) => {
    nodes.push(
      <span key={`w${wi}`} className="inline-block whitespace-nowrap">
        {word.split('').map((ch, ci) => {
          const delay = startDelay + letterIndex * step
          letterIndex += 1
          return (
            <span
              key={ci}
              className={`inline-block animate-letter-in ${className}`}
              style={{ animationDelay: `${delay}s` }}
            >
              {ch}
            </span>
          )
        })}
      </span>
    )
    if (wi < words.length - 1) {
      nodes.push(' ')
    }
  })

  return nodes
}
