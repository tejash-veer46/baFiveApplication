// API Service for baFive Frontend
// Communicates with backend on http://localhost:5000

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface User {
  id: string
  name: string
  email: string
  department: string
  bio?: string
  age?: number
  profile_image?: string
  interests?: string[]
}

interface AuthResponse {
  token: string
  user: User
}

interface Profile {
  id: string
  name: string
  department: string
  bio?: string
  age?: number
  profile_image?: string
  interests?: string[]
  isPro?: boolean
}

interface Connection {
  id: string
  user_id: string
  connected_with_id: string
  created_at: string
}

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  read: boolean
  created_at: string
}

// Store auth token in localStorage
const getAuthToken = (): string | null => localStorage.getItem('auth_token')
const setAuthToken = (token: string) => localStorage.setItem('auth_token', token)
const clearAuthToken = () => localStorage.removeItem('auth_token')

// Helper function for API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

// ============ AUTHENTICATION ============

export const authAPI = {
  // Sign up new user
  signup: async (
    name: string,
    email: string,
    password: string,
    department: string
  ): Promise<AuthResponse> => {
    const data = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, department }),
    })
    setAuthToken(data.token)
    return data
  },

  // Login existing user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setAuthToken(data.token)
    return data
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    return apiRequest('/api/auth/profile', { method: 'GET' })
  },

  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    return apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  // Logout
  logout: () => {
    clearAuthToken()
  },
}

// ============ PROFILES (DISCOVERY) ============

export const profileAPI = {
  // Get paginated list of profiles for discovery
  getDiscoveryProfiles: async (
    page: number = 1,
    limit: number = 10
  ): Promise<Profile[]> => {
    return apiRequest(`/api/profiles?page=${page}&limit=${limit}`, {
      method: 'GET',
    })
  },

  // Get specific profile details
  getProfile: async (userId: string): Promise<Profile> => {
    return apiRequest(`/api/profiles/${userId}`, { method: 'GET' })
  },

  // Search profiles by name or department
  searchProfiles: async (query: string): Promise<Profile[]> => {
    return apiRequest(`/api/profiles/search/${query}`, { method: 'GET' })
  },
}

// ============ CONNECTIONS ============

export const connectionAPI = {
  // Connect with a user
  connectUser: async (targetUserId: string): Promise<Connection> => {
    return apiRequest('/api/connections/connect', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    })
  },

  // Get all connections
  getConnections: async (): Promise<any[]> => {
    return apiRequest('/api/connections', { method: 'GET' })
  },

  // Disconnect from a user
  disconnect: async (connectionId: string): Promise<{ message: string }> => {
    return apiRequest(`/api/connections/${connectionId}`, {
      method: 'DELETE',
    })
  },

  // Check if connected with specific user
  checkConnection: async (targetUserId: string): Promise<boolean> => {
    try {
      const response = await apiRequest(
        `/api/connections/check/${targetUserId}`,
        { method: 'GET' }
      )
      return response.connected
    } catch {
      return false
    }
  },
}

// ============ MESSAGES ============

export const messageAPI = {
  // Send a message
  sendMessage: async (recipientId: string, message: string): Promise<Message> => {
    return apiRequest('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipientId, message }),
    })
  },

  // Get conversations list
  getConversations: async (): Promise<any[]> => {
    return apiRequest('/api/messages/conversations', { method: 'GET' })
  },

  // Get message history with a user
  getMessages: async (
    otherUserId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<Message[]> => {
    return apiRequest(
      `/api/messages/${otherUserId}?page=${page}&limit=${limit}`,
      { method: 'GET' }
    )
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<{ message: string }> => {
    return apiRequest(`/api/messages/${messageId}`, {
      method: 'DELETE',
    })
  },
}

// ============ HEALTH CHECK ============

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
