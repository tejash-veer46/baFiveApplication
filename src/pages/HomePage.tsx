import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, LogOut, Users, Star, X, Zap } from 'lucide-react'
import ProfileCard from '../components/ProfileCard'
import Logo from '../components/Logo'
import ThemeSwitcher from '../components/ThemeSwitcher'
import MessagesPage from './MessagesPage'
import ProfilePage from './ProfilePage'
import './HomePage.css'

interface HomePageProps {
  currentUser: any
  onLogout: () => void
}

const mockProfiles = [
  {
    id: 1,
    name: 'Sarah Chen',
    age: 28,
    department: 'Design',
    bio: 'UX Designer passionate about meaningful work experiences',
    interests: ['Design', 'Coffee', 'Hiking'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop'
  },
  {
    id: 2,
    name: 'James Rodriguez',
    age: 31,
    department: 'Engineering',
    bio: 'Full-stack developer | Coffee enthusiast | Gym regular',
    interests: ['Tech', 'Music', 'Travel'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop'
  },
  {
    id: 3,
    name: 'Emma Williams',
    age: 26,
    department: 'Marketing',
    bio: 'Marketing strategist | Love meeting new people',
    interests: ['Marketing', 'Food', 'Art'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop'
  },
  {
    id: 4,
    name: 'Michael Zhang',
    age: 29,
    department: 'Product',
    bio: 'Product manager | Startup enthusiast | Basketball',
    interests: ['Product', 'Sports', 'Startup'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=600&fit=crop'
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    age: 27,
    department: 'Operations',
    bio: 'Operations lead | Always up for lunch meetups',
    interests: ['Operations', 'Cooking', 'Travel'],
    image: 'https://images.unsplash.com/photo-1517960413843-0afc8d588338?w=500&h=600&fit=crop'
  }
]

export default function HomePage({ currentUser, onLogout }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'messages' | 'profile'>('discover')
  const [profiles, setProfiles] = useState(mockProfiles)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matches, setMatches] = useState<any[]>([])

  const handleConnect = () => {
    setMatches([...matches, profiles[currentIndex]])
    handleNext()
  }

  const handlePass = () => {
    handleNext()
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length)
  }

  const currentProfile = profiles[currentIndex]

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo-header">
            <Logo size="small" variant="gradient" />
            <span>baFive</span>
          </div>
        </div>

        <div className="header-center">
          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
              title="Discover colleagues"
            >
              <Users size={20} />
              Discover
            </button>
            <button
              className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
              title="Messages"
            >
              <MessageCircle size={20} />
              Messages
            </button>
            <button
              className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
              title="Your profile"
            >
              <User size={20} />
              Profile
            </button>
          </nav>
        </div>

        <div className="header-right">
          <motion.button
            onClick={onLogout}
            className="logout-btn"
            title="Logout"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'discover' && (
          <>
            {/* Connections Sidebar */}
            <aside className="sidebar">
              <div className="matches-section">
                <h3>⭐ Connections</h3>
                <div className="matches-list">
                  {matches.length === 0 ? (
                    <p className="no-matches">Connect with colleagues you're interested in!</p>
                  ) : (
                    matches.map((match) => (
                      <div key={match.id} className="match-item">
                        <img src={match.image} alt={match.name} />
                        <div className="match-info">
                          <span className="match-name">{match.name}</span>
                          <span className="match-dept">{match.department}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* Card Stack */}
            <section className="card-section">
              {currentProfile && (
                <ProfileCard
                  profile={currentProfile}
                  onConnect={handleConnect}
                  onPass={handlePass}
                />
              )}
            </section>

            {/* Info Section */}
            <aside className="info-section">
              <div className="current-user-info">
                <h3>You</h3>
                <div className="user-card">
                  <img src={currentUser.profileImage} alt={currentUser.name} />
                  <h4>{currentUser.name}</h4>
                  <p>{currentUser.department}</p>
                </div>
              </div>
            </aside>
          </>
        )}

        {activeTab === 'messages' && <MessagesPage matches={matches} />}
        {activeTab === 'profile' && <ProfilePage currentUser={currentUser} />}
      </main>

      <ThemeSwitcher />
    </div>
  )
}
