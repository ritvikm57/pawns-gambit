// Pawn's Gambit logo — matches the actual brand mark:
// royal blue background, dark pawn foreground, lighter piece silhouettes behind, radial glow
// Replace `src` with the actual logo PNG once hosted: <img src="/logo.png" ... />
export default function Logo({ size = 36, className = '' }) {
  const id = `glow-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pawn's Gambit"
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="#4a9eff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1565c0" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`clip-${size}`}>
          <rect width="200" height="200" rx="28" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="200" height="200" rx="28" fill="#1565c0" />
      {/* Radial glow */}
      <rect width="200" height="200" rx="28" fill={`url(#${id})`} />

      <g clipPath={`url(#clip-${size})`} opacity="0.55">
        {/* Queen — top centre-left */}
        <g fill="#c8d8ed" transform="translate(42,18) scale(0.78)">
          <circle cx="36" cy="10" r="6" />
          <circle cx="20" cy="16" r="5" />
          <circle cx="52" cy="16" r="5" />
          <path d="M14 55 Q14 35 36 35 Q58 35 58 55 L54 70 H18 Z" />
          <rect x="14" y="69" width="44" height="8" rx="4" />
        </g>

        {/* Knight — right */}
        <g fill="#c8d8ed" transform="translate(116,40) scale(0.72)">
          <ellipse cx="36" cy="18" rx="18" ry="20" />
          <path d="M18 38 Q14 55 16 75 Q28 68 36 70 Q44 68 56 75 Q58 55 54 38 Q46 28 36 26 Q26 28 18 38Z" />
          <rect x="16" y="74" width="40" height="8" rx="4" />
          <circle cx="28" cy="12" r="4" fill="#1565c0" />
        </g>

        {/* Bishop — far left */}
        <g fill="#c8d8ed" transform="translate(14,62) scale(0.62)">
          <circle cx="36" cy="10" r="8" />
          <ellipse cx="36" cy="32" rx="12" ry="16" />
          <path d="M18 60 Q18 48 36 48 Q54 48 54 60 L50 75 H22 Z" />
          <rect x="14" y="74" width="44" height="8" rx="4" />
        </g>

        {/* Rook — bottom right */}
        <g fill="#c8d8ed" transform="translate(124,108) scale(0.62)">
          <rect x="10" y="0" width="14" height="18" rx="2" />
          <rect x="31" y="0" width="14" height="18" rx="2" />
          <rect x="52" y="0" width="14" height="18" rx="2" />
          <rect x="10" y="16" width="56" height="54" rx="2" />
          <rect x="6"  y="68" width="64" height="12" rx="4" />
        </g>

        {/* Small pawn — bottom left */}
        <g fill="#c8d8ed" transform="translate(22,118) scale(0.58)">
          <circle cx="36" cy="12" r="11" />
          <path d="M20 58 L22 42 Q26 32 36 32 Q46 32 50 42 L52 58 Z" />
          <rect x="16" y="57" width="40" height="10" rx="5" />
        </g>
      </g>

      {/* Foreground pawn — dark, prominent */}
      <g fill="#0d3a7a" transform="translate(62,30)">
        <circle cx="38" cy="26" r="22" />
        <path d="M12 138 L18 96 Q24 74 38 74 Q52 74 58 96 L64 138 Z" />
        <rect x="8" y="136" width="60" height="18" rx="9" />
      </g>
    </svg>
  )
}
