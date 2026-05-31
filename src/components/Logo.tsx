import './Logo.css'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  variant?: 'light' | 'dark' | 'gradient'
}

/**
 * baFive Logo Component
 * Displays a modern network-style logo representing the 5-colleague connection system
 */
export default function Logo({ size = 'medium', variant = 'gradient' }: LogoProps) {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64
  }

  const dimension = sizeMap[size]

  return (
    <div className={`logo-container logo-${size} logo-${variant}`}>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="url(#gradientBg)"
          opacity="0.1"
        />

        {/* Network nodes - representing 5 colleagues connecting */}
        {/* Center node */}
        <circle cx="32" cy="32" r="5" fill="url(#gradient)" className="node-center" />

        {/* Top node */}
        <circle cx="32" cy="12" r="4" fill="url(#gradient)" className="node" />
        {/* Line to top */}
        <line x1="32" y1="17" x2="32" y2="28" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />

        {/* Bottom node */}
        <circle cx="32" cy="52" r="4" fill="url(#gradient)" className="node" />
        {/* Line to bottom */}
        <line x1="32" y1="36" x2="32" y2="48" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />

        {/* Left node */}
        <circle cx="12" cy="32" r="4" fill="url(#gradient)" className="node" />
        {/* Line to left */}
        <line x1="16" y1="32" x2="27" y2="32" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />

        {/* Right node */}
        <circle cx="52" cy="32" r="4" fill="url(#gradient)" className="node" />
        {/* Line to right */}
        <line x1="37" y1="32" x2="48" y2="32" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />

        {/* Top-left node */}
        <circle cx="18" cy="18" r="3.5" fill="url(#gradient)" className="node-small" />
        {/* Line to top-left */}
        <line x1="22" y1="22" x2="28" y2="28" stroke="url(#gradient)" strokeWidth="1.2" opacity="0.5" />

        {/* Top-right node */}
        <circle cx="46" cy="18" r="3.5" fill="url(#gradient)" className="node-small" />
        {/* Line to top-right */}
        <line x1="42" y1="22" x2="36" y2="28" stroke="url(#gradient)" strokeWidth="1.2" opacity="0.5" />

        {/* Bottom-left node */}
        <circle cx="18" cy="46" r="3.5" fill="url(#gradient)" className="node-small" />
        {/* Line to bottom-left */}
        <line x1="22" y1="42" x2="28" y2="36" stroke="url(#gradient)" strokeWidth="1.2" opacity="0.5" />

        {/* Bottom-right node */}
        <circle cx="46" cy="46" r="3.5" fill="url(#gradient)" className="node-small" />
        {/* Line to bottom-right */}
        <line x1="42" y1="42" x2="36" y2="36" stroke="url(#gradient)" strokeWidth="1.2" opacity="0.5" />

        {/* Gradients */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#333333" />
          </linearGradient>
          <linearGradient id="gradientBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#4a4a4a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
