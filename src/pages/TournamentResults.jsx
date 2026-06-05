import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Trophy, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import PageDecor from '../components/PageDecor'

// ─── Chess-standard pairing table ─────────────────────────────────────────────
// Bo. | No. | White | Rtg | Pts. | Result | Pts. | Black | Rtg | No.
function PairingTable({ pairings, playerMap }) {
  if (!pairings.length) {
    return <div className="py-10 text-center text-slate-400 text-sm">No pairings for this round.</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse" style={{ minWidth: 680 }}>
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <th className="px-3 py-2.5 text-center w-10">Bo.</th>
            <th className="px-2 py-2.5 text-center w-10">No.</th>
            <th className="px-4 py-2.5 text-left">White</th>
            <th className="px-3 py-2.5 text-right w-14">Rtg</th>
            <th className="px-3 py-2.5 text-right w-12">Pts.</th>
            <th className="px-5 py-2.5 text-center w-28 border-x border-gray-200 bg-slate-100">Result</th>
            <th className="px-3 py-2.5 text-left w-12">Pts.</th>
            <th className="px-4 py-2.5 text-right">Black</th>
            <th className="px-3 py-2.5 text-left w-14">Rtg</th>
            <th className="px-2 py-2.5 text-center w-10">No.</th>
          </tr>
        </thead>
        <tbody>
          {pairings.map((p, i) => {
            const w = playerMap[p.player1_id] || {
              name:   p.player1?.name || 'BYE',
              rating: null, score: null, no: null,
            }
            const b = playerMap[p.player2_id] || {
              name:   p.player2?.name || 'BYE',
              rating: null, score: null, no: null,
            }
            const r = p.result
            const pending = r == null
            const wScore  = r === 1 ? '1' : r === 0 ? '0' : r === 0.5 ? '½' : pending ? '?' : '–'
            const bScore  = r === 1 ? '0' : r === 0 ? '1' : r === 0.5 ? '½' : pending ? '?' : '–'
            const wWon    = r === 1
            const bWon    = r === 0
            const isDraw  = r === 0.5

            return (
              <tr key={p.id} className={`border-b border-gray-100 transition-colors ${
                i % 2 === 0 ? 'hover:bg-blue-50/30' : 'bg-gray-50/40 hover:bg-blue-50/30'
              }`}>
                {/* Bo. */}
                <td className="px-3 py-3 text-center font-mono text-xs text-slate-400 tabular-nums">{i + 1}</td>

                {/* No. (white) */}
                <td className="px-2 py-3 text-center font-mono text-xs text-slate-500 tabular-nums">{w.no ?? '–'}</td>

                {/* White player */}
                <td className={`px-4 py-3 font-medium ${wWon ? 'text-slate-900' : bWon ? 'text-slate-400' : 'text-slate-700'}`}>
                  {wWon && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-2 mb-0.5" />}
                  {w.name}
                </td>

                {/* Rtg (white) */}
                <td className="px-3 py-3 text-right font-mono text-xs text-slate-400 tabular-nums">
                  {w.rating ?? '–'}
                </td>

                {/* Pts. (white) */}
                <td className="px-3 py-3 text-right font-mono text-xs text-blue-600 tabular-nums font-semibold">
                  {w.score != null ? w.score : '–'}
                </td>

                {/* Result (centre column) */}
                <td className="px-5 py-3 text-center border-x border-gray-200 bg-slate-50">
                  <span className={`font-mono font-bold tabular-nums tracking-wider ${
                    pending ? 'text-slate-300' : isDraw ? 'text-slate-500' : 'text-slate-900'
                  }`}>
                    {pending ? '? – ?' : `${wScore} – ${bScore}`}
                  </span>
                </td>

                {/* Pts. (black) */}
                <td className="px-3 py-3 text-left font-mono text-xs text-blue-600 tabular-nums font-semibold">
                  {b.score != null ? b.score : '–'}
                </td>

                {/* Black player */}
                <td className={`px-4 py-3 font-medium text-right ${bWon ? 'text-slate-900' : wWon ? 'text-slate-400' : 'text-slate-700'}`}>
                  {b.name}
                  {bWon && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 ml-2 mb-0.5" />}
                </td>

                {/* Rtg (black) */}
                <td className="px-3 py-3 text-left font-mono text-xs text-slate-400 tabular-nums">
                  {b.rating ?? '–'}
                </td>

                {/* No. (black) */}
                <td className="px-2 py-3 text-center font-mono text-xs text-slate-500 tabular-nums">{b.no ?? '–'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TournamentResults() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [standings, setStandings]   = useState([])
  const [rounds, setRounds]         = useState([])
  const [activeRound, setActiveRound] = useState(null)
  const [pairings, setPairings]     = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    const [{ data: t }, { data: regs }, { data: roundsData }] = await Promise.all([
      supabase.from('tournaments').select('*').eq('id', id).single(),
      supabase
        .from('tournament_registrations')
        .select('*, users(name), ratings(rating)')
        .eq('tournament_id', id)
        .eq('payment_status', 'paid')
        .order('score', { ascending: false }),
      supabase
        .from('tournament_rounds')
        .select('*, pairings(*, player1:player1_id(name), player2:player2_id(name))')
        .eq('tournament_id', id)
        .order('round_number', { ascending: true }),
    ])
    setTournament(t)
    setStandings(regs || [])
    setRounds(roundsData || [])
    if (roundsData?.length) setActiveRound(roundsData[roundsData.length - 1].id)
    setLoading(false)
  }

  useEffect(() => {
    if (!activeRound) return
    const round = rounds.find(r => r.id === activeRound)
    setPairings(round?.pairings || [])
  }, [activeRound, rounds])

  // Build player map:  userId → { name, rating, score, no (seed) }
  const playerMap = {}
  standings.forEach((reg, i) => {
    playerMap[reg.user_id] = {
      name:   reg.users?.name ?? '—',
      rating: reg.ratings?.rating ?? null,
      score:  reg.score   ?? null,
      no:     i + 1,
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Tournament not found.{' '}
        <Link to="/tournaments" className="text-blue-500 ml-1 hover:underline">Go back</Link>
      </div>
    )
  }

  const activeRoundObj = rounds.find(r => r.id === activeRound)

  return (
    <div className="relative min-h-screen pt-20 pb-16 px-4" style={{ background: '#f8f9fb' }}>
      <PageDecor />
      <div className="relative z-10 max-w-5xl mx-auto">

        <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 mb-6">
          <ArrowLeft size={14} /> All Tournaments
        </Link>

        {/* Title */}
        <div className="mb-8">
          <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full font-medium">
            Completed
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">{tournament.name}</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {new Date(tournament.date).toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
            {' · '}{tournament.format}
            {tournament.rounds ? ` · ${tournament.rounds} rounds` : ''}
          </p>
        </div>

        {/* ── Final Standings ───────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Final Standings
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="px-5 py-3 w-16">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-right">Score</th>
                    <th className="px-4 py-3 text-right">Rtg Before</th>
                    <th className="px-4 py-3 text-right">Rtg After</th>
                    <th className="px-4 py-3 text-right">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((player, index) => {
                    const before = player.rating_before
                    const after  = player.rating_after
                    const delta  = after != null && before != null ? after - before : null
                    return (
                      <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-mono text-sm text-slate-500">
                          {index < 3 ? ['🥇','🥈','🥉'][index] : `#${index + 1}`}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-slate-900">{player.users?.name ?? '—'}</span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-semibold text-slate-900">
                          {player.score ?? '—'}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-xs text-slate-400">{before ?? '—'}</td>
                        <td className="px-4 py-4 text-right font-mono text-xs text-slate-700">{after ?? '—'}</td>
                        <td className="px-4 py-4 text-right font-mono text-xs">
                          {delta != null ? (
                            <span className={delta >= 0 ? 'text-green-600' : 'text-red-500'}>
                              {delta >= 0 ? '+' : ''}{delta}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Round pairings ────────────────────────────────────────── */}
        {rounds.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Round Results</h2>

            {/* Round selector */}
            <div className="flex gap-2 mb-1 overflow-x-auto pb-2">
              {rounds.map(round => (
                <button
                  key={round.id}
                  onClick={() => setActiveRound(round.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeRound === round.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:border-gray-200 border border-transparent'
                  }`}
                >
                  Round {round.round_number}
                </button>
              ))}
            </div>

            {/* Pairing table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Round header */}
              {activeRoundObj && (
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Round {activeRoundObj.round_number}
                  </span>
                  {activeRoundObj.is_complete && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                      Complete
                    </span>
                  )}
                </div>
              )}
              <PairingTable pairings={pairings} playerMap={playerMap} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
