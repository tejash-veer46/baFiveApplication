import { useState } from 'react'
import { Star, X } from 'lucide-react'
import './ProfileCard.css'

interface Profile {
  id: number
  name: string
  age: number
  department: string
  bio: string
  interests: string[]
  image: string
}

interface ProfileCardProps {
  profile: Profile
  onConnect: () => void
  onPass: () => void
}

/**
 * ProfileCard Component
 * Displays user profile with interactive connect/pass actions
 */
export default function ProfileCard({ profile, onConnect, onPass }: ProfileCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  const handleConnect = () => {
    setIsAnimating(true)
    setDirection('right')
    setTimeout(() => {
      onConnect()
      setIsAnimating(false)
      setDirection(null)
    }, 300)
  }

  const handlePass = () => {
    setIsAnimating(true)
    setDirection('left')
    setTimeout(() => {
      onPass()
      setIsAnimating(false)
      setDirection(null)
    }, 300)
  }

  return (
    <div className={`profile-card ${isAnimating ? `exit-${direction}` : ''}`}>
      {/* Card Image */}
      <div className="card-image-container">
        <img src={profile.image} alt={profile.name} className="card-image" />
        <div className="card-image-overlay"></div>

        {/* Profile Info Overlay */}
        <div className="profile-info-overlay">
          <div className="profile-header">
            <div>
              <h2>{profile.name}, {profile.age}</h2>
              <p className="department">{profile.department}</p>
            </div>
            <div className="profile-badge">
              <span>Pro</span>
            </div>
          </div>
          <p className="bio">{profile.bio}</p>

          {/* Interests */}
          <div className="interests">
            {profile.interests.map((interest, index) => (
              <span key={index} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <button
          onClick={handlePass}
          className="btn-action btn-pass"
          title="Pass"
        >
          <X size={28} />
        </button>

        <button
          onClick={handleConnect}
          className="btn-action btn-connect"
          title="Connect"
        >
          <Star size={28} fill="currentColor" />
        </button>
      </div>
    </div>
  )
}
