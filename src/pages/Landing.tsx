import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { api, ApiError, type Me } from '../api'
import { useAuth } from '../context/auth'
import './Landing.css'

/* The three neon sign colours. The first is the default; a visitor's choice is remembered in their browser. */
const SIGNS = [
  { id: 'electric', label: 'Pink and cyan', n1: '#ff3fa4', n2: '#2ef2ff', wall: '#1a0d2b', bg: '#06040b' },
  { id: 'acid', label: 'Acid lime and violet', n1: '#c6ff3d', n2: '#b06bff', wall: '#13200c', bg: '#050805' },
  { id: 'redblue', label: 'Red and blue', n1: '#ff4141', n2: '#4c8dff', wall: '#200c18', bg: '#07050a' },
] as const
type SignId = (typeof SIGNS)[number]['id']
const SIGN_KEY = 'bafive-sign'

const readSign = (): SignId => {
  try {
    const saved = localStorage.getItem(SIGN_KEY)
    return SIGNS.find((s) => s.id === saved)?.id ?? SIGNS[0].id
  } catch {
    return SIGNS[0].id
  }
}

/**
 * Pushes every `[data-repel]` element inside `root` away from the pointer, then springs it back.
 * A faster pointer pushes harder. The weight in `data-repel` scales the push (the sign-up card barely moves,
 * and stays still while you type in it). Works with mouse, pen and touch; off for reduced-motion users.
 */
function useRepel(root: RefObject<HTMLElement>, glow: RefObject<HTMLElement>) {
  useEffect(() => {
    const area = root.current
    if (!area || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    type Body = { el: HTMLElement; w: number; x: number; y: number; vx: number; vy: number; r: number; vr: number }
    let bodies: Body[] = []
    const collect = () => {
      bodies = Array.from(area.querySelectorAll<HTMLElement>('[data-repel]')).map(
        (el) => bodies.find((b) => b.el === el) ?? { el, w: Number(el.dataset.repel) || 1, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0 },
      )
    }
    collect()

    const REACH = 210
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, t: 0, on: false }
    const halo = { x: 0, y: 0, o: 0 }
    let raf = 0

    const frame = () => {
      raf = 0
      const box = area.getBoundingClientRect()
      const px = pointer.x - box.left
      const py = pointer.y - box.top
      pointer.vx *= 0.9
      pointer.vy *= 0.9
      // Read every position first, then write, so the browser lays the page out once per frame.
      const rects = bodies.map((b) => b.el.getBoundingClientRect())
      let busy = false
      bodies.forEach((b, i) => {
        const r = rects[i]
        if (!r.width && !r.height) return
        const hx = r.left + r.width / 2 - box.left - b.x
        const hy = r.top + r.height / 2 - box.top - b.y
        const dx = hx - px
        const dy = hy - py
        const dist = Math.hypot(dx, dy) || 1
        const edge = Math.max(0, dist - Math.min(r.width, r.height) * 0.4)
        let fx = 0
        let fy = 0
        if (pointer.on && edge < REACH && !b.el.matches(':focus-within')) {
          const f = (1 - edge / REACH) ** 2 * 5 * b.w
          fx = (dx / dist) * f + pointer.vx * f * 0.05
          fy = (dy / dist) * f + pointer.vy * f * 0.05
        }
        b.vx = (b.vx + fx - b.x * 0.07) * 0.85
        b.vy = (b.vy + fy - b.y * 0.07) * 0.85
        b.x += b.vx
        b.y += b.vy
        b.vr = (b.vr + b.vx * 0.1 * Math.min(b.w, 1) - b.r * 0.08) * 0.85
        b.r += b.vr
        if (Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.vr) > 0.01 || (!pointer.on && Math.abs(b.x) + Math.abs(b.y) + Math.abs(b.r) > 0.05)) busy = true
        else if (!pointer.on) b.x = b.y = b.r = 0
        b.el.style.transform = `translate3d(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px, 0) rotate(${b.r.toFixed(2)}deg)`
      })
      const g = glow.current
      if (g) {
        if (pointer.on) {
          halo.x += (px - halo.x) * 0.14
          halo.y += (py - halo.y) * 0.14
        }
        const target = pointer.on ? 1 : 0
        halo.o += (target - halo.o) * 0.08
        const speed = Math.min(1, Math.hypot(pointer.vx, pointer.vy) / 40)
        g.style.transform = `translate3d(${halo.x.toFixed(1)}px, ${halo.y.toFixed(1)}px, 0) scale(${(1 + speed * 0.45).toFixed(3)})`
        g.style.opacity = halo.o.toFixed(3)
        if (Math.abs(halo.o - target) > 0.01 || (pointer.on && Math.hypot(px - halo.x, py - halo.y) > 0.5)) busy = true
      }
      // Sleep when nothing is moving; the next pointer event wakes the loop.
      if (busy) raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      if (pointer.on) {
        const dt = Math.max(8, now - pointer.t) / 16
        pointer.vx = pointer.vx * 0.5 + ((e.clientX - pointer.x) / dt) * 0.5
        pointer.vy = pointer.vy * 0.5 + ((e.clientY - pointer.y) / dt) * 0.5
      } else if (halo.o < 0.05) {
        // Start the glow under the pointer instead of sliding in from a corner.
        const box = area.getBoundingClientRect()
        halo.x = e.clientX - box.left
        halo.y = e.clientY - box.top
      }
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.t = now
      pointer.on = true
      wake()
    }
    const onLeave = () => {
      pointer.on = false
      pointer.vx = pointer.vy = 0
      wake()
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') onLeave()
    }

    area.addEventListener('pointermove', onMove, { passive: true })
    area.addEventListener('pointerdown', onMove, { passive: true })
    area.addEventListener('pointerup', onUp)
    area.addEventListener('pointerleave', onLeave)
    area.addEventListener('pointercancel', onLeave)
    // The sign-up card swaps fields (verify, reset…): pick up added or removed elements.
    const observer = new MutationObserver(collect)
    observer.observe(area, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerdown', onMove)
      area.removeEventListener('pointerup', onUp)
      area.removeEventListener('pointerleave', onLeave)
      area.removeEventListener('pointercancel', onLeave)
    }
  }, [root, glow])
}

