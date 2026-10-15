import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Flower2, Heart, RefreshCw, Sparkles, Undo2, X } from 'lucide-react'
import ProfileView, { type LikePreview } from '../components/ProfileView'
import LikeComposer from '../components/LikeComposer'
import MatchCelebration from '../components/MatchCelebration'
import { api, type Profile } from '../api'
import { useMe } from '../context/auth'
import { useSummary, useToast } from '../context/ui'
import { firstName } from '../utils'
import './Discover.css'

type Exit = 'pass' | 'like'

const variants = {
  enter: { opacity: 0, y: 40, scale: 0.97 },
  center: { opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 },
  exit: (dir: Exit) =>
    dir === 'pass'
      ? { opacity: 0, x: -420, rotate: -10, transition: { duration: 0.38, ease: [0.4, 0, 1, 1] as const } }
      : { opacity: 0, y: -120, scale: 0.9, transition: { duration: 0.42, ease: [0.4, 0, 1, 1] as const } },
}

export default function Discover() {
  const { me } = useMe()
  const { summary, refresh } = useSummary()
  const toast = useToast()
  const navigate = useNavigate()

  const [queue, setQueue] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [exitDir, setExitDir] = useState<Exit>('pass')
  const [preview, setPreview] = useState<LikePreview | null>(null)
  const [sending, setSending] = useState(false)
  const [celebrate, setCelebrate] = useState<{ matchId: number; profile: Profile } | null>(null)
  const [lastPassed, setLastPassed] = useState<Profile | null>(null)
  const fetching = useRef(false)

  const loadMore = useCallback(async (reset = false) => {
    if (fetching.current) return
    fetching.current = true
    try {
      const batch = await api.discover(10)
      setQueue((q) => {
        const base = reset ? [] : q
        const seen = new Set(base.map((p) => p.id))
        return [...base, ...batch.filter((p) => !seen.has(p.id))]
      })
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      fetching.current = false
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadMore(true)
  }, [loadMore])

  const current = queue[0]

  const advance = (dir: Exit) => {
    setExitDir(dir)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setQueue((q) => {
      const next = q.slice(1)
      if (next.length < 3) setTimeout(() => loadMore(), 0)
      return next
    })
  }

  const pass = useCallback(() => {
    if (!current) return
    api.pass(current.id).catch(() => {})
    setLastPassed(current)
    advance('pass')
  }, [current])

  const undo = () => {
    if (!lastPassed) return
    api.unpass(lastPassed.id).catch(() => {})
    setExitDir('like')
    setQueue((q) => [lastPassed, ...q])
    setLastPassed(null)
  }

  const sendLike = async (comment: string, rose: boolean) => {
    if (!current || !preview) return
    setSending(true)
    try {
      const res = await api.like(current.id, { target: preview.target, comment: comment || undefined, rose })
      setPreview(null)
      setLastPassed(null)
      advance('like')
      if (res.matched && res.matchId && res.profile) {
        setTimeout(() => setCelebrate({ matchId: res.matchId!, profile: res.profile! }), 350)
      } else {
        toast(rose ? `Rose sent to ${firstName(current.name)} 🌹` : `Like sent to ${firstName(current.name)}`, 'love')
      }
      refresh()
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (preview || celebrate) return
      if ((e.target as HTMLElement).closest('input, textarea')) return
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'x') pass()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pass, preview, celebrate])

  return (
    <div className="discover">
      <div className="discover-col">
        <div className="page-head">
          <div>
            <h1 className="page-title">Discover</h1>
            <p className="muted page-sub">Like something specific to start a conversation.</p>
          </div>
          <span className={`rose-pill ${summary.roses ? '' : 'used'}`} title="Roses are seen first">
            <Flower2 size={16} /> {summary.roses} rose{summary.roses === 1 ? '' : 's'} left
          </span>
        </div>

        {loading ? (
          <div className="pv-skeleton">
            <div className="sk sk-title" />
            <div className="sk sk-photo" />
            <div className="sk sk-prompt" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout" custom={exitDir}>
            {current ? (
              <motion.div key={current.id} custom={exitDir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                <ProfileView profile={current} onLike={setPreview} />
                <div className="discover-end">
                  <button className="btn btn-ghost" onClick={pass}>
                    <X size={18} /> Not for me
                  </button>
                  <button className="btn btn-grad" onClick={() => setPreview({ target: { type: 'photo', index: 0 }, photo: current.photos[0] })}>
                    <Heart size={18} fill="currentColor" /> Like {firstName(current.name)}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" className="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="empty-icon">
                  <Sparkles size={36} />
                </div>
                <h2>You're all caught up</h2>
                <p>You've seen everyone who fits your preferences for now. New people join every day — check back soon.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => loadMore(true)}>
                    <RefreshCw size={17} /> Refresh
                  </button>
                  <button className="btn btn-ghost" onClick={() => navigate('/likes')}>
                    See who likes you
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {current && !loading && (
        <div className="pass-dock">
          <AnimatePresence>
            {lastPassed && (
              <motion.button
                className="undo-btn"
                onClick={undo}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                aria-label={`Undo pass on ${lastPassed.name}`}
                title="Undo"
              >
                <Undo2 size={20} />
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            className="pass-btn"
            onClick={pass}
            whileHover={{ scale: 1.08, rotate: -8 }}
            whileTap={{ scale: 0.88 }}
            aria-label={`Pass on ${current.name}`}
            title="Pass (← or X)"
          >
            <X size={30} strokeWidth={2.6} />
          </motion.button>
        </div>
      )}

      <aside className="discover-rail">
        <div className="rail-card card">
          <div className="rail-rose">
            <Flower2 size={22} />
          </div>
          <h3>Your daily rose</h3>
          <p className="muted">
            Roses go to the top of someone's likes. You get one every day — use it on someone who really stands out.
          </p>
        </div>
        <div className="rail-card card">
          <h3>How baFive works</h3>
          <ol className="rail-steps">
            <li>
              <b>Tap ♥ on a photo or prompt</b> that catches your eye.
            </li>
            <li>
              <b>Add a comment</b> — it becomes your opener if you match.
            </li>
            <li>
              <b>Match & chat</b> in real time. Then actually meet up.
            </li>
          </ol>
          <p className="rail-keys muted">
            Tip: press <kbd>←</kbd> or <kbd>X</kbd> to pass.
          </p>
        </div>
      </aside>

      <LikeComposer
        preview={preview}
        name={current?.name ?? ''}
        rosesLeft={summary.roses}
        sending={sending}
        onClose={() => setPreview(null)}
        onSend={sendLike}
      />
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
