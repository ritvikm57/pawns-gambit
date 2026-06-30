function Instagram({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkedIn({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function Facebook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function XTwitter({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function Reddit({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

function Lichess({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="-8 0 52 50" fill="currentColor">
      <path d="M38.956.5c-3.53.418-6.452 2.338-8.936 4.95-.028.03-.058.058-.087.088l-8.384 8.375-2.353-2.353 1.47-1.471-2.133-2.131-12.38 12.38 2.134 2.133 1.47-1.47 2.225 2.225-3.772 3.773-1.47-1.471-1.47 1.472-7.025 7.024 1.47 1.471 4.41-4.41 1.472 1.472-5.882 5.88 1.47 1.471 5.883-5.88 1.471 1.471-4.41 4.409 1.47 1.471 7.025-7.024 1.47-1.47-1.471-1.472 3.774-3.773 1.956 1.956-1.47 1.471 2.133 2.133 4.412-4.41c2.282 4.432 1.498 9.952-2.051 13.5-4.182 4.185-10.698 4.726-15.477 1.64l-1.59 2.798c5.757 3.577 13.261 2.84 18.228-2.127 4.19-4.19 5.545-10.037 4.07-15.407l9.818-9.806c.015-.016.03-.03.046-.045 2.53-2.395 4.45-5.31 4.75-8.87.13-1.56-.4-3.14-1.57-4.32-1.14-1.14-2.69-1.66-4.22-1.49z" />
    </svg>
  )
}

export const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/pawns.gambit/',                          icon: Instagram },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/company/pawn-s-gambit/',                  icon: LinkedIn  },
  { label: 'Facebook',  href: 'https://www.facebook.com/profile.php?id=61581721517479',           icon: Facebook  },
  { label: 'X',         href: 'https://x.com/pawnsgambit204',                                     icon: XTwitter  },
  { label: 'Reddit',    href: 'https://www.reddit.com/r/PawnsGambit/',                            icon: Reddit    },
  { label: 'Lichess',   href: 'https://lichess.org/team/pawns-gambit-chess-community',            icon: Lichess   },
]
