'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createChallenge(
  name: string,
  durationDays: number,
  startDate: string,
  activities: string[],
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Deactivate existing active challenge
  await supabase
    .from('challenges')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({ user_id: user.id, name, duration_days: durationDays, start_date: startDate })
    .select()
    .single()

  if (error || !challenge) throw error ?? new Error('Failed to create challenge')

  if (activities.length > 0) {
    await supabase.from('challenge_activities').insert(
      activities.map((name, i) => ({
        challenge_id: challenge.id,
        user_id: user.id,
        name,
        order_index: i,
      })),
    )
  }

  revalidatePath('/challenge')
  revalidatePath('/dashboard')
}

export async function endChallenge(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('challenges')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/challenge')
  revalidatePath('/dashboard')
}

export async function toggleActivityLog(
  activityId: string,
  challengeId: string,
  date: string,
  dayNumber: number,
  completed: boolean,
  totalActivities: number,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Toggle this activity
  await supabase.from('challenge_activity_logs').upsert(
    { activity_id: activityId, user_id: user.id, date, completed },
    { onConflict: 'activity_id,date' },
  )

  // Fetch all activity logs for this challenge on this date
  const { data: activities } = await supabase
    .from('challenge_activities')
    .select('id')
    .eq('challenge_id', challengeId)

  const { data: logs } = await supabase
    .from('challenge_activity_logs')
    .select('activity_id, completed')
    .in('activity_id', (activities ?? []).map(a => a.id))
    .eq('date', date)

  const completedCount = (logs ?? []).filter(l => l.completed).length
  const allDone = totalActivities > 0 && completedCount === totalActivities

  // Upsert the day result
  await supabase.from('challenge_days').upsert(
    {
      challenge_id: challengeId,
      user_id: user.id,
      day_number: dayNumber,
      date,
      all_completed: allDone,
    },
    { onConflict: 'challenge_id,date' },
  )

  revalidatePath('/challenge')
  revalidatePath('/dashboard')
}
