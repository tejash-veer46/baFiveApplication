import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MessageCircle } from 'lucide-react'
import type { Profile } from '../api'
import { firstName } from '../utils'
import { pickupLines } from '../pickupLines'

interface Props {
  match: { matchId: number; profile: Profile } | null
  myPhoto?: string
  onMessage: (matchId: number) => void
  onClose: () => void
}

const COLORS = ['#FF4F6D', '#FF7A59', '#7C5CFF', '#FFB627', '#22C993', '#ffffff']

export default function MatchCelebration({ match, myPhoto, onMessage, onClose }: Props) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 900,
        y: -(Math.random() * 500 + 200),
        r: Math.random() * 720 - 360,
        size: Math.random() * 10 + 6,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.25,
        heart: i % 4 === 0,
      })),
    [match?.matchId],
  )

  return createPortal(
    <AnimatePresence>
      {match && (
        <motion.div className="celebrate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="celebrate-burst" aria-hidden="true">
            {confetti.map((c) => (
              <motion.span
                key={c.id}
                className="confetti"
                style={{ background: c.heart ? 'none' : c.color, width: c.size, height: c.heart ? c.size : c.size * 0.45, color: c.color }}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: c.x, y: [0, c.y, c.y + 700], rotate: c.r, opacity: [1, 1, 0] }}
                transition={{ duration: 2.6, delay: c.delay, ease: [0.15, 0.6, 0.4, 1] }}
              >
                {c.heart && <Heart size={c.size + 6} fill="currentColor" strokeWidth={0} />}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="celebrate-inner"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <motion.h2
              className="celebrate-title"
              initial={{ opacity: 0, y: -20, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ delay: 0.15 }}
            >
              It's a match!
            </motion.h2>
            <p className="celebrate-sub">You and {firstName(match.profile.name)} liked each other.</p>
            <p className="celebrate-line">
              Stuck for words? Try: “{pickupLines(firstName(match.profile.name), match.matchId * 31, 1)[0]}”
            </p>

            <div className="celebrate-photos">
              <motion.img
                src={myPhoto}
                alt="You"
                initial={{ x: -120, rotate: -20, opacity: 0 }}
                animate={{ x: 18, rotate: -8, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
              />
              <motion.img
                src={match.profile.photos[0]}
                alt={match.profile.name}
                initial={{ x: 120, rotate: 20, opacity: 0 }}
                animate={{ x: -18, rotate: 8, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
              />
              <motion.span
                className="celebrate-heart"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <Heart size={30} fill="currentColor" strokeWidth={0} />
              </motion.span>
            </div>

            <div className="celebrate-actions">
              <button className="btn btn-grad btn-block" onClick={() => onMessage(match.matchId)}>
                <MessageCircle size={18} /> Send a message
              </button>
              <button className="btn btn-block celebrate-later" onClick={onClose}>
                Keep exploring
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
