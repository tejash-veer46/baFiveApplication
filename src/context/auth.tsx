import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStore, type Me, type SignupResult } from '../api'

interface AuthState {
  user: Me | null
  loading: boolean
  login: (email: string, password: string) => Promise<Me>
  /** Creates an unverified account; the user then enters the emailed code via verifyEmail. */
  signup: (name: string, email: string, password: string) => Promise<SignupResult>
  verifyEmail: (email: string, code: string) => Promise<Me>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<Me>
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

  const signIn = async (session: Promise<{ token: string; user: Me }>) => {
    const { token, user } = await session
    tokenStore.set(token)
    setUser(user)
    return user
  }

  const login = (email: string, password: string) => signIn(api.login({ email, password }))
  const signup = (name: string, email: string, password: string) => api.signup({ name, email, password })
  const verifyEmail = (email: string, code: string) => signIn(api.verifyEmail({ email, code }))
  const resetPassword = (email: string, code: string, newPassword: string) =>
    signIn(api.resetPassword({ email, code, newPassword }))

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyEmail, resetPassword, logout, setUser }}>
      {children}
    </AuthContext.Provider>
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
