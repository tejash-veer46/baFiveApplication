import { useState } from 'react'
import { Palette } from 'lucide-react'
import useThemeContext from '../contexts/ThemeContext'
import './ThemeSwitcher.css'

interface Theme {
  id: string
  name: string
  colors: string[]
}

/**
 * Theme Switcher Component
 * Allows users to switch between multiple predefined color themes
 */
const themes: Theme[] = [
  { id: 'modern-blue', name: 'Modern Blue', colors: ['#7c3aed', '#3b82f6'] },
  { id: 'neon', name: 'Vibrant Neon', colors: ['#00f7ff', '#ff006e'] },
  { id: 'sunset', name: 'Warm Sunset', colors: ['#ff6b35', '#f7931e'] },
  { id: 'mint', name: 'Cool Mint', colors: ['#00d4aa', '#2dd4bf'] },
  { id: 'elegant', name: 'Elegant Dark', colors: ['#a855f7', '#ec4899'] },
  { id: 'ocean', name: 'Ocean Deep', colors: ['#0284c7', '#06b6d4'] },
  { id: 'dracula', name: 'Dracula Dark', colors: ['#ff79c6', '#bd93f9'] },
  { id: 'forest', name: 'Forest Green', colors: ['#10b981', '#34d399'] },
  { id: 'cyberpunk', name: 'Cyberpunk', colors: ['#fe0080', '#7928ca'] },
]

export default function ThemeSwitcher() {
  const { theme: currentTheme, setTheme } = useThemeContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="theme-switcher">
      <button
        className="theme-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch theme"
      >
        <Palette size={20} />
      </button>

      {isOpen && (
        <div className="theme-menu">
          <div className="theme-menu-header">Design Themes</div>
          <div className="themes-grid">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => {
                  setTheme(theme.id)
                  setIsOpen(false)
                }}
                title={theme.name}
              >
                <div className="theme-colors">
                  <div
                    className="color-dot"
                    style={{ backgroundColor: theme.colors[0] }}
                  />
                  <div
                    className="color-dot"
                    style={{ backgroundColor: theme.colors[1] }}
                  />
                </div>
                <span className="theme-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
