import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import type { Prompt } from '../api'
import { INTERESTS, PROMPT_QUESTIONS } from '../constants'
import { fileToPhoto } from '../utils'
import { useToast } from '../context/ui'

/* ---------------- Photos ---------------- */
export function PhotoGrid({ photos, onChange }: { photos: string[]; onChange: (p: string[]) => void }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const dragFrom = useRef<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const room = 6 - photos.length
      const added = await Promise.all([...files].slice(0, room).map((f) => fileToPhoto(f)))
      onChange([...photos, ...added])
      if (files.length > room) toast('You can add up to 6 photos', 'error')
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const move = (from: number, to: number) => {
    if (from === to) return
    const next = [...photos]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="photo-grid">
      {Array.from({ length: 6 }, (_, i) => {
        const src = photos[i]
        if (!src) {
          const isNext = i === photos.length
          return (
            <label key={`empty-${i}`} className={`photo-slot empty ${isNext ? 'next' : ''}`}>
              <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => addFiles(e.target.files)} />
              {busy && isNext ? <span className="spinner" /> : <ImagePlus size={26} />}
            </label>
          )
        }
        return (
          <motion.div
            layout
            key={src.slice(-40) + i}
            className={`photo-slot ${over === i ? 'over' : ''}`}
            draggable
            onDragStart={() => (dragFrom.current = i)}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(i)
            }}
            onDragLeave={() => setOver(null)}
            onDrop={() => {
              if (dragFrom.current !== null) move(dragFrom.current, i)
              dragFrom.current = null
              setOver(null)
            }}
            onClick={() => i > 0 && move(i, 0)}
            title={i > 0 ? 'Click to make main photo · drag to reorder' : 'Main photo'}
          >
            <img src={src} alt={`Photo ${i + 1}`} />
            {i === 0 && <span className="photo-main">Main</span>}
            <button
              type="button"
              className="photo-remove"
              aria-label="Remove photo"
              onClick={(e) => {
                e.stopPropagation()
                onChange(photos.filter((_, j) => j !== i))
              }}
            >
              <X size={14} strokeWidth={3} />
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ---------------- Prompts ---------------- */
export function PromptEditor({ prompts, onChange }: { prompts: Prompt[]; onChange: (p: Prompt[]) => void }) {
  const [picking, setPicking] = useState(false)
  const used = prompts.map((p) => p.question)

  const update = (i: number, answer: string) => onChange(prompts.map((p, j) => (j === i ? { ...p, answer } : p)))

  return (
    <div className="prompt-editor">
      <AnimatePresence initial={false}>
        {prompts.map((p, i) => (
          <motion.div
            key={p.question}
            className="prompt-edit card"
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="prompt-edit-head">
              <span className="pv-q">{p.question}</span>
              <button type="button" className="icon-btn" onClick={() => onChange(prompts.filter((_, j) => j !== i))} aria-label="Remove prompt">
                <Trash2 size={17} />
              </button>
            </div>
            <textarea
              className="textarea prompt-answer"
              maxLength={300}
              rows={2}
              value={p.answer}
              placeholder="Your answer…"
              autoFocus={!p.answer}
              onChange={(e) => update(i, e.target.value)}
            />
            <span className="prompt-count">{p.answer.length}/300</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {prompts.length < 3 && !picking && (
        <button type="button" className="prompt-add" onClick={() => setPicking(true)}>
          <Plus size={18} /> Add a prompt ({prompts.length}/3)
        </button>
      )}

      <AnimatePresence>
        {picking && (
          <motion.div className="prompt-picker card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="prompt-edit-head">
              <b>Pick a prompt</b>
              <button type="button" className="icon-btn" onClick={() => setPicking(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="prompt-options">
              {PROMPT_QUESTIONS.filter((q) => !used.includes(q)).map((q) => (
                <button
                  type="button"
                  key={q}
                  className="prompt-option"
                  onClick={() => {
                    onChange([...prompts, { question: q, answer: '' }])
                    setPicking(false)
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------- Interests ---------------- */
export function InterestPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (i: string) =>
    onChange(value.includes(i) ? value.filter((x) => x !== i) : value.length >= 10 ? value : [...value, i])
  return (
    <div className="chips-wrap">
      {INTERESTS.map((i) => (
        <motion.button
          type="button"
          key={i}
          className={`chip chip-toggle ${value.includes(i) ? 'on' : ''}`}
          onClick={() => toggle(i)}
          whileTap={{ scale: 0.92 }}
        >
          {i}
        </motion.button>
      ))}
    </div>
  )
}

/* ---------------- Choice cards ---------------- */
export function Choice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; emoji?: string }[]
  value: T | null | undefined
  onChange: (v: T) => void
}) {
  return (
    <div className="choices">
      {options.map((o) => (
        <motion.button
          type="button"
          key={o.value}
          className={`choice ${value === o.value ? 'on' : ''}`}
          onClick={() => onChange(o.value)}
          whileTap={{ scale: 0.96 }}
        >
          {o.emoji && <span className="choice-emoji">{o.emoji}</span>}
          {o.label}
        </motion.button>
      ))}
    </div>
  )
}
