'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createHabit(name: string, category: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('habits')
    .insert({ user_id: user.id, name, category })

  if (error) throw error
  revalidatePath('/habits')
  revalidatePath('/dashboard')
}

export async function deleteHabit(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/habits')
  revalidatePath('/dashboard')
}

export async function toggleHabitLog(habitId: string, date: string, completed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('habit_logs')
    .upsert(
      { habit_id: habitId, user_id: user.id, date, completed },
      { onConflict: 'habit_id,date' },
    )

  if (error) throw error
  revalidatePath('/habits')
  revalidatePath('/dashboard')
}
