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

/** Resize an image file in the browser and return a compact JPEG data URL. */
export const fileToPhoto = (file: File, maxSize = 1080): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("That image couldn't be read"))
    }
    img.src = url
  })

export const firstName = (name: string) => name.split(' ')[0]
