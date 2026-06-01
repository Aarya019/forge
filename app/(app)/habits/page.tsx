import { createClient } from '@/lib/supabase/server'
import HabitList from '@/components/habits/HabitList'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user!.id).order('created_at'),
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user!.id)
      .gte('date', ninetyDaysAgo)
      .order('date', { ascending: false }),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Habits</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Check off your daily goals</p>
      </div>
      <HabitList habits={habits ?? []} logs={logs ?? []} today={today} />
    </div>
  )
}
