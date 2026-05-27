// Pawn's Gambit icon mark — stylised chess pawn in navy/white
export default function Logo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pawn's Gambit"
    >
      <rect width="48" height="48" rx="8" fill="#1e3a55" />
      {/* Pawn shape */}
      <circle cx="24" cy="13" r="7" fill="white" />
      <path
        d="M16 38 L18 28 Q20 24 24 24 Q28 24 30 28 L32 38 Z"
        fill="white"
      />
      <rect x="14" y="37" width="20" height="4" rx="2" fill="white" />
    </svg>
  )
}
