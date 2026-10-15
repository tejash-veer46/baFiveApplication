import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Flower2, Heart } from 'lucide-react'
import Modal from './Modal'
import type { LikePreview } from './ProfileView'
import { firstName } from '../utils'

interface Props {
  preview: LikePreview | null
  name: string
  rosesLeft: number
  sending: boolean
  onClose: () => void
  onSend: (comment: string, rose: boolean) => void
}

export default function LikeComposer({ preview, name, rosesLeft, sending, onClose, onSend }: Props) {
  const [comment, setComment] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (preview) {
      setComment('')
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [preview])

  const send = (rose: boolean) => onSend(comment.trim(), rose)

  return (
    <Modal open={!!preview} onClose={onClose} className="composer">
      {preview && (
        <>
          <div className="composer-preview">
            {preview.photo && <img src={preview.photo} alt="" />}
            {preview.prompt && (
              <div className="composer-prompt">
                <p className="pv-q">{preview.prompt.question}</p>
                <p className="pv-a">{preview.prompt.answer}</p>
              </div>
            )}
          </div>
          <div className="composer-body">
            <textarea
              ref={inputRef}
              className="textarea"
              rows={2}
              maxLength={300}
              placeholder={`Add a comment for ${firstName(name)}… (optional)`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(false)
                }
              }}
            />
            <p className="composer-tip">A comment makes your like stand out — and becomes your first message if you match.</p>
            <div className="composer-actions">
              <motion.button
                className="btn btn-rose"
                disabled={sending || rosesLeft === 0}
                onClick={() => send(true)}
                whileHover={{ scale: rosesLeft ? 1.03 : 1 }}
                title={rosesLeft ? 'Roses are seen first' : "You've used today's rose"}
              >
                <Flower2 size={18} /> Rose {rosesLeft === 0 && '· used'}
              </motion.button>
              <motion.button className="btn btn-grad" disabled={sending} onClick={() => send(false)} whileHover={{ scale: 1.03 }}>
                <Heart size={18} fill="currentColor" /> Send like
              </motion.button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
