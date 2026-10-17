const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/$/, '')
export const API_URL = /^https?:\/\//.test(rawApiUrl) ? rawApiUrl : `https://${rawApiUrl}`

/*
 * Free hosting puts the API to sleep when idle; the first request can take ~30-60s.
 * Requests that take a while flip a "waking up" flag the UI shows as a banner.
 */
let pending = 0
let slowTimer: ReturnType<typeof setTimeout> | undefined
const setWaking = (waking: boolean) => window.dispatchEvent(new CustomEvent('bafive:waking', { detail: waking }))
const trackStart = () => {
  if (pending++ === 0) slowTimer = setTimeout(() => setWaking(true), 8000)
}
const trackEnd = () => {
  if (--pending === 0) {
    clearTimeout(slowTimer)
    setWaking(false)
  }
}

/** Fire-and-forget ping so the API starts waking while the page loads. */
export const warmUp = () => {
  trackStart()
  fetch(API_URL + '/health')
    .catch(() => {})
    .finally(trackEnd)
}

export type Gender = 'man' | 'woman' | 'nonbinary'
export type Preference = 'men' | 'women' | 'everyone'

export interface Prompt {
  question: string
  answer: string
}

/** Usernames only. Visible to yourself and your matches. */
export interface Socials {
  github?: string
  linkedin?: string
  instagram?: string
}

export interface Profile {
  id: number
  name: string
  age: number | null
  gender: Gender | null
  pronouns: string | null
  department: string | null
  jobTitle: string | null
  hometown: string | null
  heightCm: number | null
  bio: string | null
  photos: string[]
  prompts: Prompt[]
  interests: string[]
  sharedInterests: string[]
  activeRecently: boolean
  /** Only present on your own profile and on people you've matched with. */
  socials?: Socials
}

export interface Me extends Profile {
  email: string
  birthdate: string | null
  interestedIn: Preference
  onboarded: boolean
}

export type ProfileUpdate = Partial<{
  name: string
  birthdate: string
  gender: Gender
  interestedIn: Preference
  pronouns: string | null
  department: string | null
  jobTitle: string | null
  hometown: string | null
  heightCm: number | null
  bio: string | null
  photos: string[]
  prompts: Prompt[]
  interests: string[]
  socials: Socials
}>

export type LikeTarget = { type: 'photo' | 'prompt'; index: number }

export interface ReceivedLike {
  likeId: number
  comment: string | null
  isRose: boolean
  likedAt: string
  target: { type: 'photo' | 'prompt' | 'profile'; index: number | null; photo: string | null; prompt: Prompt | null }
  profile: Profile
}

export interface Message {
  id: number
  senderId: number
  body: string
  createdAt: string
  readAt: string | null
}

export interface MatchSummary {
  id: number
  createdAt: string
  unread: number
  lastMessage: Message | null
  profile: Profile
}

export interface LikeResult {
  matched: boolean
  matchId?: number
  profile?: Profile
}

export interface Summary {
  likes: number
  unread: number
  roses: number
}

const TOKEN_KEY = 'bafive-token'
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

/** Extra fields some errors carry, e.g. a 403 login for an unverified email or a 429 resend. */
export interface ErrorDetails {
  needsVerification?: boolean
  email?: string
  codeSent?: boolean
  retryAfter?: number
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public details: ErrorDetails = {}) {
    super(message)
  }
}

/** With email codes on, signup asks for the emailed code; with them off it signs in straight away. */
export type SignupResult =
  | { needsVerification: true; email: string; codeSent: boolean }
  | { needsVerification?: undefined; token: string; user: Me }

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = tokenStore.get()
  let res: Response
  trackStart()
  try {
    res = await fetch(API_URL + path, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, "Can't reach baFive right now. Check your connection and try again.")
  } finally {
    trackEnd()
  }
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('bafive:unauthorized'))
    const { error, ...details } = data
    throw new ApiError(res.status, error || `Request failed (${res.status})`, details)
  }
  return data as T
}

export const api = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<SignupResult>('/api/auth/signup', { method: 'POST', body }),
  verifyEmail: (body: { email: string; code: string }) =>
    request<{ token: string; user: Me }>('/api/auth/verify-email', { method: 'POST', body }),
  resendCode: (email: string) => request<{ ok: true }>('/api/auth/resend-code', { method: 'POST', body: { email } }),
  forgotPassword: (email: string) => request<{ ok: true }>('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (body: { email: string; code: string; newPassword: string }) =>
    request<{ token: string; user: Me }>('/api/auth/reset-password', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: Me }>('/api/auth/login', { method: 'POST', body }),
  me: () => request<Me>('/api/auth/me'),
  updateMe: (body: ProfileUpdate) => request<Me>('/api/auth/me', { method: 'PUT', body }),
  deleteMe: () => request<void>('/api/auth/me', { method: 'DELETE' }),

  discover: (limit = 10) => request<Profile[]>(`/api/discover?limit=${limit}`),
  profile: (id: number) => request<Profile>(`/api/profiles/${id}`),
  like: (userId: number, opts: { target?: LikeTarget; comment?: string; rose?: boolean } = {}) =>
    request<LikeResult>('/api/likes', {
      method: 'POST',
      body: {
        userId,
        targetType: opts.target?.type,
        targetIndex: opts.target?.index,
        comment: opts.comment,
        rose: opts.rose,
      },
    }),
  pass: (userId: number) => request<{ ok: true }>('/api/passes', { method: 'POST', body: { userId } }),
  unpass: (userId: number) => request<void>(`/api/passes/${userId}`, { method: 'DELETE' }),
  receivedLikes: () => request<ReceivedLike[]>('/api/likes/received'),
  summary: () => request<Summary>('/api/summary'),

  matches: () => request<MatchSummary[]>('/api/matches'),
  match: (id: number) => request<{ id: number; createdAt: string; profile: Profile }>(`/api/matches/${id}`),
  unmatch: (id: number) => request<void>(`/api/matches/${id}`, { method: 'DELETE' }),
  messages: (matchId: number, after = 0) => request<Message[]>(`/api/matches/${matchId}/messages?after=${after}`),
  send: (matchId: number, body: string) =>
    request<Message>(`/api/matches/${matchId}/messages`, { method: 'POST', body: { body } }),
}
