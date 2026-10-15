import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Flower2, Heart, HeartHandshake, X } from 'lucide-react'
import Modal from '../components/Modal'
import ProfileView from '../components/ProfileView'
import MatchCelebration from '../components/MatchCelebration'
import { api, type Profile, type ReceivedLike } from '../api'
import { useMe } from '../context/auth'
import { useSummary, useToast } from '../context/ui'
import { firstName, timeAgo } from '../utils'
import './Likes.css'

const likedWhat = (l: ReceivedLike) =>
  l.target.type === 'photo' ? 'Liked your photo' : l.target.type === 'prompt' ? 'Liked your prompt' : 'Liked your profile'

export default function Likes() {
  const { me } = useMe()
  const { summary, refresh } = useSummary()
  const toast = useToast()
  const navigate = useNavigate()
  const [likes, setLikes] = useState<ReceivedLike[] | null>(null)
  const [open, setOpen] = useState<ReceivedLike | null>(null)
  const [busy, setBusy] = useState(false)
  const [celebrate, setCelebrate] = useState<{ matchId: number; profile: Profile } | null>(null)

  const load = () =>
    api
      .receivedLikes()
      .then(setLikes)
      .catch((e) => toast(e.message, 'error'))

  useEffect(() => {
    load()
    // Reload when the badge says new likes arrived.
  }, [summary.likes])

  const remove = (id: number) => setLikes((ls) => ls?.filter((l) => l.profile.id !== id) ?? null)

  const matchBack = async (like: ReceivedLike) => {
    setBusy(true)
    try {
      const res = await api.like(like.profile.id)
      setOpen(null)
      remove(like.profile.id)
      if (res.matched && res.matchId) setCelebrate({ matchId: res.matchId, profile: like.profile })
      refresh()
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const dismiss = async (like: ReceivedLike) => {
    setOpen(null)
    remove(like.profile.id)
    await api.pass(like.profile.id).catch(() => {})
    refresh()
  }

  return (
    <div className="likes">
      <div className="page-head">
        <div>
          <h1 className="page-title">Likes You</h1>
          <p className="muted page-sub">
            {likes?.length ? `${likes.length} ${likes.length === 1 ? 'person likes' : 'people like'} you. Like them back to match.` : 'People who like you show up here.'}
          </p>
        </div>
      </div>

      {likes === null ? (
        <div className="center-fill">
          <div className="spinner" />
        </div>
      ) : likes.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <HeartHandshake size={36} />
          </div>
          <h2>No likes yet</h2>
          <p>Great prompts get noticed. Add a witty answer or a fresh photo to stand out.</p>
          <button className="btn btn-primary" onClick={() => navigate('/profile/edit')}>
            Polish my profile
          </button>
        </div>
      ) : (
        <motion.div className="likes-grid" layout>
          <AnimatePresence>
            {likes.map((l, i) => (
              <motion.button
                layout
                key={l.likeId}
                className={`like-card ${l.isRose ? 'rose' : ''}`}
                onClick={() => setOpen(l)}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
                whileHover={{ y: -6 }}
              >
                <div className="like-card-top">
                  <span className="like-card-what">
                    {l.isRose ? <Flower2 size={14} /> : <Heart size={14} fill="currentColor" />}
                    {l.isRose ? 'Sent you a rose' : likedWhat(l)}
                  </span>
                  <span className="like-card-time">{timeAgo(l.likedAt)}</span>
                </div>
                {l.comment && <p className="like-card-comment">“{l.comment}”</p>}
                <div className="like-card-photo">
                  <img src={l.profile.photos[0]} alt={l.profile.name} loading="lazy" />
                  <span className="like-card-name">
                    {l.profile.name}
                    {l.profile.age ? `, ${l.profile.age}` : ''}
                  </span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} tall className="profile-modal">
        {open && (
          <>
            <div className="like-context">
              <span className="like-card-what">
                {open.isRose ? <Flower2 size={14} /> : <Heart size={14} fill="currentColor" />}
                {firstName(open.profile.name)} {open.isRose ? 'sent you a rose for' : open.target.type === 'photo' ? 'liked your photo' : open.target.type === 'prompt' ? 'liked your prompt' : 'liked your profile'}
              </span>
              <div className="like-context-row">
                {open.target.photo && <img src={open.target.photo} alt="" />}
                {open.target.prompt && (
                  <div>
                    <p className="pv-q">{open.target.prompt.question}</p>
                    <p className="like-context-answer">{open.target.prompt.answer}</p>
                  </div>
                )}
              </div>
              {open.comment && <p className="like-context-comment">{open.comment}</p>}
            </div>
            <ProfileView profile={open.profile} />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => dismiss(open)} disabled={busy}>
                <X size={18} /> Remove
              </button>
              <button className="btn btn-grad" onClick={() => matchBack(open)} disabled={busy}>
                <Heart size={18} fill="currentColor" /> Match with {firstName(open.profile.name)}
              </button>
            </div>
          </>
        )}
      </Modal>

      <MatchCelebration
        match={celebrate}
        myPhoto={me.photos[0]}
        onClose={() => setCelebrate(null)}
        onMessage={(id) => {
          setCelebrate(null)
          navigate(`/matches/${id}`)
        }}
      />
    </div>
  )
}
