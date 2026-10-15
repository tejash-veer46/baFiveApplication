import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Logo from '../components/Logo'
import { Choice, InterestPicker, PhotoGrid, PromptEditor } from '../components/ProfileFields'
import { api, type Gender, type Preference, type Prompt } from '../api'
import { useAuth, useMe } from '../context/auth'
import { useToast } from '../context/ui'
import { DEPARTMENTS } from '../constants'
import { formatHeight } from '../utils'
import './Onboarding.css'

const maxBirthdate = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
}

export default function Onboarding() {
  const { me, setMe } = useMe()
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(me.name)
  const [birthdate, setBirthdate] = useState(me.birthdate ?? '')
  const [gender, setGender] = useState<Gender | null>(me.gender)
  const [interestedIn, setInterestedIn] = useState<Preference | null>(me.gender ? me.interestedIn : null)
  const [department, setDepartment] = useState(me.department ?? '')
  const [jobTitle, setJobTitle] = useState(me.jobTitle ?? '')
  const [hometown, setHometown] = useState(me.hometown ?? '')
  const [heightCm, setHeightCm] = useState(me.heightCm ?? 170)
  const [photos, setPhotos] = useState<string[]>(me.photos)
  const [prompts, setPrompts] = useState<Prompt[]>(me.prompts)
  const [interests, setInterests] = useState<string[]>(me.interests)
  const [bio, setBio] = useState(me.bio ?? '')

  const steps = [
    {
      title: <>Let's start with <em>you</em>.</>,
      sub: 'Your first name is shown on your profile. Your birthday is used to show your age.',
      valid: name.trim().length > 0 && !!birthdate && birthdate <= maxBirthdate(),
      body: (
        <div className="ob-fields">
          <label className="field">
            <span>First name</span>
            <input className="input input-xl" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} autoFocus />
          </label>
          <label className="field">
            <span>Birthday</span>
            <input className="input input-xl" type="date" value={birthdate} max={maxBirthdate()} onChange={(e) => setBirthdate(e.target.value)} />
          </label>
          {birthdate && birthdate > maxBirthdate() && <p className="ob-warn">You need to be 18 or older to use baFive.</p>}
        </div>
      ),
    },
    {
      title: <>Who are you <em>looking</em> for?</>,
      sub: "We'll only show you people whose preferences match yours.",
      valid: !!gender && !!interestedIn,
      body: (
        <div className="ob-fields">
          <div className="field">
            <span>I am a</span>
            <Choice<Gender>
              value={gender}
              onChange={setGender}
              options={[
                { value: 'woman', label: 'Woman', emoji: '👩' },
                { value: 'man', label: 'Man', emoji: '👨' },
                { value: 'nonbinary', label: 'Non-binary', emoji: '🌈' },
              ]}
            />
          </div>
          <div className="field">
            <span>Show me</span>
            <Choice<Preference>
              value={interestedIn}
              onChange={setInterestedIn}
              options={[
                { value: 'men', label: 'Men' },
                { value: 'women', label: 'Women' },
                { value: 'everyone', label: 'Everyone' },
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      title: <>The <em>9-to-5</em> (and beyond).</>,
      sub: 'Optional, but great conversation starters.',
      valid: true,
      body: (
        <div className="ob-fields">
          <div className="field">
            <span>Team</span>
            <div className="chips-wrap">
              {DEPARTMENTS.map((d) => (
                <button type="button" key={d} className={`chip chip-toggle ${department === d ? 'on' : ''}`} onClick={() => setDepartment(department === d ? '' : d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="ob-row">
            <label className="field">
              <span>Job title</span>
              <input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Product Designer" maxLength={60} />
            </label>
            <label className="field">
              <span>Hometown</span>
              <input className="input" value={hometown} onChange={(e) => setHometown(e.target.value)} placeholder="e.g. Pune" maxLength={60} />
            </label>
          </div>
          <label className="field">
            <span>
              Height · <b className="ob-height">{heightCm} cm · {formatHeight(heightCm)}</b>
            </span>
            <input className="range" type="range" min={140} max={210} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} />
          </label>
        </div>
      ),
    },
    {
      title: <>Show off your <em>best</em> side.</>,
      sub: 'Add at least 1 photo (up to 6). Drag to reorder. People can like a specific photo.',
      valid: photos.length >= 1,
      body: <PhotoGrid photos={photos} onChange={setPhotos} />,
    },
    {
      title: <>Give them something to <em>talk</em> about.</>,
      sub: 'Answer up to 3 prompts. A good answer gets way more comments than a photo.',
      valid: prompts.length >= 1 && prompts.every((p) => p.answer.trim()),
      body: <PromptEditor prompts={prompts} onChange={setPrompts} />,
    },
    {
      title: <>What are you <em>into</em>?</>,
      sub: "Pick up to 10. We'll highlight what you have in common with others.",
      valid: true,
      body: (
        <div className="ob-fields">
          <InterestPicker value={interests} onChange={setInterests} />
          <label className="field">
            <span>A short bio (optional)</span>
            <textarea className="textarea" value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} placeholder="Coffee snob, weekend hiker, will debate tabs vs spaces…" />
          </label>
        </div>
      ),
    },
  ]

  const current = steps[step]
  const last = step === steps.length - 1

  const finish = async () => {
    setSaving(true)
    try {
      const user = await api.updateMe({
        name: name.trim(),
        birthdate,
        gender: gender!,
        interestedIn: interestedIn!,
        department: department || null,
        jobTitle: jobTitle || null,
        hometown: hometown || null,
        heightCm,
        photos,
        prompts: prompts.map((p) => ({ ...p, answer: p.answer.trim() })),
        interests,
        bio: bio || null,
      })
      setMe(user)
      toast(`You're in, ${user.name}! 🎉`, 'love')
      navigate('/discover', { replace: true })
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const go = (delta: number) => {
    setDir(delta)
    setStep((s) => s + delta)
  }

  return (
    <div className="ob">
      <header className="ob-top">
        <Logo size={30} />
        <button className="btn btn-sm btn-soft" onClick={logout}>
          Sign out
        </button>
      </header>
      <div className="ob-progress">
        <motion.div className="ob-progress-bar" animate={{ width: `${((step + 1) / steps.length) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>

      <main className="ob-main">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.section
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="ob-step">
              Step {step + 1} of {steps.length}
            </p>
            <h1 className="ob-title">{current.title}</h1>
            <p className="ob-sub">{current.sub}</p>
            {current.body}
          </motion.section>
        </AnimatePresence>
      </main>

      <footer className="ob-foot">
        <button className="btn btn-ghost" onClick={() => go(-1)} disabled={step === 0 || saving} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-grad" disabled={!current.valid || saving} onClick={() => (last ? finish() : go(1))}>
          {last ? (saving ? 'Saving…' : 'Start exploring') : 'Continue'} <ArrowRight size={18} />
        </button>
      </footer>
    </div>
  )
}
