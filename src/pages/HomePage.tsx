import { useState } from 'react'
import { Heart, X, MessageCircle, Flame, LogOut } from 'lucide-react'
import ProfileCard from '../components/ProfileCard'
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
  const [profiles, setProfiles] = useState(mockProfiles)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matches, setMatches] = useState<any[]>([])

  const handleLike = () => {
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
          <div className="logo">
            <Flame size={24} fill="currentColor" />
            <span>baFive</span>
          </div>
        </div>

        <div className="header-center">
          <nav className="nav-tabs">
            <button className="nav-tab active">
              <Heart size={20} />
              Discover
            </button>
            <button className="nav-tab">
              <MessageCircle size={20} />
              Messages
            </button>
          </nav>
        </div>

        <div className="header-right">
          <div className="user-menu">
            <img src={currentUser.profileImage} alt={currentUser.name} className="user-avatar" />
            <button onClick={onLogout} className="logout-btn">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="matches-section">
            <h3>Liked by</h3>
            <div className="matches-list">
              {matches.length === 0 ? (
                <p className="no-matches">Start liking profiles to see your matches!</p>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="match-item">
                    <img src={match.image} alt={match.name} />
                    <span>{match.name}</span>
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
              onLike={handleLike}
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
      </main>
    </div>
  )
}
