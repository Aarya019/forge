import { createClient } from '@/lib/supabase/server'
import HabitConsistencyChart from '@/components/charts/HabitConsistencyChart'
import ExerciseProgressChart from '@/components/charts/ExerciseProgressChart'
import WorkoutFrequencyChart from '@/components/charts/WorkoutFrequencyChart'
import PRsTable from '@/components/charts/PRsTable'

function getWeekRanges(n: number) {
  const ranges: { start: string; end: string; label: string }[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const end = new Date(now)
    end.setDate(now.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    ranges.push({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      label: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    })
  }
  return ranges
}

function isInRange(date: string, start: string, end: string) {
  return date >= start && date <= end
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

  const [
    { data: habits },
    { data: habitLogs },
    { data: sessions },
    { data: workoutSets },
    { data: exercises },
    { data: prs },
  ] = await Promise.all([
    supabase.from('habits').select('id, name').eq('user_id', user!.id),
    supabase.from('habit_logs').select('habit_id, date, completed').eq('user_id', user!.id).gte('date', ninetyDaysAgo),
    supabase.from('workout_sessions').select('id, started_at').eq('user_id', user!.id).not('finished_at', 'is', null).gte('started_at', ninetyDaysAgo + 'T00:00:00').order('started_at'),
    supabase.from('workout_sets').select('exercise_id, weight_kg, reps, distance_km, completed, session_id').eq('completed', true),
    supabase.from('exercises').select('id, name, type, category').order('name'),
    supabase.from('personal_records').select('value, unit, achieved_at, exercise_id').eq('user_id', user!.id),
  ])

  const weeks = getWeekRanges(8)
  const allHabits = habits ?? []
  const allLogs = habitLogs ?? []
  const allSessions = sessions ?? []
  const allSets = workoutSets ?? []
  const allExercises = exercises ?? []
  const allPRs = prs ?? []

  // Habit consistency: % of all habits completed per week
  const habitConsistencyData = weeks.map(({ start, end, label }) => {
    if (allHabits.length === 0) return { week: label, pct: 0 }
    let completed = 0
    let total = 0
    const days: string[] = []
    for (let d = new Date(start + 'T00:00:00'); d <= new Date(end + 'T00:00:00'); d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0])
    }
    allHabits.forEach(h => {
      days.forEach(day => {
        total++
        if (allLogs.some(l => l.habit_id === h.id && l.date === day && l.completed)) completed++
      })
    })
    return { week: label, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  })

  // Workout frequency: sessions per week
  const workoutFrequencyData = weeks.map(({ start, end, label }) => ({
    week: label,
    count: allSessions.filter(s => {
      const d = s.started_at.split('T')[0]
      return isInRange(d, start, end)
    }).length,
  }))

  // Exercise progress: for each exercise, collect max value per session
  const sessionDateMap = new Map(allSessions.map(s => [s.id, s.started_at.split('T')[0]]))

  const exerciseProgressMap: Record<string, { date: string; value: number }[]> = {}
  allSets.forEach(set => {
    const date = sessionDateMap.get(set.session_id)
    if (!date) return
    const ex = allExercises.find(e => e.id === set.exercise_id)
    if (!ex) return

    let value = 0
    if (ex.type === 'strength' && set.weight_kg) value = parseFloat(set.weight_kg as unknown as string)
    else if (ex.type === 'bodyweight' && set.reps) value = set.reps
    else if (ex.type === 'cardio' && set.distance_km) value = parseFloat(set.distance_km as unknown as string)

    if (!value) return
    if (!exerciseProgressMap[set.exercise_id]) exerciseProgressMap[set.exercise_id] = []

    const existing = exerciseProgressMap[set.exercise_id].find(p => p.date === date)
    if (existing) { if (value > existing.value) existing.value = value }
    else exerciseProgressMap[set.exercise_id].push({ date, value })
  })

  // Sort each exercise's data by date
  Object.values(exerciseProgressMap).forEach(arr => arr.sort((a, b) => a.date.localeCompare(b.date)))

  // PRs enriched with exercise name
  const enrichedPRs = allPRs.map(pr => {
    const ex = allExercises.find(e => e.id === pr.exercise_id)
    return {
      exercise: ex?.name ?? 'Unknown',
      value: pr.value,
      unit: pr.unit,
      date: pr.achieved_at,
    }
  }).sort((a, b) => b.date.localeCompare(a.date))

  // Exercises that have logged data (for the picker)
  const trackedExercises = allExercises.filter(e => exerciseProgressMap[e.id]?.length > 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Your stats over the last 90 days</p>
      </div>

      <HabitConsistencyChart data={habitConsistencyData} />

      <div className="grid sm:grid-cols-5 gap-5">
        <div className="sm:col-span-3">
          <ExerciseProgressChart
            exercises={trackedExercises}
            progressMap={exerciseProgressMap}
          />
        </div>
        <div className="sm:col-span-2">
          <WorkoutFrequencyChart data={workoutFrequencyData} />
        </div>
      </div>

      <PRsTable prs={enrichedPRs} />
    </div>
  )
}
