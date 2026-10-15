import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { authAPI } from '../services/api'
import AnimatedCard from '../components/AnimatedCard'
import Logo from '../components/Logo'
import ThemeSwitcher from '../components/ThemeSwitcher'
import './LoginPage.css'

interface LoginPageProps {
  onLogin: (email: string, password: string) => void
}

const loginBubbles = [
  { x: 7, y: 13, size: 9, delay: 0 },
  { x: 17, y: 74, size: 13, delay: 1.2 },
  { x: 25, y: 28, size: 7, delay: 2.1 },
  { x: 33, y: 88, size: 10, delay: 0.7 },
  { x: 42, y: 8, size: 12, delay: 1.8 },
  { x: 53, y: 91, size: 7, delay: 2.6 },
  { x: 63, y: 15, size: 8, delay: 0.4 },
  { x: 72, y: 82, size: 12, delay: 1.5 },
  { x: 83, y: 20, size: 10, delay: 2.3 },
  { x: 94, y: 70, size: 8, delay: 0.9 },
  { x: 4, y: 49, size: 7, delay: 1.9 },
  { x: 12, y: 91, size: 8, delay: 0.3 },
  { x: 22, y: 8, size: 11, delay: 2.7 },
  { x: 30, y: 54, size: 8, delay: 1.1 },
  { x: 39, y: 38, size: 7, delay: 2.4 },
  { x: 48, y: 72, size: 11, delay: 0.6 },
  { x: 58, y: 47, size: 9, delay: 1.7 },
  { x: 68, y: 94, size: 7, delay: 2.2 },
  { x: 77, y: 50, size: 8, delay: 0.2 },
  { x: 88, y: 91, size: 11, delay: 1.4 },
  { x: 96, y: 35, size: 12, delay: 2.5 },
  { x: 9, y: 31, size: 8, delay: 0.8 },
  { x: 91, y: 8, size: 7, delay: 1.6 },
  { x: 50, y: 4, size: 7, delay: 2.8 },
]

export default function LoginPage({ onLogin }: LoginPageProps) {
  const loginContainerRef = useRef<HTMLDivElement>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const container = loginContainerRef.current
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const bubbles = Array.from(container.querySelectorAll<HTMLElement>('.login-bubble'))
    let pointerX = 0
    let pointerY = 0
    let animationFrame = 0

    const resetBubbles = () => {
      cancelAnimationFrame(animationFrame)
      bubbles.forEach((bubble) => {
        bubble.style.transform = ''
      })
    }

    const updateBubbles = () => {
      animationFrame = 0
      const bounds = container.getBoundingClientRect()
      const cursorX = pointerX - bounds.left
      const cursorY = pointerY - bounds.top

      bubbles.forEach((bubble) => {
        const bubbleX = (Number(bubble.dataset.x) / 100) * bounds.width
        const bubbleY = (Number(bubble.dataset.y) / 100) * bounds.height
        const distanceX = bubbleX - cursorX
        const distanceY = bubbleY - cursorY
        const distance = Math.hypot(distanceX, distanceY)
        const influence = Math.max(0, 1 - distance / 170)
        const displacement = influence * 28
        const offsetX = distance === 0 ? 0 : (distanceX / distance) * displacement
        const offsetY = distance === 0 ? 0 : (distanceY / distance) * displacement

        bubble.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`
      })
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!animationFrame) animationFrame = requestAnimationFrame(updateBubbles)
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerleave', resetBubbles)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', resetBubbles)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        if (!email || !password || !name || !department) {
          throw new Error('Please fill in all fields')
        }
        await authAPI.signup(name, email, password, department)
        setSuccessMessage('Account created! Signing you in...')
        setTimeout(() => {
          onLogin(email, password)
        }, 1000)
      } else {
        // Login
        if (!email || !password) {
          throw new Error('Please enter email and password')
        }
        await authAPI.login(email, password)
        setSuccessMessage('Welcome back!')
        setTimeout(() => {
          onLogin(email, password)
        }, 500)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError('')
    setLoading(true)
    try {
      // Create a demo account or login with demo credentials
      await authAPI.login('demo@bafive.com', 'demo123')
      onLogin('demo@bafive.com', 'demo123')
    } catch (err: any) {
      // If demo user doesn't exist, try to create one
      try {
        await authAPI.signup('Demo User', 'demo@bafive.com', 'demo123', 'Engineering')
        onLogin('demo@bafive.com', 'demo123')
      } catch (signupErr: any) {
        setError('Demo login unavailable. Please sign up manually.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container" ref={loginContainerRef}>
      <div className="login-gradient-bg"></div>
      <div className="login-bubble-field" aria-hidden="true">
        {loginBubbles.map((bubble, index) => (
          <span
            className="login-bubble"
            key={index}
            data-x={bubble.x}
            data-y={bubble.y}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
              animationDelay: `${bubble.delay}s`,
            }}
          >
            <span className="login-bubble-core" />
          </span>
        ))}
      </div>
      
      <AnimatedCard className="login-card">
        <div className="login-header">
          <motion.div
            className="logo-wrapper"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <Logo size="large" variant="gradient" />
          </motion.div>
          <h1>baFive</h1>
          <p className="subtitle">Professional networking platform</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            className="success-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CheckCircle size={20} />
            <p>{successMessage}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={20} />
            <div>
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  placeholder="Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required={isSignUp}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader size={18} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="auth-divider">
          <div className="divider-line"></div>
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <div className="divider-line"></div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError('')
            setSuccessMessage('')
          }}
          className="btn-toggle"
          disabled={loading}
        >
          {isSignUp ? 'Sign In Instead' : 'Create Account'}
        </button>

        {/* Demo Login */}
        <div className="demo-section">
          <p className="demo-text">First time here?</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Try Demo'}
          </button>
        </div>
      </AnimatedCard>
      <ThemeSwitcher />
    </div>
  )
}
