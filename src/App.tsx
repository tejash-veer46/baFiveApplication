import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/auth'
import AppShell from './components/AppShell'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Discover from './pages/Discover'
import Likes from './pages/Likes'
import Matches from './pages/Matches'
import MyProfile from './pages/MyProfile'
import EditProfile from './pages/EditProfile'

function Splash() {
  return (
    <div className="center-fill" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )
}

function RequireAuth({ children, allowIncomplete = false }: { children: ReactNode; allowIncomplete?: boolean }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />
  if (!user.onboarded && !allowIncomplete) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

export default function App() {
  const { user, loading } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={loading ? <Splash /> : user ? <Navigate to={user.onboarded ? '/discover' : '/onboarding'} replace /> : <Landing />}
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuth allowIncomplete>
            {user?.onboarded ? <Navigate to="/discover" replace /> : <Onboarding />}
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/discover" element={<Discover />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/matches/:matchId?" element={<Matches />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
