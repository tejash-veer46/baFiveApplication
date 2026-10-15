import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { Choice, InterestPicker, PhotoGrid, PromptEditor } from '../components/ProfileFields'
import { api, type Gender, type Preference, type Prompt } from '../api'
import { useMe } from '../context/auth'
import { useToast } from '../context/ui'
import { DEPARTMENTS } from '../constants'
import { formatHeight } from '../utils'
import './Profile.css'

function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="edit-section card">
      <h3>{title}</h3>
      {sub && <p className="muted edit-sub">{sub}</p>}
      {children}
    </section>
  )
}

export default function EditProfile() {
  const { me, setMe } = useMe()
  const toast = useToast()
  const navigate = useNavigate()
  const initial = useMemo(
    () => ({
      name: me.name,
      pronouns: me.pronouns ?? '',
      jobTitle: me.jobTitle ?? '',
      department: me.department ?? '',
      hometown: me.hometown ?? '',
      heightCm: me.heightCm ?? 170,
      bio: me.bio ?? '',
      gender: me.gender as Gender,
      interestedIn: me.interestedIn,
      photos: me.photos,
      prompts: me.prompts,
      interests: me.interests,
    }),
    [me],
  )
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)

  const problems = [
    !form.name.trim() && 'Name is required',
    form.photos.length === 0 && 'Add at least one photo',
    form.prompts.some((p) => !p.answer.trim()) && 'Finish your prompt answers',
  ].filter(Boolean) as string[]

  const save = async () => {
    if (problems.length) return toast(problems[0], 'error')
    setSaving(true)
    try {
      const user = await api.updateMe({
        ...form,
        name: form.name.trim(),
        pronouns: form.pronouns || null,
        jobTitle: form.jobTitle || null,
        department: form.department || null,
        hometown: form.hometown || null,
        bio: form.bio || null,
        prompts: form.prompts.map((p: Prompt) => ({ ...p, answer: p.answer.trim() })),
      })
      setMe(user)
      toast('Profile saved ✨')
      navigate('/profile')
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="edit">
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="icon-btn" onClick={() => navigate('/profile')} aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <h1 className="page-title">Edit profile</h1>
        </div>
      </div>

      <Section title="Photos" sub="Drag to reorder. Click a photo to make it your main one.">
        <PhotoGrid photos={form.photos} onChange={(v) => set('photos', v)} />
      </Section>

      <Section title="Prompts" sub="Your answers are the #1 thing people comment on.">
        <PromptEditor prompts={form.prompts} onChange={(v) => set('prompts', v)} />
      </Section>

      <Section title="About you">
        <div className="edit-grid">
          <label className="field">
            <span>First name</span>
            <input className="input" value={form.name} maxLength={50} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className="field">
            <span>Pronouns</span>
            <input className="input" value={form.pronouns} maxLength={30} placeholder="e.g. she/her" onChange={(e) => set('pronouns', e.target.value)} />
          </label>
          <label className="field">
            <span>Job title</span>
            <input className="input" value={form.jobTitle} maxLength={60} onChange={(e) => set('jobTitle', e.target.value)} />
          </label>
          <label className="field">
            <span>Team</span>
            <select className="select" value={form.department} onChange={(e) => set('department', e.target.value)}>
              <option value="">—</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Hometown</span>
            <input className="input" value={form.hometown} maxLength={60} onChange={(e) => set('hometown', e.target.value)} />
          </label>
          <label className="field">
            <span>
              Height · <b style={{ color: 'var(--ink)' }}>{form.heightCm} cm · {formatHeight(form.heightCm)}</b>
            </span>
            <input className="range" type="range" min={140} max={210} value={form.heightCm} onChange={(e) => set('heightCm', Number(e.target.value))} />
          </label>
        </div>
        <label className="field" style={{ marginTop: 16 }}>
          <span>Bio</span>
          <textarea className="textarea" maxLength={500} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </label>
      </Section>

      <Section title="Interests" sub={`${form.interests.length}/10 selected`}>
        <InterestPicker value={form.interests} onChange={(v) => set('interests', v)} />
      </Section>

      <Section title="Dating preferences">
        <div className="field">
          <span>I am a</span>
          <Choice<Gender>
            value={form.gender}
            onChange={(v) => set('gender', v)}
            options={[
              { value: 'woman', label: 'Woman' },
              { value: 'man', label: 'Man' },
              { value: 'nonbinary', label: 'Non-binary' },
            ]}
          />
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <span>Show me</span>
          <Choice<Preference>
            value={form.interestedIn}
            onChange={(v) => set('interestedIn', v)}
            options={[
              { value: 'men', label: 'Men' },
              { value: 'women', label: 'Women' },
              { value: 'everyone', label: 'Everyone' },
            ]}
          />
        </div>
      </Section>

      <AnimatePresence>
        {dirty && (
          <motion.div className="save-bar" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 32 }}>
            <span>You have unsaved changes</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-soft" onClick={() => setForm(initial)} disabled={saving}>
                Discard
              </button>
              <button className="btn btn-sm btn-grad" onClick={save} disabled={saving}>
                <Check size={16} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
