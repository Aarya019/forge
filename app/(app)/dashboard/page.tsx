import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calcStreak, CATEGORIES } from '@/lib/types'
import { ChevronRight, Flame } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

  const [{ data: habits }, { data: logs }, { data: challenge }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user!.id).order('created_at'),
    supabase.from('habit_logs').select('*').eq('user_id', user!.id).gte('date', ninetyDaysAgo),
    supabase.from('challenges').select('*').eq('user_id', user!.id).eq('is_active', true).limit(1).maybeSingle(),
  ])

  const allHabits = habits ?? []
  const allLogs = logs ?? []

  const todayLogs = allLogs.filter(l => l.date === today)
  const completedToday = todayLogs.filter(l => l.completed).length
  const total = allHabits.length
  const pct = total > 0 ? Math.round((completedToday / total) * 100) : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const todayDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-zinc-500 text-sm font-mono">{todayDate}</p>
        <h1 className="text-2xl font-bold mt-0.5">
          {greeting},{' '}
          <span className="text-orange-400">{user?.email?.split('@')[0]}</span>
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Habit ring */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4">Today&apos;s habits</p>
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle
                  cx="28" cy="28" r="22"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {pct}%
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold">{completedToday}<span className="text-zinc-500 text-base font-normal">/{total}</span></p>
              <p className="text-xs text-zinc-400 mt-0.5">habits done</p>
            </div>
          </div>
          {total > 0 && (
            <div className="mt-4 space-y-1.5">
              {allHabits.slice(0, 4).map(h => {
                const done = todayLogs.some(l => l.habit_id === h.id && l.completed)
                const cat = CATEGORIES[h.category] ?? CATEGORIES.custom
                return (
                  <div key={h.id} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-orange-500' : 'bg-zinc-700'}`} />
                    <span className={`text-xs truncate ${done ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>{h.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-auto shrink-0 ${cat.color}`}>{cat.label}</span>
                  </div>
                )
              })}
              {total > 4 && <p className="text-xs text-zinc-600 pl-3.5">+{total - 4} more</p>}
            </div>
          )}
          {total === 0 && (
            <p className="text-xs text-zinc-600 mt-3">No habits yet</p>
          )}
          <Link href="/habits" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 mt-4 transition-colors">
            Manage habits <ChevronRight size={12} />
          </Link>
        </div>

        {/* Streaks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4">Top streaks</p>
          {allHabits.length === 0 ? (
            <p className="text-xs text-zinc-600">No habits yet</p>
          ) : (
            <div className="space-y-3">
              {allHabits
                .map(h => ({ habit: h, streak: calcStreak(h.id, allLogs, today) }))
                .sort((a, b) => b.streak - a.streak)
                .slice(0, 5)
                .map(({ habit, streak }) => (
                  <div key={habit.id} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300 truncate">{habit.name}</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-orange-400 shrink-0 ml-2">
                      <Flame size={13} />
                      {streak}d
                    </span>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Active challenge */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4">Active challenge</p>
          {challenge ? (() => {
            const start = new Date(challenge.start_date + 'T00:00:00')
            const todayDate = new Date(today + 'T00:00:00')
            const dayNum = Math.floor((todayDate.getTime() - start.getTime()) / 86400000) + 1
            const clamped = Math.min(Math.max(dayNum, 1), challenge.duration_days)
            const pct = Math.round(((clamped - 1) / challenge.duration_days) * 100)
            return (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="text-orange-500" size={16} />
                  <span className="font-semibold text-zinc-100 text-sm">{challenge.name}</span>
                </div>
                <p className="text-2xl font-bold mb-3">
                  Day {clamped}
                  <span className="text-zinc-500 text-base font-normal"> / {challenge.duration_days}</span>
                </p>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </>
            )
          })() : (
            <p className="text-xs text-zinc-600">No active challenge</p>
          )}
          <Link href="/challenge" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 mt-4 transition-colors">
            {challenge ? 'View challenge' : 'Start a challenge'} <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4">Recent workouts</p>
          <p className="text-xs text-zinc-600">Coming in Phase 4 — workout logger</p>
          <Link href="/workout" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orangeic-300 mt-4 transition-colors">
            Log a workout <ChevronRight size={12} />
          </Link>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4">Personal records</p>
          <p className="text-xs text-zinc-600">Coming in Phase 4 — PR tracking</p>
        </div>
      </div>
    </div>
  )
}
