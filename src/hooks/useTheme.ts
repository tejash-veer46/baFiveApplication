import { useEffect, useState } from 'react'

interface ThemeColors {
  primary1: string
  primary2: string
  background: string
  text: string
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

export function useTheme() {
  const [theme, setTheme] = useState<string>('modern-blue')
  const [colors, setColors] = useState<ThemeColors>(THEME_COLORS['modern-blue'])

  useEffect(() => {
    // Load saved theme from localStorage
    const saved = localStorage.getItem('selectedTheme') || 'modern-blue'
    setTheme(saved)
    setColors(THEME_COLORS[saved] || THEME_COLORS['modern-blue'])

    // Listen for theme changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedTheme' && e.newValue) {
        setTheme(e.newValue)
        setColors(THEME_COLORS[e.newValue] || THEME_COLORS['modern-blue'])
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return {
    theme,
    colors,
    gradient: `linear-gradient(135deg, ${colors.primary1} 0%, ${colors.primary2} 100%)`
  }
}

export function getThemeGradient(themeName: string = 'modern-blue'): string {
  const themeColors = THEME_COLORS[themeName] || THEME_COLORS['modern-blue']
  return `linear-gradient(135deg, ${themeColors.primary1} 0%, ${themeColors.primary2} 100%)`
}

export default useTheme
