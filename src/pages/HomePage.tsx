import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, User, LogOut, Users, Star, X, Zap } from 'lucide-react'
import ProfileCard from '../components/ProfileCard'
import Logo from '../components/Logo'
import ThemeSwitcher from '../components/ThemeSwitcher'
import MessagesPage from './MessagesPage'
import ProfilePage from './ProfilePage'
import { containerVariants, itemVariants, fadeInUp } from '../utils/animations'
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

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

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
      <motion.header 
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-left">
          <motion.div 
            className="logo-header"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo size="small" variant="gradient" />
            <span>baFive</span>
          </motion.div>
        </div>

        <div className="header-center">
          <nav className="nav-tabs">
            {[
              { id: 'discover', label: 'Discover', icon: Users },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as 'discover' | 'messages' | 'profile')}
                title={tab.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <tab.icon size={20} />
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <motion.button
            onClick={onLogout}
            className="logout-btn"
            title="Logout"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div 
              key="discover"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="discover-content"
            >
              {/* Connections Sidebar */}
              <motion.aside 
                className="sidebar"
                variants={itemVariants}
              >
                <motion.div 
                  className="matches-section"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h3>⭐ Connections</h3>
                  <div className="matches-list">
                    {matches.length === 0 ? (
                      <p className="no-matches">Connect with colleagues you're interested in!</p>
                    ) : (
                      <motion.div variants={containerVariants} initial="initial" animate="animate">
                        {matches.map((match) => (
                          <motion.div 
                            key={match.id} 
                            className="match-item"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, x: 4 }}
                          >
                            <img src={match.image} alt={match.name} />
                            <div className="match-info">
                              <span className="match-name">{match.name}</span>
                              <span className="match-dept">{match.department}</span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.aside>

              {/* Card Stack */}
              <motion.section 
                className="card-section"
                variants={itemVariants}
              >
                <AnimatePresence mode="wait">
                  {currentProfile && (
                    <ProfileCard
                      key={currentProfile.id}
                      profile={currentProfile}
                      onConnect={handleConnect}
                      onPass={handlePass}
                    />
                  )}
                </AnimatePresence>
              </motion.section>

              {/* Info Section */}
              <motion.aside 
                className="info-section"
                variants={itemVariants}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div className="current-user-info" whileHover={{ y: -5 }}>
                  <h3>You</h3>
                  <div className="user-card">
                    <img src={currentUser.profileImage} alt={currentUser.name} />
                    <h4>{currentUser.name}</h4>
                    <p>{currentUser.department}</p>
                  </div>
                </motion.div>
              </motion.aside>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <MessagesPage matches={matches} />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ProfilePage currentUser={currentUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ThemeSwitcher />
    </div>
  )
}
