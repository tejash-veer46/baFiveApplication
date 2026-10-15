import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, MessageCircleHeart, MoreHorizontal, Send, UserRound, UserX } from 'lucide-react'
import Modal from '../components/Modal'
import ProfileView from '../components/ProfileView'
import { api, type MatchSummary, type Message, type Profile } from '../api'
import { useMe } from '../context/auth'
import { useSummary, useToast } from '../context/ui'
import { clockTime, dayLabel, firstName, timeAgo } from '../utils'
import './Matches.css'

export default function Matches() {
  const { matchId } = useParams()
  const activeId = matchId ? Number(matchId) : null
  const { me } = useMe()
  const { summary } = useSummary()
  const toast = useToast()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<MatchSummary[] | null>(null)

  const loadList = useCallback(
    () =>
      api
        .matches()
        .then(setMatches)
        .catch((e) => toast(e.message, 'error')),
    [toast],
  )

  useEffect(() => {
    loadList()
  }, [loadList, summary.unread, activeId])

  const fresh = matches?.filter((m) => !m.lastMessage) ?? []
  const convos = matches?.filter((m) => m.lastMessage) ?? []

  return (
    <div className={`matches ${activeId ? 'has-active' : ''}`}>
      <section className="m-list">
        <div className="page-head">
          <div>
            <h1 className="page-title">Matches</h1>
            <p className="muted page-sub">Don't keep them waiting.</p>
          </div>
        </div>

        {matches === null ? (
          <div className="center-fill">
            <div className="spinner" />
          </div>
        ) : matches.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <MessageCircleHeart size={36} />
            </div>
            <h2>No matches yet</h2>
            <p>When someone likes you back, you can chat here. Go find your people!</p>
            <button className="btn btn-primary" onClick={() => navigate('/discover')}>
              Start discovering
            </button>
          </div>
        ) : (
          <>
            {fresh.length > 0 && (
              <div className="m-fresh">
                <h4 className="m-label">New matches</h4>
                <div className="m-fresh-row">
                  {fresh.map((m, i) => (
                    <motion.button
                      key={m.id}
                      className={`m-fresh-item ${m.id === activeId ? 'on' : ''}`}
                      onClick={() => navigate(`/matches/${m.id}`)}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 22 }}
                      whileHover={{ y: -4 }}
                    >
                      <span className="m-ring">
                        <img src={m.profile.photos[0]} alt="" />
                      </span>
                      <span>{firstName(m.profile.name)}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {convos.length > 0 && <h4 className="m-label">Conversations</h4>}
            <div className="m-convos">
              {convos.map((m) => {
                const theirTurn = m.lastMessage!.senderId === me.id
                return (
                  <motion.button
                    layout
                    key={m.id}
                    className={`m-convo ${m.id === activeId ? 'on' : ''} ${m.unread ? 'unread' : ''}`}
                    onClick={() => navigate(`/matches/${m.id}`)}
                  >
                    <img src={m.profile.photos[0]} alt="" />
                    <div className="m-convo-text">
                      <div className="m-convo-top">
                        <b>{m.profile.name}</b>
                        <span className="m-convo-time">{timeAgo(m.lastMessage!.createdAt)}</span>
                      </div>
                      <p>
                        {theirTurn && 'You: '}
                        {m.lastMessage!.body}
                      </p>
                    </div>
                    {m.unread > 0 ? <span className="badge">{m.unread}</span> : !theirTurn && <span className="your-turn">Your turn</span>}
                  </motion.button>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className="m-chat-wrap">
        {activeId ? (
          <Chat key={activeId} matchId={activeId} onGone={() => { loadList(); navigate('/matches') }} />
        ) : (
          matches &&
          matches.length > 0 && (
            <div className="m-placeholder">
              <MessageCircleHeart size={56} strokeWidth={1.4} />
              <h2>Pick a conversation</h2>
              <p className="muted">Say something better than “hey” 😉</p>
            </div>
          )
        )}
      </section>
    </div>
  )
}

function openers(p: Profile) {
  const out: string[] = []
  if (p.prompts[0]) out.push(`Okay, I need the full story behind “${p.prompts[0].answer.slice(0, 40)}${p.prompts[0].answer.length > 40 ? '…' : ''}”`)
  if (p.sharedInterests[0]) out.push(`Fellow ${p.sharedInterests[0].toLowerCase()} fan! What got you into it?`)
  out.push(`Coffee this week? I know a great spot near the office ☕`)
  if (p.hometown) out.push(`${p.hometown}! What do you miss most about it?`)
  return out.slice(0, 3)
}

function Chat({ matchId, onGone }: { matchId: number; onGone: () => void }) {
  const { me } = useMe()
  const { refresh } = useSummary()
  const toast = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [menu, setMenu] = useState(false)
  const [confirmUnmatch, setConfirmUnmatch] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const lastId = useRef(0)

  useEffect(() => {
    api
      .match(matchId)
      .then((m) => setProfile(m.profile))
      .catch(() => onGone())
  }, [matchId])

  const poll = useCallback(async () => {
    try {
      const fresh = await api.messages(matchId, lastId.current)
      if (fresh.length) {
        lastId.current = fresh[fresh.length - 1].id
        setMessages((ms) => {
          const ids = new Set(ms.map((m) => m.id))
          return [...ms, ...fresh.filter((m) => !ids.has(m.id))]
        })
        refresh()
      }
    } catch {
      /* transient */
    } finally {
      setLoaded(true)
    }
  }, [matchId, refresh])

  useEffect(() => {
    poll()
    const id = setInterval(poll, 2500)
    return () => clearInterval(id)
  }, [poll])

  useLayoutEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: messages.length > 20 ? 'auto' : 'smooth' })
  }, [messages.length])

  const send = async (body = text) => {
    body = body.trim()
    if (!body) return
    setText('')
    if (input.current) input.current.style.height = 'auto'
    const temp: Message = { id: -Date.now(), senderId: me.id, body, createdAt: new Date().toISOString().replace('T', ' ').replace('Z', ''), readAt: null }
    setMessages((ms) => [...ms, temp])
    try {
      const saved = await api.send(matchId, body)
      lastId.current = Math.max(lastId.current, saved.id)
      setMessages((ms) =>
        ms.some((m) => m.id === saved.id) ? ms.filter((m) => m.id !== temp.id) : ms.map((m) => (m.id === temp.id ? saved : m)),
      )
    } catch (e) {
      setMessages((ms) => ms.filter((m) => m.id !== temp.id))
      setText(body)
      toast((e as Error).message, 'error')
    }
    input.current?.focus()
  }

  const unmatch = async () => {
    await api.unmatch(matchId).catch(() => {})
    toast(`You unmatched ${profile ? firstName(profile.name) : ''}`)
    onGone()
  }

  if (!profile) {
    return (
      <div className="center-fill">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="chat">
      <header className="chat-head">
        <button className="icon-btn chat-back" onClick={() => navigate('/matches')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <button className="chat-who" onClick={() => setShowProfile(true)}>
          <img src={profile.photos[0]} alt="" />
          <div>
            <b>{profile.name}</b>
            <span>{profile.activeRecently ? 'Active today' : profile.jobTitle || 'View profile'}</span>
          </div>
        </button>
        <div className="chat-menu-wrap">
          <button className="icon-btn" onClick={() => setMenu((m) => !m)} aria-label="More options">
            <MoreHorizontal size={22} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div className="chat-menu card" initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onMouseLeave={() => setMenu(false)}>
                <button onClick={() => { setMenu(false); setShowProfile(true) }}>
                  <UserRound size={17} /> View profile
                </button>
                <button className="danger" onClick={() => { setMenu(false); setConfirmUnmatch(true) }}>
                  <UserX size={17} /> Unmatch
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="chat-scroll" ref={scroller}>
        {loaded && messages.length === 0 && (
          <motion.div className="chat-intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <img src={profile.photos[0]} alt="" />
            <h3>You matched with {firstName(profile.name)}!</h3>
            <p className="muted">Break the ice with one of these, or write your own.</p>
            <div className="chat-openers">
              {openers(profile).map((o) => (
                <button key={o} className="chat-opener" onClick={() => send(o)}>
                  {o}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const mine = m.senderId === me.id
            const prev = messages[i - 1]
            const next = messages[i + 1]
            const newDay = !prev || dayLabel(prev.createdAt) !== dayLabel(m.createdAt)
            const lastOfGroup = !next || next.senderId !== m.senderId
            return (
              <Fragment key={m.id > 0 ? m.id : `t${m.id}`}>
                {newDay && <div className="chat-day">{dayLabel(m.createdAt)}</div>}
                <motion.div
                  className={`bubble-row ${mine ? 'mine' : ''}`}
                  initial={{ opacity: 0, y: 14, scale: 0.92 }}
                  animate={{ opacity: m.id < 0 ? 0.7 : 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                >
                  {!mine && (lastOfGroup ? <img className="bubble-avatar" src={profile.photos[0]} alt="" /> : <span className="bubble-avatar" />)}
                  <div className={`bubble ${lastOfGroup ? 'tail' : ''}`}>
                    {m.body}
                    <span className="bubble-time">{clockTime(m.createdAt)}</span>
                  </div>
                </motion.div>
              </Fragment>
            )
          })}
        </AnimatePresence>
        {messages.length > 0 && messages[messages.length - 1].senderId === me.id && messages[messages.length - 1].readAt && (
          <div className="chat-seen">Seen</div>
        )}
      </div>

      <form
        className="chat-compose"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <textarea
          ref={input}
          rows={1}
          autoFocus={window.matchMedia('(min-width: 901px)').matches}
          value={text}
          maxLength={1000}
          placeholder={`Message ${firstName(profile.name)}…`}
          onChange={(e) => {
            setText(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <motion.button className="chat-send" disabled={!text.trim()} whileTap={{ scale: 0.85 }} aria-label="Send">
          <Send size={19} />
        </motion.button>
      </form>

      <Modal open={showProfile} onClose={() => setShowProfile(false)} tall className="profile-modal">
        <ProfileView profile={profile} />
      </Modal>

      <Modal open={confirmUnmatch} onClose={() => setConfirmUnmatch(false)} className="confirm">
        <h2>Unmatch {firstName(profile.name)}?</h2>
        <p className="muted">Your conversation will be deleted and you won't see each other again. This can't be undone.</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setConfirmUnmatch(false)}>
            Cancel
          </button>
          <button className="btn btn-primary danger-btn" onClick={unmatch}>
            Unmatch
          </button>
        </div>
      </Modal>
    </div>
  )
}
