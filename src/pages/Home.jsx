import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import carouselPic1 from '../assets/carousel-home-s3/pic1.jpeg'
import carouselPic2 from '../assets/carousel-home-s3/pic2.jpeg'
import carouselPic3 from '../assets/carousel-home-s3/pic3.jpeg'

const ChessPawn3D = lazy(() => import('../components/ChessPawn3D'))

// ─── Site-wide palette ─────────────────────────────────────────────────────────
const C = {
  ink:    '#0f1115',
  body:   '#454b57',
  faint:  '#8a909c',
  blue:   '#1565c0',
  glow:   '#4a9eff',
  line:   'rgba(15,17,21,0.08)',
  bg:     '#ffffff',
  bgAlt:  '#f6f7f9',
}

// ─── Fade / rise on scroll ─────────────────────────────────────────────────────
function FadeIn({ children, className = '', delay = 0, y = 26 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.10 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ─── Section eyebrow (light sections) ─────────────────────────────────────────
function Eyebrow({ children, n }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase mb-7" style={{ color: C.faint }}>
      {n && <span style={{ color: C.blue }}>{n}</span>}
      <span className="h-px w-8" style={{ background: C.line }} />
      {children}
    </p>
  )
}

// ─── Photo placeholder ─────────────────────────────────────────────────────────
function Photo({ label, className = '', aspect = 'aspect-[4/3]', rounded = 'rounded-2xl' }) {
  return (
    <div className={`relative overflow-hidden ${rounded} ${aspect} ${className}`}
         style={{ background: C.bgAlt, border: `1px solid ${C.line}` }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4" style={{ color: C.faint }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mx-auto mb-2.5 opacity-40">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="text-[11px] tracking-wide opacity-60">{label}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Photo carousel ───────────────────────────────────────────────────────────
const CAROUSEL_SLIDES = [carouselPic1, carouselPic2, carouselPic3]

function Carousel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % CAROUSEL_SLIDES.length), 3200)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
      {CAROUSEL_SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0, objectFit: 'cover' }}
        />
      ))}

      {[false, true].map(next => (
        <button
          key={String(next)}
          onClick={() => setIdx(i => next
            ? (i + 1) % CAROUSEL_SLIDES.length
            : (i - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length
          )}
          className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
          style={{
            [next ? 'right' : 'left']: '0.75rem',
            background: 'rgba(255,255,255,0.88)',
            border: `1px solid ${C.line}`,
            zIndex: 1,
          }}
        >
          <ArrowRight size={11} style={{ transform: next ? 'none' : 'rotate(180deg)', color: C.ink }} />
        </button>
      ))}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" style={{ zIndex: 1 }}>
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === idx ? '1.1rem' : '0.375rem', background: i === idx ? C.blue : C.line }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Expandable "Learn more" block ─────────────────────────────────────────────
function LearnMore({ children, align = 'left' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`mt-8 ${align === 'right' ? 'text-right' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.20em] uppercase transition-opacity hover:opacity-60"
        style={{ color: C.blue }}
      >
        <span>{open ? 'Close' : 'Learn more'}</span>
        <ArrowRight
          size={12}
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 300ms ease' }}
        />
      </button>

      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '600px' : '0px',
        transition: 'max-height 480ms cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div className="pg-desc pt-6 space-y-3 text-sm leading-[1.85]" style={{ color: C.body }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [upcoming, setUpcoming] = useState([])

  useEffect(() => {
    supabase.from('tournaments')
      .select('*, tournament_registrations(count)')
      .in('status', ['upcoming', 'registration_open'])
      .order('date', { ascending: true }).limit(3)
      .then(({ data }) => setUpcoming((data || []).map(t => ({ ...t, registered_count: t.tournament_registrations?.[0]?.count ?? 0 }))))
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <ChessPawn3D />
      </Suspense>

      <main style={{ background: C.bg, color: C.ink }}>

        {/* ════════════════════════════════════════════════════════════════════
            1 · HERO  —  white, full-viewport, pawn floats right
        ════════════════════════════════════════════════════════════════════ */}
        <section
          className="relative flex flex-col justify-center overflow-hidden px-10 md:px-40"
          style={{ background: C.bg, height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
          <div className="relative max-w-lg">
            <FadeIn>
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-1"
                 style={{ color: C.glow }}>
                Hyderabad's Chess Community
              </p>
            </FadeIn>

            <FadeIn delay={80}>
              <h1
                className="font-bold"
                style={{ fontSize: 'clamp(3rem, 5vw, 5.5rem)', color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05 }}
              >
                <span style={{ whiteSpace: 'nowrap' }}>
                  Chess is never
                </span><br />
                the point.<br />
                <span style={{ color: C.blue }}>People are.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={160}>
              <p className="pg-desc mt-9 text-lg leading-relaxed" style={{ color: C.body }}>
                A community for thoughtful people who want meaningful connections,
                healthy competition, and great conversations — through chess.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 font-semibold text-white rounded-full text-sm transition-all duration-200 hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #1565c0, #4a9eff)' }}
                >
                  Join Pawn's Gambit
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/tournaments"
                  className="inline-flex items-center gap-2 py-3.5 text-sm font-semibold transition-opacity hover:opacity-60"
                  style={{ color: C.faint }}
                >
                  See upcoming events <ArrowUpRight size={15} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            2 · THE PROBLEM  +  WHY CHESS
            3-column grid: problem top-left (Q2) | pawn centre | chess bottom-right (Q4)
        ════════════════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{
            background: C.bg,
            height: '100vh',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            borderTop: `1px solid ${C.line}`,
          }}
        >
          {/* ── Q2 · The Problem (top-left, left-aligned) ───────────────── */}
          <div
            className="flex items-center"
            style={{ gridColumn: 1, gridRow: '1 / 3', padding: '0 3.5rem' }}
          >
            <FadeIn className="max-w-[380px]">
              {/* Big display header: 01 ——— The Problem */}
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="font-bold tabular-nums"
                  style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: C.blue, letterSpacing: '-0.04em', lineHeight: 1 }}
                >
                  01
                </span>
                <span style={{ flex: '0 0 32px', height: 2, background: C.blue, opacity: 0.35, borderRadius: 2 }} />
                <span
                  className="font-bold pg-heading"
                  style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05, whiteSpace: 'nowrap' }}
                >
                  The Problem
                </span>
              </div>

              <p className="pg-desc text-lg leading-relaxed mb-2" style={{ color: C.body }}>
                We are more connected than ever. and somehow more alone
              </p>

              <LearnMore>
                <p>Most adults don't struggle to find content. They struggle to find community.</p>
                <p>They have a hard time connecting with another person.<br />
                   Awkward silences during meets. No reason to return.</p>
                <p>We've replaced gathering with scrolling.<br />
                   Friendship with notifications.<br />
                   Conversation with comments.</p>
                <p style={{ color: C.ink, fontWeight: 600 }}>
                  Pawn's Gambit exists because we think people deserve better.
                </p>
              </LearnMore>
            </FadeIn>
          </div>

          {/* ── Centre column: pawn floats here (canvas overlay handles it) ── */}
          <div style={{ gridColumn: 2, gridRow: '1 / 3' }} />

          {/* ── Q4 · Why Chess (bottom-right, right-aligned) ────────────── */}
          <div
            className="flex items-center justify-end"
            style={{ gridColumn: 3, gridRow: '1 / 3', padding: '0 3.5rem' }}
          >
            <FadeIn delay={140} className="max-w-[380px] text-right">
              {/* Big display header: 02 ——— Why Chess */}
              <div className="flex items-center justify-end gap-4 mb-6">
                <span
                  className="font-bold pg-heading"
                  style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05 , whiteSpace: 'nowrap'}}
                >
                  Why Chess
                </span>
                <span style={{ flex: '0 0 32px', height: 2, background: C.blue, opacity: 0.35, borderRadius: 2 }} />
                <span
                  className="font-bold tabular-nums"
                  style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: C.blue, letterSpacing: '-0.04em', lineHeight: 1 }}
                >
                  02
                </span>
              </div>

              <p className="pg-desc text-lg leading-relaxed mb-2" style={{ color: C.body }}>
                Chess creates something rare
              </p>

              <LearnMore align="right">
                <p>A reason for strangers to sit together.</p>
                <p>A reason to think together.</p>
                <p>A reason to return.</p>
                <p>The board starts the conversation.<br />The community keeps it going.</p>
              </LearnMore>
            </FadeIn>
          </div>

          {/* Hair-line dividers */}
          <div className="absolute inset-x-0 top-1/2 pointer-events-none"
               style={{ height: 1, background: C.line }} />
          <div className="absolute inset-y-0 left-1/3 pointer-events-none"
               style={{ width: 1, background: C.line }} />
          <div className="absolute inset-y-0 right-1/3 pointer-events-none"
               style={{ width: 1, background: C.line }} />
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            3 · PAWN'S GAMBIT  +  EXPERIENCES
            Q1 top-left : pawn space        |  Q2 top-right : What is PG
            Q3 bot-left : carousel + CTA    |  Q4 bot-right : Experiences
        ════════════════════════════════════════════════════════════════════ */}
        <section
          className="relative"
          style={{
            background: C.bgAlt,
            height: '100vh',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            borderTop: `1px solid ${C.line}`,
          }}
        >
          {/* Left column — spans full height; pawn floats top, carousel crosses midline, CTA below */}
          <div
            className="flex flex-col overflow-hidden"
            style={{ gridColumn: 1, gridRow: '1 / 3', padding: '0 3.5rem' }}
          >
            <div style={{ flex: '0 0 28%' }} />
            <div style={{ flex: '0 0 42%' }}>
              <Carousel />
            </div>
            <div className="flex flex-col items-center text-center" style={{ flex: 1, justifyContent: 'center', paddingBottom: '1.5rem' }}>
              <p className="text-[10px] font-semibold tracking-[0.24em] uppercase mb-2" style={{ color: C.faint }}>Ready?</p>
              <h3 className="font-bold mb-4" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)', color: C.ink, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                Your next move starts here.
              </h3>
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2.5 px-6 py-3 font-semibold text-white rounded-full text-sm transition-all duration-200 hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #1565c0, #4a9eff)' }}
              >
                Join Pawn's Gambit
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Q2 · top-right · What Is Pawn's Gambit */}
          <div
            className="flex flex-col justify-center overflow-hidden"
            style={{ gridColumn: 2, gridRow: 1, padding: '2.5rem 3.5rem' }}
          >
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-bold tabular-nums" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: C.blue, letterSpacing: '-0.04em', lineHeight: 1 }}>03</span>
                <span style={{ flex: '0 0 24px', height: 2, background: C.blue, opacity: 0.35, borderRadius: 2 }} />
                <span className="font-bold pg-heading" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 2rem)', color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05 }}>What Is Pawn's Gambit</span>
              </div>
              <p className="pg-desc mb-1 text-sm leading-relaxed" style={{ color: C.body }}>
                We're building more than just a community.
              </p>
              <LearnMore>
                <p>A gathering space for students, professionals, former competitors, and curious minds — connected through chess, staying for the people.</p>
                <p>We host events that give strangers a reason to sit together, think together, and return.</p>
              </LearnMore>
            </FadeIn>
          </div>

          {/* Q4 · bottom-right · Experiences */}
          <div
            className="flex flex-col justify-center overflow-hidden"
            style={{ gridColumn: 2, gridRow: 2, padding: '2.5rem 3.5rem' }}
          >
            <FadeIn delay={140}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-bold tabular-nums" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: C.blue, letterSpacing: '-0.04em', lineHeight: 1 }}>04</span>
                <span style={{ flex: '0 0 24px', height: 2, background: C.blue, opacity: 0.35, borderRadius: 2 }} />
                <span className="font-bold pg-heading" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 2rem)', color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05 }}>Experiences</span>
              </div>
              <p className="pg-desc mb-1 text-sm leading-relaxed" style={{ color: C.body }}>
                Something for everyone.
              </p>
              <LearnMore>
                <div className="mt-2">
                  {[
                    { tag: 'Casual',      title: 'Chess & Chai',       body: 'Relaxed play — no pressure, no rating required. Brew in hand, board on the table.' },
                    { tag: 'Competitive', title: 'Weekend Tournaments', body: 'Rated Swiss-format events. Compete at your level, earn your rating, improve.' },
                    { tag: 'Learning',    title: 'Weekly Workshops',    body: 'Structured sessions on openings, endgames, and tactics. Think deeper, get better.' },
                  ].map(ev => (
                    <div key={ev.title} className="py-3 flex gap-4 items-start" style={{ borderTop: `1px solid ${C.line}` }}>
                      <span
                        className="mt-0.5 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                        style={{ color: C.blue, background: `${C.blue}12` }}
                      >{ev.tag}</span>
                      <div>
                        <p className="font-semibold text-sm leading-snug" style={{ color: C.ink }}>{ev.title}</p>
                        <p className="text-sm leading-relaxed mt-0.5" style={{ color: C.body }}>{ev.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </LearnMore>
            </FadeIn>
          </div>

          {/* Hair-line dividers */}
          <div className="absolute inset-y-0 left-1/2 pointer-events-none" style={{ width: 1, background: C.line }} />
          <div className="absolute top-1/2 right-0 pointer-events-none" style={{ left: '50%', height: 1, background: C.line }} />
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            4 · MEMBER STORIES
        ════════════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-28 md:py-36" style={{ background: C.bg }}>
          <div className="max-w-6xl mx-auto">
            <FadeIn className="mb-16">
              <Eyebrow n="04">Member Stories</Eyebrow>
              <h2 className="font-bold tracking-tight leading-[1.05]"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: C.ink, letterSpacing: '-0.02em' }}>
                Stories from the community.
              </h2>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { story: "I joined Pawn's Gambit because I missed playing chess. What I didn't expect was how quickly familiar faces would turn into friends. Somewhere between post-game discussions, cups of chai, and conversations that had nothing to do with chess, weekends stopped feeling routine. Today, I don't show up just to play — I show up because it's where some of my favourite people are.", name: 'Suraj', initials: 'S' },
                { story: "Moving to a new city can feel surprisingly lonely as an adult. I came to Pawn's Gambit looking for a hobby and found something much more valuable — a community. The chess brought us to the same table, but it was the shared stories, laughter, and friendships that kept me coming back. It's one of the few places where I arrived as a stranger and genuinely felt welcomed.", name: 'Sravani', initials: 'Sr' },
              ].map((m, i) => (
                <FadeIn key={m.name} delay={i * 150}>
                  <div className="rounded-2xl p-9 md:p-11 flex flex-col h-full"
                       style={{ background: C.bgAlt, border: `1px solid ${C.line}` }}>
                    <div className="text-6xl font-serif leading-none mb-5 select-none" style={{ color: `${C.blue}40` }}>"</div>
                    <p className="pg-desc text-lg leading-relaxed flex-1 mb-8" style={{ color: C.body }}>{m.story}</p>
                    <div className="flex items-center gap-4 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                           style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.glow})` }}>
                        {m.initials}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: C.ink }}>{m.name}</p>
                        <p className="text-sm mt-0.5" style={{ color: C.faint }}>Pawn's Gambit Member</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            5 · TEAM
        ════════════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-28 md:py-36" style={{ background: C.bgAlt }}>
          <div className="max-w-6xl mx-auto">
            <FadeIn className="mb-16">
              <Eyebrow n="05">Team</Eyebrow>
              <h2 className="font-bold tracking-tight leading-[1.05]"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: C.ink, letterSpacing: '-0.02em' }}>
                The people behind the movement.
              </h2>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-4"
                       style={{ background: C.bg, border: `1px dashed ${C.line}` }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: C.bgAlt }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                    <p className="text-sm" style={{ color: C.faint }}>Team member info coming soon</p>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={200} className="mt-7">
              <p className="text-xs" style={{ color: C.faint }}>Photos and bios will be added shortly.</p>
            </FadeIn>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            8 · PARTNERS
        ════════════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-24" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
          <div className="max-w-5xl mx-auto">
            <FadeIn className="text-center mb-14">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: C.faint }}>Trusted By</p>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="flex flex-wrap justify-center items-stretch gap-4">
                <div className="rounded-2xl px-12 py-8 flex flex-col items-center gap-3 min-w-[210px]"
                     style={{ background: C.bgAlt, border: `1px solid ${C.line}` }}>
                  <span className="text-4xl">🐼</span>
                  <div className="text-center">
                    <p className="font-semibold text-sm" style={{ color: C.ink }}>Panda Chess Academy</p>
                    <p className="text-xs mt-1" style={{ color: C.faint }}>Official Coaching Partner</p>
                  </div>
                </div>
                {[1, 2].map(i => (
                  <div key={i} className="rounded-2xl px-12 py-8 flex flex-col items-center justify-center gap-2 min-w-[170px]"
                       style={{ background: C.bg, border: `1px dashed ${C.line}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                         style={{ border: `1px solid ${C.line}`, color: C.faint }}>+</div>
                    <p className="text-xs text-center" style={{ color: C.faint }}>Partner slot</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={200} className="text-center mt-8">
              <a href="mailto:contact@pgchess.in" className="text-sm transition-colors hover:opacity-70" style={{ color: C.faint }}>
                Interested in partnering? contact@pgchess.in
              </a>
            </FadeIn>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            9 · CTA
        ════════════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-32 md:py-44" style={{ background: C.ink }}>
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <h2 className="font-bold tracking-tight leading-[1.08] mb-8 text-white"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', letterSpacing: '-0.02em' }}>
                Where thoughtful people gather around a chessboard — and leave with something more.
              </h2>
              <p className="pg-desc text-lg leading-relaxed mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.62)' }}>
                We believe chess deserves better than being confined to screens and score sheets.
                It deserves laughter after a blunder, debates that continue long after the pieces are
                packed away, and rooms filled with people who genuinely enjoy thinking together.
                That's the experience we're building, one event at a time.
              </p>
              <Link to="/signup"
                className="group inline-flex items-center gap-2.5 px-9 py-4 font-semibold rounded-full text-base transition-all duration-200 hover:brightness-95"
                style={{ background: '#ffffff', color: C.ink }}>
                Join Pawn's Gambit
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </FadeIn>
          </div>
        </section>

      </main>
    </>
  )
}
