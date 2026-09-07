// Renders `text` with `backtick`-wrapped spans turned into inline <code>.
// The capturing split keeps the delimiters, so odd indices are the code spans.
function renderInlineCode(text) {
  return text.split(/(`[^`]+`)/g).map((chunk, index) =>
    chunk.startsWith('`') && chunk.endsWith('`') ? (
      <code
        key={index}
        className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        {chunk.slice(1, -1)}
      </code>
    ) : (
      chunk
    ),
  )
}

// Shared body of the Beliefs and Guidelines pages: a zero-padded numbered list
// of sections, each a heading over a set of dash-prefixed points.
// `sections` are already localised — `{ id, heading, points }`.
export default function NumberedSections({ sections }) {
  return (
    <ol className="flex flex-col">
      {sections.map((section, index) => (
        <li
          key={section.id}
          className="border-t border-slate-200 py-10 first:border-t-0 first:pt-0 dark:border-slate-800"
        >
          <h2 className="flex items-baseline gap-4 text-lg font-semibold">
            <span className="font-mono text-sm font-normal text-slate-400 dark:text-slate-600">
              {String(index + 1).padStart(2, '0')}
            </span>
            {section.heading}
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5 pl-9">
            {section.points.map((point) => (
              <li key={point} className="text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-slate-300 dark:text-slate-700">—</span>
                {renderInlineCode(point)}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}
