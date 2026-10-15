import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Heart, Moon, Sun } from 'lucide-react'
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

function AuthCard() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = mode === 'signup' ? await signup(name, email, password) : await login(email, password)
      navigate(user.onboarded ? '/discover' : '/onboarding', { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setShake((s) => s + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.form
      className="auth card"
      onSubmit={submit}
      key={shake}
      animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
      transition={{ duration: 0.4 }}
    >
      <div className="seg">
        {(['signup', 'login'] as const).map((m) => (
          <button
            type="button"
            key={m}
            className={`seg-btn ${mode === m ? 'on' : ''}`}
            onClick={() => {
              setMode(m)
              setError('')
            }}
          >
            {mode === m && <motion.span layoutId="seg-pill" className="seg-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
            <span>{m === 'signup' ? 'Create account' : 'Sign in'}</span>
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {mode === 'signup' && (
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
      <label className="field">
        <span>Email</span>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          minLength={6}
          required
        />
      </label>

      <AnimatePresence>
        {error && (
          <motion.p className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button className="btn btn-grad btn-block" disabled={busy}>
        {busy ? <span className="spinner spinner-sm" /> : mode === 'signup' ? 'Get started' : 'Welcome back'}
        {!busy && <ArrowRight size={18} />}
      </button>
      <p className="auth-fine">By continuing you confirm you're 18+ and agree to be kind.</p>
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
