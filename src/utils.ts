/** Server timestamps are UTC "YYYY-MM-DD HH:MM:SS(.fff)". */
export const parseDate = (s: string) => new Date(s.replace(' ', 'T') + (s.endsWith('Z') ? '' : 'Z'))

export const timeAgo = (s: string) => {
  const diff = (Date.now() - parseDate(s).getTime()) / 1000
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return parseDate(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const clockTime = (s: string) =>
  parseDate(s).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

export const dayLabel = (s: string) => {
  const d = parseDate(s)
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export const formatHeight = (cm: number) => {
  const inches = Math.round(cm / 2.54)
  return `${Math.floor(inches / 12)}′${inches % 12}″`
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("That image couldn't be read. Try a JPEG or PNG."))
    }
    img.src = url
  })

/**
 * Resize an image file in the browser and return a compact JPEG data URL.
 * Phone photos are ~12 MP (≈50 MB once decoded), so call this one file at a time and free memory as we go.
 */
export const fileToPhoto = async (file: File, maxSize = 1080): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file')
  const img = await loadImage(file)
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser ran out of memory. Try adding fewer photos at once.')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const data = canvas.toDataURL('image/jpeg', 0.8)
  // Release the decoded pixels right away instead of waiting for garbage collection.
  canvas.width = canvas.height = 0
  img.src = ''
  return data
}

export const firstName = (name: string) => name.split(' ')[0]
