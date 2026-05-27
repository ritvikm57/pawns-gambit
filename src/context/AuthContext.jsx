import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PROVISIONAL_RATINGS } from '../lib/glicko2'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('users')
      .select('*, ratings(*)')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp({ email, password, name, city, chessComUsername, fideId, phone, skillLevel }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    const provisional = PROVISIONAL_RATINGS[skillLevel]

    await supabase.from('users').insert({
      id: data.user.id,
      name,
      email,
      city,
      chess_com_username: chessComUsername,
      fide_id: fideId,
      phone,
      skill_level: skillLevel,
    })

    await supabase.from('ratings').insert({
      user_id: data.user.id,
      rating: provisional.r,
      rd: provisional.rd,
      volatility: provisional.volatility,
      games_played: 0,
    })

    return data
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signUp, signIn, signOut, resetPassword, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
