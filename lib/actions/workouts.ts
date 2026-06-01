'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  if (error || !data) throw error ?? new Error('Failed to create session')
  redirect(`/workout/${data.id}`)
}

export async function addSet(sessionId: string, exerciseId: string, setNumber: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('workout_sets').insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    set_number: setNumber,
    completed: false,
  })
  if (error) throw error
  revalidatePath(`/workout/${sessionId}`)
}

export async function completeSet(
  setId: string,
  sessionId: string,
  reps: number | null,
  weightKg: number | null,
  durationSeconds: number | null,
  distanceKm: number | null,
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('workout_sets')
    .update({ reps, weight_kg: weightKg, duration_seconds: durationSeconds, distance_km: distanceKm, completed: true })
    .eq('id', setId)
  if (error) throw error
  revalidatePath(`/workout/${sessionId}`)
}

export async function uncompleteSet(setId: string, sessionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('workout_sets')
    .update({ completed: false })
    .eq('id', setId)
  if (error) throw error
  revalidatePath(`/workout/${sessionId}`)
}

export async function deleteSet(setId: string, sessionId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('workout_sets').delete().eq('id', setId)
  if (error) throw error
  revalidatePath(`/workout/${sessionId}`)
}

export async function finishSession(sessionId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('workout_sessions')
    .update({ finished_at: new Date().toISOString() })
    .eq('id', sessionId)

  // Fetch completed sets with exercise info
  const { data: sets } = await supabase
    .from('workout_sets')
    .select('*, exercise:exercises(id, name, type)')
    .eq('session_id', sessionId)
    .eq('completed', true)

  const newPRs: string[] = []

  for (const set of sets ?? []) {
    const exercise = set.exercise as { id: string; name: string; type: string } | null
    if (!exercise) continue

    let value: number | null = null
    let unit: string | null = null

    if (exercise.type === 'strength' && set.weight_kg) {
      value = parseFloat(set.weight_kg)
      unit = 'kg'
    } else if (exercise.type === 'bodyweight' && set.reps) {
      value = set.reps
      unit = 'reps'
    } else if (exercise.type === 'cardio' && set.distance_km) {
      value = parseFloat(set.distance_km)
      unit = 'km'
    }

    if (!value || !unit) continue

    const { data: existing } = await supabase
      .from('personal_records')
      .select('value')
      .eq('user_id', user.id)
      .eq('exercise_id', exercise.id)
      .maybeSingle()

    if (!existing || value > existing.value) {
      await supabase.from('personal_records').upsert(
        { user_id: user.id, exercise_id: exercise.id, value, unit, achieved_at: new Date().toISOString(), session_id: sessionId },
        { onConflict: 'user_id,exercise_id' },
      )
      newPRs.push(exercise.name)
    }
  }

  revalidatePath('/workout')
  revalidatePath('/dashboard')
  return newPRs
}

export async function addCustomExercise(name: string, category: string, type: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('exercises').insert({ user_id: user.id, name, category, type })
  if (error) throw error
  revalidatePath('/exercises')
}
