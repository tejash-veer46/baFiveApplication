import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeColors {
  primary1: string
  primary2: string
  background: string
  text: string
}

interface ThemeContextType {
  theme: string
  colors: ThemeColors
  gradient: string
  setTheme: (theme: string) => void
}

const THEME_COLORS: Record<string, ThemeColors> = {
  'modern-blue': {
    primary1: '#7c3aed',
    primary2: '#3b82f6',
    background: '#0f172a',
    text: '#f8fafc'
  },
  'neon': {
    primary1: '#00f7ff',
    primary2: '#ff006e',
    background: '#0a0e27',
    text: '#ffffff'
  },
  'sunset': {
    primary1: '#ff6b35',
    primary2: '#f7931e',
    background: '#1a1410',
    text: '#faf5f0'
  },
  'mint': {
    primary1: '#00d4aa',
    primary2: '#2dd4bf',
    background: '#0d2e2a',
    text: '#f0fdfb'
  },
  'elegant': {
    primary1: '#a855f7',
    primary2: '#ec4899',
    background: '#0f0a1a',
    text: '#faf8ff'
  },
  'ocean': {
    primary1: '#0284c7',
    primary2: '#06b6d4',
    background: '#0c1e2a',
    text: '#f0f9ff'
  },
  'dracula': {
    primary1: '#ff79c6',
    primary2: '#bd93f9',
    background: '#282a36',
    text: '#f8f8f2'
  },
  'forest': {
    primary1: '#10b981',
    primary2: '#34d399',
    background: '#0f2a1c',
    text: '#f0fdf4'
  },
  'cyberpunk': {
    primary1: '#fe0080',
    primary2: '#7928ca',
    background: '#0a0009',
    text: '#ffccff'
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>('modern-blue')
  const [colors, setColors] = useState<ThemeColors>(THEME_COLORS['modern-blue'])

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedTheme') || 'modern-blue'
    setThemeState(saved)
    setColors(THEME_COLORS[saved] || THEME_COLORS['modern-blue'])
    document.documentElement.className = `theme-${saved}`
  }, [])

  const setTheme = (newTheme: string) => {
    const themeToSet = THEME_COLORS[newTheme] ? newTheme : 'modern-blue'
    setThemeState(themeToSet)
    setColors(THEME_COLORS[themeToSet])
    localStorage.setItem('selectedTheme', themeToSet)
    document.documentElement.className = `theme-${themeToSet}`
  }

  const gradient = `linear-gradient(135deg, ${colors.primary1} 0%, ${colors.primary2} 100%)`

  return (
    <ThemeContext.Provider value={{ theme, colors, gradient, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

export default useThemeContext
