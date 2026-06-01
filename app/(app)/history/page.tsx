import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, Dumbbell } from 'lucide-react'

function groupByMonth(sessions: { id: string; name: string | null; started_at: string; finished_at: string | null; set_count: number }[]) {
  const groups: Record<string, typeof sessions> = {}
  sessions.forEach(s => {
    const key = new Date(s.started_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  })
  return groups
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, name, started_at, finished_at')
    .eq('user_id', user!.id)
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(100)

  const { data: setCounts } = await supabase
    .from('workout_sets')
    .select('session_id')
    .eq('completed', true)

  const countMap: Record<string, number> = {}
  ;(setCounts ?? []).forEach(s => {
    countMap[s.session_id] = (countMap[s.session_id] ?? 0) + 1
  })

  const enriched = (sessions ?? []).map(s => ({
    ...s,
    set_count: countMap[s.id] ?? 0,
  }))

  const grouped = groupByMonth(enriched)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-zinc-400 text-sm mt-0.5">
          {enriched.length} workout{enriched.length !== 1 ? 's' : ''} logged
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell className="text-zinc-700 mx-auto mb-3" size={36} />
          <p className="text-zinc-500 text-sm">No completed workouts yet</p>
          <Link href="/workout" className="text-orange-400 hover:text-orange-300 text-sm mt-2 inline-block transition-colors">
            Log your first workout →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, monthSessions]) => (
            <div key={month}>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
                <Calendar size={12} />
                {month}
              </p>
              <div className="space-y-2">
                {monthSessions.map(s => {
                  const date = new Date(s.started_at)
                  const dayLabel = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
                  const timeLabel = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  const duration = s.finished_at
                    ? Math.round((new Date(s.finished_at).getTime() - new Date(s.started_at).getTime()) / 60000)
                    : null

                  return (
                    <Link
                      key={s.id}
                      href={`/workout/${s.id}`}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-zinc-600 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-100">
                          {s.name ?? 'Workout'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {dayLabel} · {timeLabel}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        {s.set_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Dumbbell size={11} />
                            {s.set_count} sets
                          </span>
                        )}
                        {duration !== null && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {duration}m
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
