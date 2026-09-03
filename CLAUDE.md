# CLAUDE.md

## src/data/mountains.json conventions

- `location` must be written as: the country's official name in its own official language, followed by the localised name in parentheses — e.g. `"Ελλάδα (Греція)"` for a `uk` entry, `"Ελλάδα (Greece)"` for `en`.
- `name` follows the same pattern: the peak's official name in its own official/local language, followed by the localised name in parentheses — e.g. `"Σκάλα (Скала)"` for a `uk` entry, `"Σκάλα (Skala Summit)"` for `en`.
- In both fields, when the native name and the localised name are identical, omit the parentheses (write just the single name).
