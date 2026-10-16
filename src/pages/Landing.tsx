import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowRight, Heart, Moon, Sun } from 'lucide-react'
import { api, ApiError, type Me } from '../api'
import Logo from '../components/Logo'
import { useAuth } from '../context/auth'
import { useTheme } from '../context/ui'
import './Landing.css'

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&h=750&fit=crop&crop=faces&auto=format&q=75`

const CARDS = [
  { src: img('1529626455594-4ff0802cfb7e'), x: -190, y: -150, r: -9, depth: 1.4, label: 'Zara, 31' },
  { src: img('1507003211169-0a1dd7228f2d'), x: 150, y: -190, r: 7, depth: 0.8, label: 'Arjun, 30' },
  { src: img('1534528741775-53994a69daeb'), x: -10, y: 10, r: -2, depth: 1, label: 'Sofia, 29', main: true },
  { src: img('1500648767791-00dcc994a43e'), x: -220, y: 170, r: 6, depth: 0.6, label: 'Kabir, 31' },
  { src: img('1531123897727-8f129e1688ce'), x: 200, y: 160, r: -7, depth: 1.2, label: 'Amara, 30' },
]

function Collage() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18 })
  const sy = useSpring(my, { stiffness: 60, damping: 18 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my])

  return (
    <div className="collage" ref={ref} aria-hidden="true">
      {CARDS.map((c, i) => (
        <CollageCard key={i} card={c} sx={sx} sy={sy} index={i} />
      ))}
      <motion.div
        className="collage-bubble"
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 260, damping: 18 }}
      >
        <span className="collage-bubble-q">Best lunch spot near the office</span>
        <span className="collage-bubble-a">The tiny dosa place nobody knows. I'll take you.</span>
        <span className="collage-bubble-heart">
          <Heart size={16} fill="currentColor" />
        </span>
      </motion.div>
      <motion.div
        className="collage-match"
        initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: -6 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 300, damping: 14 }}
      >
        It's a match! 💘
      </motion.div>
    </div>
  )
}

function CollageCard({
  card,
  sx,
  sy,
  index,
}: {
  card: (typeof CARDS)[number]
  sx: ReturnType<typeof useSpring>
  sy: ReturnType<typeof useSpring>
  index: number
}) {
  const x = useTransform(sx, (v) => card.x + v * 60 * card.depth)
  const y = useTransform(sy, (v) => card.y + v * 50 * card.depth)
  const rotateY = useTransform(sx, (v) => v * 14)
  const rotateX = useTransform(sy, (v) => -v * 10)
  return (
    <motion.figure
      className={`collage-card ${card.main ? 'main' : ''}`}
      style={{ x, y, rotateX, rotateY, zIndex: card.main ? 5 : Math.round(card.depth * 3) }}
      initial={{ opacity: 0, scale: 0.7, rotate: card.r * 2 }}
      animate={{ opacity: 1, scale: 1, rotate: card.r }}
      transition={{ delay: 0.15 + index * 0.1, type: 'spring', stiffness: 120, damping: 15 }}
      whileHover={{ scale: 1.06, zIndex: 10 }}
    >
      <img src={card.src} alt="" />
      <figcaption>{card.label}</figcaption>
    </motion.figure>
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
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
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
  const { theme, toggle } = useTheme()
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      glowRef.current?.style.setProperty('--gx', `${e.clientX}px`)
      glowRef.current?.style.setProperty('--gy', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="landing" ref={glowRef}>
      <div className="landing-blobs" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="cursor-glow" />
      </div>

      <header className="landing-top">
        <Logo size={36} />
        <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <section className="landing-grid">
        <div className="landing-copy">
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="eyebrow-dot" /> Dating for people who work hard
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            Meet someone worth <em className="grad-text">logging off</em> for.
          </motion.h1>
          <motion.p className="lede" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            No mindless swiping. Like the detail that caught your eye, start with something real, and turn
            "we should grab coffee" into an actual date.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <AuthCard />
          </motion.div>
          <motion.ul className="landing-points" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <li>
              <b>💬</b> Like a photo or prompt — with a comment
            </li>
            <li>
              <b>🌹</b> One rose a day for someone special
            </li>
            <li>
              <b>⚡</b> Real-time chat once you match
            </li>
          </motion.ul>
        </div>
        <Collage />
      </section>
    </div>
  )
}
