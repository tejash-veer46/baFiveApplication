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
  const [successMessage, setSuccessMessage] = useState('')

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
    <div className="login-container">
      <div className="login-gradient-bg"></div>
      
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
