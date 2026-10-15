export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF4F6D" />
          <stop offset=".55" stopColor="#FF7A59" />
          <stop offset="1" stopColor="#7C5CFF" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="19" fill="url(#logo-g)" />
      <path
        d="M32 49s-15-9.2-15-20.2C17 22.8 21.3 19 26 19c2.8 0 4.8 1.4 6 3.3 1.2-1.9 3.2-3.3 6-3.3 4.7 0 9 3.8 9 9.8C47 39.8 32 49 32 49z"
        fill="#fff"
      />
    </svg>
  )
}

export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-word" style={{ fontSize: size * 0.82 }}>
        ba<em>Five</em>
      </span>
    </span>
  )
}