/** A block the pointer pushes around. `tilt` is a resting rotation in degrees. */
function Repel({ weight = 1, tilt = 0, className, children }: { weight?: number; tilt?: number; className?: string; children: ReactNode }) {
  return (
    <div className="repel" data-repel={weight}>
      <div className={className} style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}>
        {children}
      </div>
    </div>
  )
}

type View = 'signup' | 'login' | 'verify' | 'forgot' | 'reset'

/** Seconds left before another code can be requested. */
function useCooldown() {
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (until <= now) return
    const t = setTimeout(() => setNow(Date.now()), 1000)
    return () => clearTimeout(t)
  }, [until, now])
  return {
    left: Math.max(0, Math.ceil((until - now) / 1000)),
    start: (seconds: number) => {
      setNow(Date.now())
      setUntil(Date.now() + seconds * 1000)
    },
  }
}

const HEADINGS: Partial<Record<View, string>> = {
  verify: 'Check your email',
  forgot: 'Forgot your password?',
  reset: 'Choose a new password',
}

const BUTTON_LABELS: Record<View, string> = {
  signup: 'Get started',
  login: 'Welcome back',
  verify: 'Verify email',
  forgot: 'Send reset code',
  reset: 'Save and sign in',
}

function AuthCard() {
  const { login, signup, verifyEmail, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState<View>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)
  const cooldown = useCooldown()

  const go = (next: View, message = '') => {
    setView(next)
    setError('')
    setNotice(message)
    setCode('')
  }
  const enter = (user: Me) => navigate(user.onboarded ? '/discover' : '/onboarding', { replace: true })
  const fail = (err: unknown) => {
    setError((err as Error).message)
    setShake((s) => s + 1)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (view === 'signup') {
        const res = await signup(name, email, password)
        if ('id' in res) return enter(res)
        setEmail(res.email)
        go('verify', res.codeSent ? '' : "We couldn't send the email just now. Tap “resend code” to try again.")
        cooldown.start(res.codeSent ? 60 : 0)
      } else if (view === 'login') {
        try {
          enter(await login(email, password))
        } catch (err) {
          const details = err instanceof ApiError ? err.details : {}
          if (!details.needsVerification) throw err
          if (details.email) setEmail(details.email)
          go('verify', (err as Error).message)
          cooldown.start(details.codeSent ? 60 : 0)
        }
      } else if (view === 'verify') {
        enter(await verifyEmail(email, code))
      } else if (view === 'forgot') {
        await api.forgotPassword(email)
        go('reset')
        cooldown.start(60)
      } else {
        enter(await resetPassword(email, code, newPassword))
      }
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setError('')
    setNotice('')
    try {
      await (view === 'verify' ? api.resendCode(email) : api.forgotPassword(email))
      setNotice('We sent you a new code.')
      cooldown.start(60)
    } catch (err) {
      const retryAfter = err instanceof ApiError ? err.details.retryAfter : undefined
      if (retryAfter) cooldown.start(retryAfter)
      fail(err)
    }
  }

  const isCodeView = view === 'verify' || view === 'reset'

  return (
    <motion.form
      className="auth card"
      onSubmit={submit}
      key={shake}
      animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
      transition={{ duration: 0.4 }}
    >
      {view === 'signup' || view === 'login' ? (
        <div className="seg">
          {(['signup', 'login'] as const).map((m) => (
            <button type="button" key={m} className={`seg-btn ${view === m ? 'on' : ''}`} onClick={() => go(m)}>
              {view === m && <motion.span layoutId="seg-pill" className="seg-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
              <span>{m === 'signup' ? 'Create account' : 'Sign in'}</span>
            </button>
          ))}
        </div>
      ) : (
        <motion.div className="auth-head" key={view} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
          <button type="button" className="auth-back" onClick={() => go('login')}>
            <ArrowLeft size={16} /> Back to sign in
          </button>
          <h2>{HEADINGS[view]}</h2>
          <p>
            {view === 'verify' && (
              <>
                Enter the 6-digit code we sent to <b>{email}</b> to confirm it's really you.
              </>
            )}
            {view === 'forgot' && "Enter your account's email and we'll send you a code to reset your password."}
            {view === 'reset' && (
              <>
                If <b>{email}</b> has a baFive account, we've emailed it a 6-digit code.
              </>
            )}
          </p>
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {view === 'signup' && (
          <motion.label
            className="field"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span>First name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" autoComplete="given-name" required />
          </motion.label>
        )}
      </AnimatePresence>
      {(view === 'signup' || view === 'login' || view === 'forgot') && (
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="youremail@email.com" autoComplete="email" required />
        </label>
      )}
      {(view === 'signup' || view === 'login') && (
        <div className="field">
          <span className="field-row">
            <label htmlFor="auth-password">Password</label>
            {view === 'login' && (
              <button type="button" className="auth-link" onClick={() => go('forgot')}>
                Forgot password?
              </button>
            )}
          </span>
          <input
            id="auth-password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={view === 'signup' ? 'At least 6 characters' : 'Your password'}
            autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
            minLength={6}
            required
          />
        </div>
      )}
      {isCodeView && (
        <label className="field">
          <span>6-digit code</span>
          <input
            className="input code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
          />
        </label>
      )}
      {view === 'reset' && (
        <label className="field">
          <span>New password</span>
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
      )}

      <AnimatePresence>
        {notice && !error && (
          <motion.p className="auth-note" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {notice}
          </motion.p>
        )}
        {error && (
          <motion.p className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button className="btn btn-grad btn-block" disabled={busy || (isCodeView && code.length !== 6)}>
        {busy ? <span className="spinner spinner-sm" /> : BUTTON_LABELS[view]}
        {!busy && <ArrowRight size={18} />}
      </button>
      {isCodeView ? (
        <p className="auth-fine">
          Didn't get it? Check your spam folder or{' '}
          <button type="button" className="auth-link" onClick={resend} disabled={cooldown.left > 0}>
            {cooldown.left > 0 ? `resend in ${cooldown.left}s` : 'resend code'}
          </button>
        </p>
      ) : (
        <p className="auth-fine">By continuing you confirm you're 18+ and agree to be kind.</p>
      )}
    </motion.form>
  )
}

export default function Landing() {
  const [sign, setSign] = useState<SignId>(readSign)
  const root = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  useRepel(root, glow)

  const current = SIGNS.find((s) => s.id === sign) ?? SIGNS[0]
  const choose = (id: SignId) => {
    setSign(id)
    try {
      localStorage.setItem(SIGN_KEY, id)
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  }

  return (
    <div
      className="neon"
      ref={root}
      style={{ '--n1': current.n1, '--n2': current.n2, '--nwall': current.wall, '--nbg': current.bg } as CSSProperties}
    >
      <div className="neon-grid" aria-hidden="true" />
      <div className="neon-glow" ref={glow} aria-hidden="true" />

      <header className="neon-top">
        <Repel weight={0.6} className="neon-logo">
          BA·5
        </Repel>
        <div className="neon-swatches" role="radiogroup" aria-label="Sign colour">
          <span className="neon-swatch-label" aria-hidden="true">
            SIGN COLOUR
          </span>
          {SIGNS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={s.id === sign}
              aria-label={s.label}
              title={s.label}
              className={`neon-swatch ${s.id === sign ? 'on' : ''}`}
              style={{ '--s1': s.n1, '--s2': s.n2 } as CSSProperties}
              onClick={() => choose(s.id)}
            />
          ))}
        </div>
      </header>

      <main className="neon-main">
        <section className="neon-copy">
          <Repel weight={0.6}>
            <p className="neon-eyebrow">BA5 = BEFORE &amp; AFTER FIVE</p>
          </Repel>
          <Repel weight={0.35}>
            <h1>
              The office lights go off. <em>Yours don't.</em>
            </h1>
          </Repel>
          <Repel weight={0.5}>
            <p className="neon-lede">
              Say hi on a coffee break before five, keep it going after. Dating for people whose best plans start at 5:01.
            </p>
          </Repel>
          <Repel weight={0.12}>
            <AuthCard />
          </Repel>
        </section>

        <section className="neon-sign" aria-label="Before five, after five">
          <div className="ns-row">
            <Repel weight={0.8} className="ns-word ns-before">
              BEFORE
            </Repel>
            <Repel weight={1.2} tilt={5} className="ns-chip ns-chip-2">
              LUNCH DATES · 1–2 PM
            </Repel>
          </div>
          <div className="ns-row ns-mid">
            <Repel weight={1.1} className="ns-card">
              <b>Ira, 27</b> <span>· liked your prompt</span>
              <p>“Karaoke after 5? I do a mean Shakira.”</p>
            </Repel>
            <Repel weight={0.5} className="ns-five">
              5
            </Repel>
          </div>
          <div className="ns-row">
            <Repel weight={1.2} tilt={-5} className="ns-chip ns-chip-1">
              OPEN TILL LATE
            </Repel>
            <Repel weight={0.8} className="ns-word ns-after">
              AFTER
            </Repel>
          </div>
        </section>
      </main>
    </div>
  )
}
