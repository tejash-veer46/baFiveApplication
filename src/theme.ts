/*
 * The neon "sign colours" used across the whole app. The CSS for each lives in styles/global.css
 * (:root[data-sign=…]); these values are only for drawing the swatches. The first one is the default.
 */
export const SIGNS = [
  { id: 'electric', label: 'Pink and cyan', n1: '#ff3fa4', n2: '#2ef2ff' },
  { id: 'acid', label: 'Acid lime and violet', n1: '#c6ff3d', n2: '#b06bff' },
  { id: 'redblue', label: 'Red and blue', n1: '#ff4141', n2: '#4c8dff' },
] as const

export type SignId = (typeof SIGNS)[number]['id']
export const SIGN_KEY = 'bafive-sign'

/** The saved choice. index.html applies it before the app loads, so the page never flashes the wrong colour. */
export const readSign = (): SignId => {
  try {
    const saved = localStorage.getItem(SIGN_KEY)
    return SIGNS.find((s) => s.id === saved)?.id ?? SIGNS[0].id
  } catch {
    return SIGNS[0].id
  }
}
