import { useState } from 'react'
import { Heart, X } from 'lucide-react'
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
  onLike: () => void
  onPass: () => void
}

export default function ProfileCard({ profile, onLike, onPass }: ProfileCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  const handleLike = () => {
    setIsAnimating(true)
    setDirection('right')
    setTimeout(() => {
      onLike()
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
          <h2>{profile.name}, {profile.age}</h2>
          <p className="department">{profile.department}</p>
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
          onClick={handleLike}
          className="btn-action btn-like"
          title="Like"
        >
          <Heart size={28} fill="currentColor" />
        </button>
      </div>

      {/* Gradient Hints */}
      <div className="swipe-hints">
        <div className="hint hint-left">PASS</div>
        <div className="hint hint-right">LIKE</div>
      </div>
    </div>
  )
}
