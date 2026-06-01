import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Clock, ChevronRight } from 'lucide-react'
import StartWorkoutButton from '@/components/workout/StartWorkoutButton'

export default async function WorkoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: activeSessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', user!.id)
    .is('finished_at', null)
    .order('started_at', { ascending: false })
    .limit(3)

  const { data: recentSessions } = await supabase
    .from('workout_sessions')
    .select('id, name, started_at, finished_at')
    .eq('user_id', user!.id)
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Workout</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Log your training sessions</p>
      </div>

      {/* Resume in-progress sessions */}
      {(activeSessions ?? []).length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">In progress</p>
          <div className="space-y-2">
            {activeSessions!.map(s => {
              const mins = Math.floor((Date.now() - new Date(s.started_at).getTime()) / 60000)
              return (
                <Link
                  key={s.id}
                  href={`/workout/${s.id}`}
                  className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 hover:bg-orange-500/15 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-orange-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{s.name ?? 'Workout'}</p>
                      <p className="text-xs text-zinc-400">{mins}m ago</p>
                    </div>
                  </div>
                  <span className="text-xs text-orange-400 font-medium">Resume →</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Start new workout */}
      <StartWorkoutButton />

      {/* Recent sessions */}
      {(recentSessions ?? []).length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Recent</p>
          <div className="space-y-2">
            {recentSessions!.map(s => {
              const duration = s.finished_at
                ? Math.floor((new Date(s.finished_at).getTime() - new Date(s.started_at).getTime()) / 60000)
                : null
              const date = new Date(s.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              return (
                <Link key={s.id} href={`/workout/${s.id}`} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-600 transition-colors">
                  <div>
                    <p className="text-sm text-zinc-200">{s.name ?? 'Workout'}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{date}{duration ? ` · ${duration}m` : ''}</p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
