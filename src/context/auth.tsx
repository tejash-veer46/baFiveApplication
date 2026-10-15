import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStore, type Me } from '../api'

interface AuthState {
  user: Me | null
  loading: boolean
  login: (email: string, password: string) => Promise<Me>
  signup: (name: string, email: string, password: string) => Promise<Me>
  logout: () => void
  setUser: (u: Me) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null)
  const [loading, setLoading] = useState(!!tokenStore.get())

  useEffect(() => {
    if (!tokenStore.get()) return
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener('bafive:unauthorized', logout)
    return () => window.removeEventListener('bafive:unauthorized', logout)
  }, [logout])

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login({ email, password })
    tokenStore.set(token)
    setUser(user)
    return user
  }

  const signup = async (name: string, email: string, password: string) => {
    const { token, user } = await api.signup({ name, email, password })
    tokenStore.set(token)
    setUser(user)
    return user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/** For components rendered only behind the auth guard. */
export const useMe = () => {
  const { user, setUser } = useAuth()
  if (!user) throw new Error('useMe used without a signed-in user')
  return { me: user, setMe: setUser }
}
