// localStorage throws rather than returning null in some privacy modes
// (Safari private browsing, "block site data"), and it can throw on write when
// the quota is full. Every access goes through these wrappers so a failure
// degrades to "not persisted" instead of taking a render down with it.

export function readString(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage unavailable — the value just doesn't survive a reload.
  }
}

export function readJson(key, fallback = null) {
  const raw = readString(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) ?? fallback
  } catch {
    // Corrupt or hand-edited value; fall back rather than crash.
    return fallback
  }
}

export function writeJson(key, value) {
  writeString(key, JSON.stringify(value))
}
