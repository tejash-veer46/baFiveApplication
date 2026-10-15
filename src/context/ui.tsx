import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api, type Summary } from '../api'
import { useAuth } from './auth'

/* ---------------- Theme ---------------- */
type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0E0A14' : '#FAF6F1')
  }, [theme])
  const toggle = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('bafive-theme', next)
      } catch {
        /* storage unavailable */
      }
      return next
    })
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)

/* ---------------- Toasts ---------------- */
interface Toast {
  id: number
  text: string
  tone: 'info' | 'error' | 'love'
}
const ToastContext = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const push = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.tone}`}
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
export const useToast = () => useContext(ToastContext)

/* ---------------- Live summary (badges) ---------------- */
const SummaryContext = createContext<{ summary: Summary; refresh: () => void }>({
  summary: { likes: 0, unread: 0, roses: 1 },
  refresh: () => {},
})

export function SummaryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const toast = useToast()
  const [summary, setSummary] = useState<Summary>({ likes: 0, unread: 0, roses: 1 })
  const prev = useRef<Summary | null>(null)

  const refresh = useCallback(() => {
    if (!user?.onboarded) return
    api
      .summary()
      .then((s) => {
        if (prev.current && s.likes > prev.current.likes) toast('Someone new likes you 💘', 'love')
        if (prev.current && s.unread > prev.current.unread) toast('You have a new message 💬', 'love')
        prev.current = s
        setSummary(s)
      })
      .catch(() => {})
  }, [user?.onboarded, toast])

  useEffect(() => {
    prev.current = null
    refresh()
    const id = setInterval(refresh, 6000)
    return () => clearInterval(id)
  }, [refresh])

  return <SummaryContext.Provider value={{ summary, refresh }}>{children}</SummaryContext.Provider>
}
export const useSummary = () => useContext(SummaryContext)

/* ---------------- Server wake-up banner ---------------- */
export function WakingBanner() {
  const [waking, setWaking] = useState(false)
  useEffect(() => {
    const on = (e: Event) => setWaking((e as CustomEvent<boolean>).detail)
    window.addEventListener('bafive:waking', on)
    return () => window.removeEventListener('bafive:waking', on)
  }, [])
  return (
    <AnimatePresence>
      {waking && (
        <motion.div
          className="waking"
          role="status"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <span className="waking-dot" />
          Waking up baFive's server — this can take up to a minute after a quiet spell ☕
        </motion.div>
      )}
    </AnimatePresence>
  )
}
