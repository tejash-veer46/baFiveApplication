import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Building2, Cake, Github, Heart, Home, Instagram, Linkedin, Ruler, Sparkles, User } from 'lucide-react'
import type { LikeTarget, Profile, Socials } from '../api'
import { GENDER_LABEL } from '../constants'
import { formatHeight } from '../utils'

export interface LikePreview {
  target: LikeTarget
  photo?: string
  prompt?: { question: string; answer: string }
}

interface Props {
  profile: Profile
  onLike?: (preview: LikePreview) => void
  /** Highlights the item that was liked (used in "Likes you"). */
  highlight?: { type: string; index: number | null }
}

export const SOCIAL_LINKS: { key: keyof Socials; label: string; icon: ReactNode; url: (handle: string) => string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram', icon: <Instagram size={17} />, url: (h) => `https://instagram.com/${h}`, placeholder: '@username or profile link' },
  { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={17} />, url: (h) => `https://www.linkedin.com/in/${h}`, placeholder: 'linkedin.com/in/your-name' },
  { key: 'github', label: 'GitHub', icon: <Github size={17} />, url: (h) => `https://github.com/${h}`, placeholder: 'username or profile link' },
]

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
}

function LikeButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <motion.button
      className="like-btn"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    >
      <Heart size={24} strokeWidth={2.4} />
    </motion.button>
  )
}

export default function ProfileView({ profile, onLike, highlight }: Props) {
  const p = profile
  const isHi = (type: string, index: number) => highlight?.type === type && highlight.index === index

  const photo = (i: number) =>
    p.photos[i] && (
      <motion.figure key={`photo-${i}`} className={`pv-photo ${isHi('photo', i) ? 'hi' : ''}`} {...reveal}>
        <img src={p.photos[i]} alt={`${p.name}, photo ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
        {onLike && (
          <LikeButton
            label={`Like ${p.name}'s photo`}
            onClick={() => onLike({ target: { type: 'photo', index: i }, photo: p.photos[i] })}
          />
        )}
      </motion.figure>
    )

  const prompt = (i: number) =>
    p.prompts[i] && (
      <motion.div key={`prompt-${i}`} className={`pv-prompt card ${isHi('prompt', i) ? 'hi' : ''}`} {...reveal}>
        <p className="pv-q">{p.prompts[i].question}</p>
        <p className="pv-a">{p.prompts[i].answer}</p>
        {onLike && (
          <LikeButton
            label={`Like ${p.name}'s answer`}
            onClick={() => onLike({ target: { type: 'prompt', index: i }, prompt: p.prompts[i] })}
          />
        )}
      </motion.div>
    )

  const vitals: [ReactNode, string | null | undefined][] = [
    [<Cake size={17} />, p.age ? String(p.age) : null],
    [<User size={17} />, [p.gender && GENDER_LABEL[p.gender], p.pronouns].filter(Boolean).join(' · ')],
    [<Ruler size={17} />, p.heightCm ? formatHeight(p.heightCm) : null],
    [<Briefcase size={17} />, p.jobTitle],
    [<Building2 size={17} />, p.department],
    [<Home size={17} />, p.hometown],
  ]
  const shownVitals = vitals.filter(([, v]) => v)
  const socials = SOCIAL_LINKS.filter((s) => p.socials?.[s.key])

  const about = (p.bio || p.interests.length > 0) && (
    <motion.div key="about" className="pv-about card" {...reveal}>
      {p.bio && <p className="pv-bio">{p.bio}</p>}
      {p.interests.length > 0 && (
        <div className="pv-interests">
          {p.interests.map((i) => (
            <span key={i} className={`chip ${p.sharedInterests.includes(i) ? 'chip-shared' : ''}`}>
              {p.sharedInterests.includes(i) && <Sparkles size={14} />}
              {i}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="pv">
      <motion.header className="pv-head" {...reveal}>
        <div>
          <h1>{p.name}</h1>
          {p.activeRecently && <span className="pv-active">● Active today</span>}
        </div>
        {p.sharedInterests.length > 0 && (
          <span className="pv-shared">
            <Sparkles size={14} /> {p.sharedInterests.length} shared interest{p.sharedInterests.length > 1 ? 's' : ''}
          </span>
        )}
      </motion.header>

      {photo(0)}
      {prompt(0)}

      {shownVitals.length > 0 && (
        <motion.div className="pv-vitals card" {...reveal}>
          {shownVitals.map(([icon, value], i) => (
            <span key={i} className="pv-vital">
              {icon}
              {value}
            </span>
          ))}
        </motion.div>
      )}

      {socials.length > 0 && (
        <motion.div className="pv-socials card" {...reveal}>
          {socials.map((s) => (
            <a key={s.key} className="pv-social" href={s.url(p.socials![s.key]!)} target="_blank" rel="noopener noreferrer">
              {s.icon}
              <span>
                <b>{s.label}</b> {s.key === 'instagram' ? '@' : ''}
                {p.socials![s.key]}
              </span>
            </a>
          ))}
        </motion.div>
      )}

      {photo(1)}
      {prompt(1)}
      {photo(2)}
      {about}
      {prompt(2)}
      {photo(3)}
      {photo(4)}
      {photo(5)}
    </div>
  )
}
