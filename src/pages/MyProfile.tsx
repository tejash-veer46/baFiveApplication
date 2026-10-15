import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, LogOut, Pencil, Trash2 } from 'lucide-react'
import ProfileView from '../components/ProfileView'
import Modal from '../components/Modal'
import { api } from '../api'
import { useAuth, useMe } from '../context/auth'
import { useToast } from '../context/ui'
import './Profile.css'

export default function MyProfile() {
  const { me } = useMe()
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const checks = [
    { ok: me.photos.length >= 4, tip: 'Add at least 4 photos' },
    { ok: me.prompts.length === 3, tip: 'Answer all 3 prompts' },
    { ok: !!me.bio, tip: 'Write a short bio' },
    { ok: me.interests.length >= 3, tip: 'Pick 3+ interests' },
    { ok: !!me.jobTitle, tip: 'Add your job title' },
  ]
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
  const nextTip = checks.find((c) => !c.ok)?.tip

  const deleteAccount = async () => {
    try {
      await api.deleteMe()
      logout()
      toast('Your account has been deleted')
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  return (
    <div className="myp">
      <section className="myp-side">
        <div className="myp-card card">
          <div className="myp-avatar-wrap">
            <svg viewBox="0 0 120 120" className="myp-ring">
              <circle cx="60" cy="60" r="55" className="myp-ring-bg" />
              <motion.circle
                cx="60"
                cy="60"
                r="55"
                className="myp-ring-fg"
                strokeDasharray={2 * Math.PI * 55}
                initial={{ strokeDashoffset: 2 * Math.PI * 55 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 55 * (1 - score / 100) }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#FF4F6D" />
                  <stop offset="1" stopColor="#7C5CFF" />
                </linearGradient>
              </defs>
            </svg>
            <img src={me.photos[0]} alt="" className="myp-avatar" />
            <span className="myp-score">{score}%</span>
          </div>
          <h2>
            {me.name}
            {me.age ? `, ${me.age}` : ''}
          </h2>
          <p className="muted">{[me.jobTitle, me.department].filter(Boolean).join(' · ') || me.email}</p>
          {nextTip && (
            <p className="myp-tip">
              <b>Boost your profile:</b> {nextTip}
            </p>
          )}
          <button className="btn btn-grad btn-block" onClick={() => navigate('/profile/edit')}>
            <Pencil size={17} /> Edit profile
          </button>
        </div>

        <div className="myp-card card myp-settings">
          <button onClick={logout}>
            <LogOut size={18} /> Sign out
          </button>
          <button className="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={18} /> Delete account
          </button>
        </div>
      </section>

      <section className="myp-preview">
        <p className="myp-preview-label">
          <Eye size={16} /> This is how others see you
        </p>
        <ProfileView profile={me} />
      </section>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} className="confirm">
        <h2>Delete your account?</h2>
        <p className="muted">Your profile, matches and messages will be permanently removed.</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
            Keep my account
          </button>
          <button className="btn danger-btn" onClick={deleteAccount}>
            Delete forever
          </button>
        </div>
      </Modal>
    </div>
  )
}
