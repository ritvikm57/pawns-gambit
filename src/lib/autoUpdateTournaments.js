import { supabase } from './supabase'

/**
 * Silently promotes tournaments from upcoming/registration_open → ongoing
 * when their scheduled date/time has passed.
 * Call this once on app load (or page load) — it's safe to fire and forget.
 */
export async function autoUpdateTournamentStatuses() {
  const now = new Date().toISOString()

  // Find tournaments whose start time has passed but are still pre-event
  const { data: due } = await supabase
    .from('tournaments')
    .select('id')
    .in('status', ['upcoming', 'registration_open'])
    .lte('date', now)

  if (!due?.length) return

  await supabase
    .from('tournaments')
    .update({ status: 'ongoing' })
    .in('id', due.map(t => t.id))
}
