import { useState } from 'react'
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

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        if (!email || !password || !name || !department) {
          throw new Error('Please fill in all fields')
        }
        await authAPI.signup(name, email, password, department)
      } else {
        // Login
        if (!email || !password) {
          throw new Error('Please enter email and password')
        }
        await authAPI.login(email, password)
      }
      // Call parent onLogin to update state
      onLogin(email, password)
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
    <div className="login-container">
      <div className="login-visuals">
        <div className="floating-orb orb-one"></div>
        <div className="floating-orb orb-two"></div>
        <div className="floating-orb orb-three"></div>
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
          <p className="tagline">✨ Connect • Collaborate • Grow ✨</p>
          <p className="subtitle">Professional networking for your team</p>
        </div>

        {/* Error Message with better styling */}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={20} />
            <div className="error-content">
              <strong>Oops! Something went wrong</strong>
              <p>{error}</p>
              {error.includes('401') && <p className="error-hint">💡 Hint: Check your email and password</p>}
              {error.includes('email') && <p className="error-hint">💡 Please enter a valid email address</p>}
              {error.includes('password') && <p className="error-hint">💡 Password must be at least 6 characters</p>}
              {error.includes('already exists') && <p className="error-hint">💡 Try logging in instead, or use a different email</p>}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required={isSignUp}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
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
        <div className="toggle-auth">
          <p>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="toggle-btn"
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Demo Login */}
        <div className="demo-login">
          <p className="demo-text">Demo Mode</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Continue as Demo User'}
          </button>
        </div>
      </AnimatedCard>
      <ThemeSwitcher />
    </div>
  )
}
