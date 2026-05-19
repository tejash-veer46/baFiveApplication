import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import { authAPI } from './services/api'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      authAPI
        .getProfile()
        .then((user) => {
          setCurrentUser(user)
          setIsLoggedIn(true)
        })
        .catch(() => {
          // Token is invalid or expired
          localStorage.removeItem('auth_token')
          setIsLoggedIn(false)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      setCurrentUser(response.user)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    setIsLoggedIn(false)
    setCurrentUser(null)
  }

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="app">
        {!isLoggedIn ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <HomePage currentUser={currentUser} onLogout={handleLogout} />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App
