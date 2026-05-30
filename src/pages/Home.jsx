import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import TournamentCard from '../components/TournamentCard'
import Logo from '../components/Logo'

// ─── Reusable section label ───────────────────────────────────────────────────
function Label({ children }) {
  return (
    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4">
      {children}
    </p>
  )
}

// ─── Fade-in on scroll ────────────────────────────────────────────────────────
function FadeIn({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
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
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-12 h-px bg-blue-500 mb-8" />
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const [loadingTournaments, setLoadingTournaments] = useState(true)

  useEffect(() => {
    async function fetchUpcoming() {
      const { data } = await supabase
        .from('tournaments')
        .select('*, tournament_registrations(count)')
        .in('status', ['upcoming', 'registration_open'])
        .order('date', { ascending: true })
        .limit(3)
      setUpcomingTournaments(
        (data || []).map(t => ({
          ...t,
          registered_count: t.tournament_registrations?.[0]?.count ?? 0,
        }))
      )
      setLoadingTournaments(false)
    }
    fetchUpcoming()
  }, [])

  return (
    <main className="overflow-x-hidden">

      {/* ── 1. INTRODUCTION / HERO ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Chess grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-conic-gradient(#ffffff 0% 25%, transparent 0% 50%)`,
            backgroundSize: '72px 72px',
          }}
        />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_40%,#0d1b2a_100%)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Logo — large display */}
          <div className="flex justify-center mb-10">
            <Logo size={120} />
          </div>

          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-blue-400 mb-6">
            Hyderabad · Est. 2024
          </p>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-8">
            Chess Has<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              a New Home.
            </span>
          </h1>

          <p className="text-slate-300 text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-12">
            Pawn's Gambit is Hyderabad's largest competitive chess club —
            rated games, real tournaments, and a community that takes the game seriously.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tournaments"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-base transition-all"
            >
              Join a Tournament
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 border border-navy-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl text-base transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </section>

      {/* ── 2. THE PROBLEM ────────────────────────────────────────────────── */}
      <section className="bg-navy-950 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <Label>The Problem</Label>
            <Divider />
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight max-w-3xl">
              900 million chess players worldwide. Hyderabad had nowhere serious to play.
            </h2>
          </FadeIn>
          <FadeIn delay={150} className="mt-10 max-w-2xl">
            <p className="text-slate-400 text-lg leading-relaxed">
              Casual games happen everywhere. But a proper rated club — with structured tournaments,
              a real rating system, and a community invested in improvement?
              That didn't exist here. Until now.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 3. WHY CHESS ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-20 text-center">
            <Label>Why Chess</Label>
            <Divider className="mx-auto" />
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Not just a game. A discipline.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-px bg-navy-700 rounded-2xl overflow-hidden">
            {[
              {
                num: '01',
                title: 'Strategy',
                body: 'Every move has consequences three moves away. Chess trains you to think ahead, weigh tradeoffs, and act decisively under pressure.',
              },
              {
                num: '02',
                title: 'Competition',
                body: 'A real rating means real stakes. Your number reflects your skill — earned game by game, tournament by tournament.',
              },
              {
                num: '03',
                title: 'Community',
                body: 'The best players in the room make you better. A serious club raises the floor for everyone — beginners and titled players alike.',
              },
            ].map((item, i) => (
              <FadeIn key={item.num} delay={i * 120} className="bg-navy-900 p-10">
                <p className="text-6xl font-black text-navy-700 mb-6 leading-none">{item.num}</p>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. WHAT IS PAWN'S GAMBIT ──────────────────────────────────────── */}
      <section className="py-32 px-6 bg-navy-950">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <Label>What Is Pawn's Gambit</Label>
            <Divider />
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
              Hyderabad's home for serious chess.
            </h2>
            <div className="space-y-5 text-slate-400 text-lg leading-relaxed">
              <p>
                We're the largest online chess club in Hyderabad — running Swiss-format
                tournaments, maintaining a live Glicko-2 leaderboard, and building a
                community that actually cares about getting better.
              </p>
              <p>
                Every game you play here is rated. Every rating is earned.
                Your Pawn's Gambit number is yours — built move by move across every
                tournament you enter.
              </p>
              <p>
                Our official coaching partner, <strong className="text-white">Panda Chess Academy</strong>,
                provides structured training for players who want to close the gap
                between where they are and where they want to be.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/tournaments"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all"
              >
                Browse Tournaments
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-navy-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition-all"
              >
                Create Account
              </Link>
            </div>
          </FadeIn>

          {/* Right — decorative chess board */}
          <FadeIn delay={200} className="flex justify-center">
            <div className="relative">
              <div
                className="w-72 h-72 md:w-80 md:h-80 rounded-2xl shadow-2xl shadow-blue-950"
                style={{
                  backgroundImage: `repeating-conic-gradient(#1e3a55 0% 25%, #14293d 0% 50%)`,
                  backgroundSize: '20% 20%',
                }}
              />
              {/* Logo overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Logo size={140} className="drop-shadow-2xl" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 5. THE EXPERIENCE ─────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-20">
            <Label>The Experience</Label>
            <Divider />
            <h2 className="text-4xl md:text-5xl font-black text-white max-w-xl">
              From first move to rated player.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Sign Up', body: 'Create your account, select your skill level, and get your provisional Glicko-2 rating instantly.' },
              { step: '2', title: 'Register', body: 'Browse upcoming tournaments. Pay the entry fee and lock in your spot — spots fill fast.' },
              { step: '3', title: 'Compete', body: 'Play Swiss-format rounds. Face opponents matched to your level. Every game counts.' },
              { step: '4', title: 'Get Rated', body: 'Your rating updates after every round. Watch it move in real time on the leaderboard.' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 100}>
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-8 h-full relative overflow-hidden group hover:border-blue-600/50 transition-colors">
                  <span className="absolute top-4 right-5 text-7xl font-black text-navy-700 leading-none select-none group-hover:text-navy-600 transition-colors">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3 relative">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed relative">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. COMMUNITY ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-navy-950 text-center">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <Label>Community</Label>
            <Divider className="mx-auto" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-20">
              The numbers speak.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-navy-700 rounded-2xl overflow-hidden mb-16">
            {[
              { value: '500+', label: 'Active Members' },
              { value: '40+',  label: 'Tournaments Hosted' },
              { value: 'Live', label: 'Glicko-2 Ratings' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 100} className="bg-navy-950 py-14 px-8">
                <p className="text-5xl md:text-6xl font-black text-white mb-3">{stat.value}</p>
                <p className="text-slate-500 text-sm uppercase tracking-widest">{stat.label}</p>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={200}>
            <Link
              to="/tournaments"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-base transition-all"
            >
              See the Leaderboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── 7. MEMBER STORIES ─────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16">
            <Label>Member Stories</Label>
            <Divider />
            <h2 className="text-4xl md:text-5xl font-black text-white max-w-xl">
              Heard from the board.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I'd been playing casually for years with no way to measure how good I actually was. Getting a real Glicko-2 rating here changed how I approach every game.",
                name: 'Arjun S.',
                detail: 'Tournament Player · Hyderabad',
                rating: '1420',
              },
              {
                quote: "The Swiss format is perfect — you're always matched against someone at your level. I've never learned faster than in my first PG tournament.",
                name: 'Priya M.',
                detail: 'Intermediate · Hyderabad',
                rating: '1085',
              },
              {
                quote: "As someone who played for FIDE ratings abroad, I wasn't sure what to expect. The seriousness of the community here genuinely surprised me.",
                name: 'Karthik R.',
                detail: 'Expert Player · Hyderabad',
                rating: '1840',
              },
            ].map((story, i) => (
              <FadeIn key={story.name} delay={i * 120}>
                <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 flex flex-col h-full">
                  <p className="text-3xl text-blue-500 font-serif mb-4 leading-none">"</p>
                  <p className="text-slate-300 leading-relaxed flex-1 mb-8 text-[15px]">
                    {story.quote}
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-navy-700">
                    <div className="w-10 h-10 rounded-full bg-navy-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {story.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{story.name}</p>
                      <p className="text-slate-500 text-xs">{story.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-mono font-bold text-sm">{story.rating}</p>
                      <p className="text-slate-600 text-xs">PG Rating</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CULTURE ────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-navy-950">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-20">
            <Label>Culture</Label>
            <Divider />
            <h2 className="text-4xl md:text-5xl font-black text-white max-w-xl">
              How we play. How we grow.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Chess First, Ego Last',
                body: 'We don\'t care about your title, your background, or your age. We care about how you play and how you approach the board.',
              },
              {
                title: 'Every Rating Is Earned',
                body: 'No shortcuts, no soft pairings. Your PG rating reflects your actual results — every point gained is proof of progress.',
              },
              {
                title: 'All Levels Welcome',
                body: 'An 800-rated beginner and a 2000-rated expert both have a place here. Swiss pairings mean you always face the right opponent.',
              },
              {
                title: 'The Game Improves You',
                body: 'We believe chess makes people better thinkers. The club exists to facilitate that — structured competition is the fastest teacher.',
              },
            ].map((value, i) => (
              <FadeIn key={value.title} delay={i * 80}>
                <div className="flex gap-6 p-8 bg-navy-900 border border-navy-800 rounded-2xl hover:border-navy-600 transition-colors">
                  <div className="w-1 bg-blue-600 rounded-full flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{value.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. TEAM ───────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16">
            <Label>Team</Label>
            <Divider />
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Behind the board.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Aravind',
                role: 'Founder & Head Coach',
                org: 'Panda Chess Academy',
                bio: 'Competitive chess player, coach, and the driving force behind Pawn\'s Gambit. Creator of a proprietary Glicko-2 variant used for club ratings.',
                initials: 'A',
              },
            ].map((member, i) => (
              <FadeIn key={member.name} delay={i * 100}>
                <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-2xl font-black text-blue-400 mb-6">
                    {member.initials}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-blue-400 text-sm font-medium mb-1">{member.role}</p>
                  <p className="text-slate-600 text-xs mb-4">{member.org}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. SPONSORS / PARTNERS ───────────────────────────────────────── */}
      <section className="py-24 px-6 bg-navy-950 border-b border-navy-800">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <Label>Partners</Label>
            <h2 className="text-2xl font-bold text-white">Backed by the best in the game.</h2>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex flex-wrap gap-6 justify-center items-stretch">
              {/* Panda Chess Academy */}
              <div className="bg-navy-800 border border-navy-700 hover:border-navy-500 rounded-2xl px-10 py-8 flex flex-col items-center gap-3 transition-colors min-w-[220px]">
                <div className="text-4xl">🐼</div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">Panda Chess Academy</p>
                  <p className="text-slate-500 text-xs mt-1">Official Coaching Partner</p>
                </div>
              </div>

              {/* Become a partner CTA */}
              <div className="bg-navy-900 border border-dashed border-navy-600 hover:border-navy-500 rounded-2xl px-10 py-8 flex flex-col items-center justify-center gap-3 transition-colors min-w-[220px] group cursor-pointer">
                <div className="w-10 h-10 rounded-full border border-navy-600 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                  <span className="text-slate-500 group-hover:text-blue-400 text-xl transition-colors">+</span>
                </div>
                <div className="text-center">
                  <p className="text-slate-500 group-hover:text-slate-300 font-medium text-sm transition-colors">Become a Partner</p>
                  <a href="mailto:contact@pgchess.in" className="text-blue-500 hover:text-blue-400 text-xs mt-1 block transition-colors">contact@pgchess.in</a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Upcoming Tournaments (retained as functional section) ─────────── */}
      <section className="py-32 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <FadeIn>
              <Label>Up Next</Label>
              <h2 className="text-4xl md:text-5xl font-black text-white">Upcoming Tournaments</h2>
            </FadeIn>
            <Link
              to="/tournaments"
              className="hidden sm:inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loadingTournaments ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-navy-800 border border-navy-700 rounded-xl p-6 animate-pulse">
                  <div className="h-5 bg-navy-700 rounded mb-4 w-3/4" />
                  <div className="space-y-3">
                    <div className="h-3 bg-navy-700 rounded w-2/3" />
                    <div className="h-3 bg-navy-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingTournaments.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingTournaments.map((t, i) => (
                <FadeIn key={t.id} delay={i * 100}>
                  <TournamentCard tournament={t} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <FadeIn>
              <div className="text-center py-20 border border-navy-800 rounded-2xl text-slate-500">
                <p className="text-lg font-medium text-slate-400 mb-1">No upcoming tournaments right now.</p>
                <p className="text-sm">Check back soon — we run events regularly.</p>
              </div>
            </FadeIn>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/tournaments" className="inline-flex items-center gap-1 text-blue-400 text-sm font-medium">
              View all tournaments <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
