import Link from 'next/link'
import { Clock, Dumbbell, Trophy, ChevronLeft } from 'lucide-react'

type Set = {
  exercise_id: string; set_number: number
  reps: number | null; weight_kg: number | null
  duration_seconds: number | null; distance_km: number | null
  completed: boolean
}
type Exercise = { id: string; name: string; category: string; type: string }

type Props = {
  session: { id: string; name: string | null; started_at: string; finished_at: string }
  sets: Set[]
  exercises: Exercise[]
}

const CATEGORY_COLORS: Record<string, string> = {
  push: 'text-orange-400', pull: 'text-blue-400', legs: 'text-green-400',
  core: 'text-yellow-400', cardio: 'text-pink-400', full_body: 'text-purple-400',
}

export default function WorkoutSummary({ session, sets, exercises }: Props) {
  const duration = Math.round(
    (new Date(session.finished_at).getTime() - new Date(session.started_at).getTime()) / 60000,
  )
  const completedSets = sets.filter(s => s.completed)
  const exerciseIds = [...new Set(completedSets.map(s => s.exercise_id))]
  const exercisesInSession = exerciseIds
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean) as Exercise[]

  const date = new Date(session.started_at).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/workout"
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ChevronLeft size={16} /> Back
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{session.name ?? 'Workout'}</h1>
        <p className="text-zinc-400 text-sm mt-0.5">{date}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: <Clock size={14} />, label: 'Duration', value: `${duration}m` },
          { icon: <Dumbbell size={14} />, label: 'Exercises', value: exercisesInSession.length },
          { icon: <Trophy size={14} />, label: 'Sets done', value: completedSets.length },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-zinc-500 mb-1">{stat.icon}</div>
            <p className="text-xl font-bold text-zinc-100">{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Exercise breakdown */}
      <div className="space-y-3">
        {exercisesInSession.map(exercise => {
          const exSets = completedSets.filter(s => s.exercise_id === exercise.id)
          const catColor = CATEGORY_COLORS[exercise.category] ?? 'text-zinc-400'
          return (
            <div key={exercise.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium text-zinc-100 text-sm">{exercise.name}</span>
                <span className={`text-xs ${catColor}`}>{exercise.category.replace('_', ' ')}</span>
              </div>
              <div className="space-y-1">
                {exSets.map(set => (
                  <div key={set.set_number} className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-600 font-mono text-xs w-5">{set.set_number}</span>
                    {exercise.type === 'cardio' ? (
                      <span className="text-zinc-300">
                        {set.duration_seconds ? `${Math.round(set.duration_seconds / 60)}min` : ''}
                        {set.distance_km ? ` · ${set.distance_km}km` : ''}
                      </span>
                    ) : exercise.type === 'bodyweight' ? (
                      <span className="text-zinc-300">{set.reps ? `${set.reps} reps` : '—'}</span>
                    ) : (
                      <span className="text-zinc-300">
                        {set.weight_kg ? `${set.weight_kg}kg` : '—'}
                        {set.reps ? ` × ${set.reps}` : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
