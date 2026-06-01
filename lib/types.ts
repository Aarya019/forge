export type Habit = {
  id: string
  user_id: string
  name: string
  category: string
  created_at: string
}

export type HabitLog = {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
  created_at: string
}

export const CATEGORIES: Record<string, { label: string; color: string }> = {
  fitness:   { label: 'Fitness',   color: 'text-orange-400 bg-orange-400/10' },
  nutrition: { label: 'Nutrition', color: 'text-green-400 bg-green-400/10'  },
  sleep:     { label: 'Sleep',     color: 'text-indigo-400 bg-indigo-400/10' },
  learning:  { label: 'Learning',  color: 'text-blue-400 bg-blue-400/10'    },
  wellness:  { label: 'Wellness',  color: 'text-pink-400 bg-pink-400/10'    },
  custom:    { label: 'Custom',    color: 'text-zinc-400 bg-zinc-400/10'    },
}

export function calcStreak(habitId: string, logs: HabitLog[], today: string): number {
  const completed = new Set(
    logs.filter(l => l.habit_id === habitId && l.completed).map(l => l.date),
  )
  const todayDate = new Date(today + 'T00:00:00')
  const start = completed.has(today)
    ? todayDate
    : new Date(todayDate.getTime() - 86400000)

  let streak = 0
  for (let i = 0; i < 90; i++) {
    const d = new Date(start.getTime() - i * 86400000)
    const s = d.toISOString().split('T')[0]
    if (completed.has(s)) streak++
    else break
  }
  return streak
}
