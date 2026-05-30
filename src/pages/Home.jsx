import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

// ─── Fade in on scroll ────────────────────────────────────────────────────────
function FadeIn({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children, light = false }) {
  return (
    <p className={`text-[11px] font-bold tracking-[0.22em] uppercase mb-5 ${light ? 'text-slate-400' : 'text-blue-400'}`}>
      {children}
    </p>
  )
}

// ─── Photo placeholder ────────────────────────────────────────────────────────
// Replace the inner content with an <img> tag once real photos are provided
function PhotoPlaceholder({ label, className = '', aspect = 'aspect-[4/3]', overlay = true }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-navy-800 border border-navy-700 ${aspect} ${className}`}>
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-br from-navy-700/60 to-navy-900/80" />
      )}
      {/* ↓ Replace this div with <img src="..." className="w-full h-full object-cover" alt="..." /> */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-navy-600">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-40">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="text-xs opacity-40">{label}</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [upcoming, setUpcoming] = useState([])

  useEffect(() => {
    supabase
      .from('tournaments')
      .select('*, tournament_registrations(count)')
      .in('status', ['upcoming', 'registration_open'])
      .order('date', { ascending: true })
      .limit(3)
      .then(({ data }) =>
        setUpcoming((data || []).map(t => ({
          ...t,
          registered_count: t.tournament_registrations?.[0]?.count ?? 0,
        })))
      )
  }, [])

  return (
    <main className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO — "Chess is never the point. People are."
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end pb-0 overflow-hidden">
        {/* Full-bleed photo background */}
        <div className="absolute inset-0">
          <PhotoPlaceholder
            label="Hero photo — people playing chess together"
            className="!rounded-none w-full h-full"
            aspect=""
            overlay={false}
          />
          {/* Dark gradient overlay so text reads clearly */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 to-transparent" />
        </div>

        {/* Navbar spacer */}
        <div className="h-16" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24 pt-32">
          <div className="max-w-2xl">
            <div className="mb-8">
              <Logo size={52} />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[0.95] tracking-tight mb-8">
              Chess is never<br />the point.<br />
              <span className="text-blue-300">People are.</span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-xl mb-12">
              A community for thoughtful people who want meaningful connections,
              healthy competition, and great conversations — through chess.
            </p>

            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-navy-900 font-bold rounded-xl text-base transition-all"
            >
              Join Pawn's Gambit
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. THE PROBLEM
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-navy-950 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <Label>The Problem</Label>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-14 max-w-3xl">
              We're more connected than ever. And somehow more alone.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <FadeIn delay={100}>
              <div className="space-y-5 text-slate-400 text-lg leading-relaxed">
                <p>Most adults don't struggle to find content.<br />They struggle to find community.</p>
                <p>They have a hard time connecting with another person — awkward silences at meetups, no reason to return, nothing holding the room together.</p>
                <p>We've replaced gathering with scrolling.<br />Friendship with notifications.<br />Conversation with comments.</p>
                <p className="text-white font-medium text-xl pt-2">
                  Pawn's Gambit exists because we think people deserve better.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <PhotoPlaceholder
                label="Photo — candid moment at an event"
                aspect="aspect-[3/4]"
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. WHY CHESS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <PhotoPlaceholder
              label="Photo — people discussing a game, not playing (post-game conversation)"
              aspect="aspect-square"
            />
          </FadeIn>

          <FadeIn delay={150}>
            <Label>Why Chess</Label>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
              Chess creates something rare.
            </h2>
            <div className="space-y-5 text-slate-400 text-lg leading-relaxed">
              <p>A reason for strangers to sit together.</p>
              <p>A reason to think together.</p>
              <p>A reason to return.</p>
              <p className="pt-2 text-slate-300">
                The board starts the conversation.<br />
                The community keeps it going.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. WHAT IS PAWN'S GAMBIT
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-navy-950">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="mb-16">
            <Label>What Is Pawn's Gambit</Label>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight max-w-2xl">
              We're Building More Than A Chess Community.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-16">
            <FadeIn delay={100}>
              <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
                <p>We're building a haven.</p>
                <p>
                  For students, professionals, former competitors, creators,
                  and curious minds to gather around a shared love of playing chess.
                </p>
                <p>Not everyone comes for the same reason.</p>
                <div className="space-y-2 pl-4 border-l-2 border-navy-700 text-slate-300">
                  <p>Some come for competition.</p>
                  <p>Some come for friendship.</p>
                  <p>Some come simply to belong.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="space-y-6">
                <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8">
                  <p className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3">Mission</p>
                  <p className="text-white text-lg leading-relaxed font-medium">
                    Create spaces where thoughtful people build meaningful relationships through chess.
                  </p>
                </div>
                <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8">
                  <p className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3">Vision</p>
                  <p className="text-white text-lg leading-relaxed font-medium">
                    To make chess one of the most meaningful ways people connect, grow, and belong.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. EXPERIENCES / EVENTS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16">
            <Label>Experiences</Label>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Something for everyone.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                emoji: '☕',
                title: 'Chess & Chai',
                body: 'A casual Sunday morning gathering. Brew in hand, board on the table, no pressure — just good chess and better conversation.',
                tag: 'Casual',
              },
              {
                emoji: '🏆',
                title: 'Weekend Tournaments',
                body: 'Swiss-format rated tournaments. Face opponents at your level, earn your Pawn\'s Gambit rating, and compete for prizes.',
                tag: 'Competitive',
              },
              {
                emoji: '♟',
                title: 'Weekly Workshops',
                body: 'Structured sessions led by coaches from Panda Chess Academy — openings, endgames, tactics. Come to get better.',
                tag: 'Learning',
              },
            ].map((event, i) => (
              <FadeIn key={event.title} delay={i * 100}>
                <div className="bg-navy-800 border border-navy-700 hover:border-navy-500 rounded-2xl p-8 flex flex-col gap-5 h-full transition-colors group">
                  <div className="text-5xl">{event.emoji}</div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                      {event.tag}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-sm flex-1">{event.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. COMMUNITY — photo mosaic
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-navy-950">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-6 max-w-3xl">
            <Label>Community</Label>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Where Chess Becomes Community.
            </h2>
          </FadeIn>
          <FadeIn delay={100} className="mb-16 max-w-2xl">
            <p className="text-slate-400 text-lg leading-relaxed">
              We believe the best chess experiences aren't measured only by ratings or results.
              They're measured by the people you meet, the conversations you have,
              and the feeling of belonging that keeps you coming back.
            </p>
          </FadeIn>

          {/* Photo mosaic grid */}
          <FadeIn delay={150}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[160px]">
              <PhotoPlaceholder label="Group photo" className="md:col-span-2 md:row-span-2 !rounded-2xl" aspect="" />
              <PhotoPlaceholder label="Members playing" aspect="" />
              <PhotoPlaceholder label="Post-game chat" aspect="" />
              <PhotoPlaceholder label="Event moment" aspect="" />
              <PhotoPlaceholder label="Community gathering" aspect="" />
            </div>
          </FadeIn>

          <FadeIn delay={200} className="mt-8 text-center text-slate-500 text-sm">
            <p>📸 Real community photos coming soon — send your favourites to contact@pgchess.in</p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          7. MEMBER STORIES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16">
            <Label>Member Stories</Label>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Stories From The Community.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                story: "I joined Pawn's Gambit because I missed playing chess. What I didn't expect was how quickly familiar faces would turn into friends. Somewhere between post-game discussions, cups of chai, and conversations that had nothing to do with chess, weekends stopped feeling routine. Today, I don't show up just to play — I show up because it's where some of my favourite people are.",
                name: 'Suraj',
                initials: 'S',
              },
              {
                story: "Moving to a new city can feel surprisingly lonely as an adult. I came to Pawn's Gambit looking for a hobby and found something much more valuable — a community. The chess brought us to the same table, but it was the shared stories, laughter, and friendships that kept me coming back. It's one of the few places where I arrived as a stranger and genuinely felt welcomed.",
                name: 'Sravani',
                initials: 'Sr',
              },
            ].map((member, i) => (
              <FadeIn key={member.name} delay={i * 150}>
                <div className="bg-navy-800 border border-navy-700 rounded-2xl p-10 flex flex-col h-full">
                  {/* Quote mark */}
                  <p className="text-5xl font-serif text-blue-500 leading-none mb-6">"</p>
                  <p className="text-slate-300 text-lg leading-relaxed flex-1 mb-8">
                    {member.story}
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-navy-700">
                    <div className="w-11 h-11 rounded-full bg-navy-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-white font-semibold">— {member.name}</p>
                      <p className="text-slate-500 text-sm">Pawn's Gambit Member</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          8. TEAM
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-navy-950">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16">
            <Label>Team</Label>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              The People Behind The Movement.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder team cards — replace with real info when ready */}
            {[1, 2, 3].map((_, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="bg-navy-800 border border-dashed border-navy-600 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-navy-500">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Team member info coming soon</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={200} className="mt-6 text-center">
            <p className="text-slate-600 text-sm">Photos and bios will be added shortly.</p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          9. PARTNERS & SPONSORS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-navy-900 border-y border-navy-800">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <Label>Partners & Sponsors</Label>
            <h2 className="text-3xl font-black text-white">Trusted By.</h2>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex flex-wrap justify-center gap-6">
              {/* Panda Chess Academy */}
              <div className="bg-navy-800 border border-navy-700 hover:border-navy-500 rounded-2xl px-12 py-8 flex flex-col items-center gap-3 transition-colors min-w-[200px]">
                <span className="text-5xl">🐼</span>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Panda Chess Academy</p>
                  <p className="text-slate-500 text-xs mt-1">Official Coaching Partner</p>
                </div>
              </div>

              {/* Sponsor placeholder */}
              {[1, 2].map(i => (
                <div key={i} className="bg-navy-800 border border-dashed border-navy-700 rounded-2xl px-12 py-8 flex flex-col items-center justify-center gap-2 min-w-[160px]">
                  <div className="w-10 h-10 rounded-full border border-navy-600 flex items-center justify-center text-navy-500 text-xl">+</div>
                  <p className="text-navy-600 text-xs text-center">Partner logo<br />coming soon</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={200} className="text-center mt-8">
            <a href="mailto:contact@pgchess.in" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Interested in partnering? contact@pgchess.in
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          10. FINAL CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-40 px-6 bg-navy-950 relative overflow-hidden">
        {/* Subtle chess grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-conic-gradient(#ffffff 0% 25%, transparent 0% 50%)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_30%,#0d1b2a_100%)]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <Logo size={64} className="mx-auto mb-10" />
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
              Join Pawn's Gambit — where thoughtful people gather around a chessboard and leave with something more.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
              We believe chess deserves better than being confined to screens and score sheets.
              It deserves laughter after a blunder, debates that continue long after the pieces are packed away,
              and rooms filled with people who genuinely enjoy thinking together.
              That's the experience we're building, one event at a time.
            </p>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-white hover:bg-slate-100 text-navy-900 font-bold rounded-xl text-lg transition-all"
            >
              Join Pawn's Gambit
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </section>

    </main>
  )
}
