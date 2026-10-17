import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Compass, Heart, LogOut, MessageCircle, Palette } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/auth'
import { useSign, useSummary } from '../context/ui'
import { SIGNS } from '../theme'

export default function AppShell() {
  const { user, logout } = useAuth()
  const { summary } = useSummary()
  const { sign, cycle } = useSign()
  const location = useLocation()
  const navigate = useNavigate()
  const outlet = useOutlet()

  const tabs = [
    { to: '/discover', label: 'Discover', icon: Compass, badge: 0 },
    { to: '/likes', label: 'Likes You', icon: Heart, badge: summary.likes },
    { to: '/matches', label: 'Matches', icon: MessageCircle, badge: summary.unread },
  ]

  // Keep the chat route under the same animation key as the list so switching threads doesn't remount the page.
  const section = location.pathname.startsWith('/matches') ? '/matches' : location.pathname
  const inChat = /^\/matches\/\d+/.test(location.pathname)

  return (
    <div className={`shell ${inChat ? 'in-chat' : ''}`}>
      <aside className="sidebar">
        <button className="sidebar-logo" onClick={() => navigate('/discover')} aria-label="baFive home">
          <Logo size={34} />
        </button>
        <nav className="nav">
          {tabs.map((t) => (
            <NavLink key={t.to} to={t.to} className="nav-item">
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <t.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="nav-label">{t.label}</span>
                  {t.badge > 0 && <span className="badge nav-badge">{t.badge > 99 ? '99+' : t.badge}</span>}
                </>
              )}
            </NavLink>
          ))}
          <NavLink to="/profile" className="nav-item">
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                {user?.photos[0] ? (
                  <img className={`nav-avatar ${isActive ? 'on' : ''}`} src={user.photos[0]} alt="" />
                ) : (
                  <span className="nav-avatar" />
                )}
                <span className="nav-label">Profile</span>
              </>
            )}
          </NavLink>
        </nav>
        <div className="sidebar-foot">
          <button className="nav-item" onClick={cycle} title="Change the sign colour">
            <Palette size={20} />
            <span className="nav-label">{SIGNS.find((s) => s.id === sign)?.label}</span>
          </button>
          <button className="nav-item" onClick={logout}>
            <LogOut size={20} />
            <span className="nav-label">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            className="page"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
