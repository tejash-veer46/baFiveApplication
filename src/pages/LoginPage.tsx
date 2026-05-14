import { useState } from 'react'
import { Heart, Loader } from 'lucide-react'
import { authAPI } from '../services/api'
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
      <div className="login-card">
        {/* Logo/Header */}
        <div className="login-header">
          <div className="logo">
            <Heart size={40} fill="currentColor" />
          </div>
          <h1>baFive</h1>
          <p>Connect with your colleagues</p>
        </div>

        {/* Error Message */}
        {error && <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

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
      </div>
    </div>
  )
}
