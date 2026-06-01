'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ExerciseSearch from './ExerciseSearch'
import { addSet, completeSet, uncompleteSet, deleteSet, finishSession } from '@/lib/actions/workouts'

type Exercise = { id: string; name: string; category: string; type: string }
type WorkoutSet = {
  id: string; session_id: string; exercise_id: string; set_number: number
  reps: number | null; weight_kg: number | null
  duration_seconds: number | null; distance_km: number | null
  completed: boolean
}

type Props = {
  sessionId: string
  startedAt: string
  initialSets: WorkoutSet[]
  exercises: Exercise[]
}

const CATEGORY_COLORS: Record<string, string> = {
  push: 'text-orange-400', pull: 'text-blue-400', legs: 'text-green-400',
  core: 'text-yellow-400', cardio: 'text-pink-400', full_body: 'text-purple-400',
}

function SetRow({ set, exerciseType, sessionId }: {
  set: WorkoutSet; exerciseType: string; sessionId: string
}) {
  const [reps, setReps] = useState(set.reps?.toString() ?? '')
  const [weight, setWeight] = useState(set.weight_kg?.toString() ?? '')
  const [duration, setDuration] = useState(set.duration_seconds?.toString() ?? '')
  const [distance, setDistance] = useState(set.distance_km?.toString() ?? '')
  const [pending, startTransition] = useTransition()

  const isCardio = exerciseType === 'cardio'
  const isBodyweight = exerciseType === 'bodyweight'

  const handleComplete = () =>
    startTransition(() =>
      completeSet(
        set.id, sessionId,
        reps ? parseInt(reps) : null,
        weight ? parseFloat(weight) : null,
        duration ? parseInt(duration) : null,
        distance ? parseFloat(distance) : null,
      ),
    )

  const handleUncomplete = () => startTransition(() => uncompleteSet(set.id, sessionId))
  const handleDelete = () => startTransition(() => deleteSet(set.id, sessionId))

  return (
    <div className={`flex items-center gap-2 py-2 ${set.completed ? 'opacity-60' : ''}`}>
      <span className="text-xs text-zinc-500 w-5 text-center font-mono shrink-0">{set.set_number}</span>

      {isCardio ? (
        <>
          <input value={duration} onChange={e => setDuration(e.target.value)}
            placeholder="mins" type="number" min={0} disabled={set.completed}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-center text-zinc-100 focus:outline-none focus:border-orange-500 disabled:opacity-50" />
          <input value={distance} onChange={e => setDistance(e.target.value)}
            placeholder="km" type="number" step={0.01} min={0} disabled={set.completed}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-center text-zinc-100 focus:outline-none focus:border-orange-500 disabled:opacity-50" />
        </>
      ) : (
        <>
          {!isBodyweight && (
            <input value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="kg" type="number" step={0.5} min={0} disabled={set.completed}
              className="w-16 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-center text-zinc-100 focus:outline-none focus:border-orange-500 disabled:opacity-50" />
          )}
          <input value={reps} onChange={e => setReps(e.target.value)}
            placeholder="reps" type="number" min={0} disabled={set.completed}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-center text-zinc-100 focus:outline-none focus:border-orange-500 disabled:opacity-50" />
        </>
      )}

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={set.completed ? handleUncomplete : handleComplete}
          disabled={pending}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
            set.completed ? 'bg-orange-500 border-orange-500' : 'border-zinc-600 hover:border-orange-400'
          }`}
        >
          {set.completed && <Check size={12} className="text-white" />}
        </button>
        {!set.completed && (
          <button onClick={handleDelete} disabled={pending}
            className="text-zinc-700 hover:text-red-400 transition-colors w-6 h-6 flex items-center justify-center">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function ActiveWorkout({ sessionId, startedAt, initialSets, exercises }: Props) {
  const router = useRouter()
  const [sets, setSets] = useState<WorkoutSet[]>(initialSets)
  const [showSearch, setShowSearch] = useState(false)
  const [newPRs, setNewPRs] = useState<string[]>([])
  const [finishing, startFinish] = useTransition()
  const [addingSet, startAddSet] = useTransition()
  const [elapsed, setElapsed] = useState(0)

  // Sync server state into local state after revalidatePath refreshes props
  useEffect(() => {
    setSets(initialSets)
  }, [initialSets])

  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const exercisesInSession = exercises.filter(e => sets.some(s => s.exercise_id === e.id))

  // No optimistic updates — server action + revalidatePath drives state via useEffect above
  const handleSelectExercise = (exercise: Exercise) => {
    const setNumber = sets.filter(s => s.exercise_id === exercise.id).length + 1
    startAddSet(() => addSet(sessionId, exercise.id, setNumber))
  }

  const handleAddSet = (exerciseId: string) => {
    const setNumber = sets.filter(s => s.exercise_id === exerciseId).length + 1
    startAddSet(() => addSet(sessionId, exerciseId, setNumber))
  }

  const handleFinish = () => {
    startFinish(async () => {
      const prs = await finishSession(sessionId)
      if (prs.length > 0) {
        setNewPRs(prs)
      } else {
        router.push('/workout')
      }
    })
  }

  return (
    <>
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-orange-400 text-sm font-medium">{formatTime(elapsed)}</span>
          {addingSet && <span className="text-zinc-600 text-xs">saving…</span>}
        </div>
        <button
          onClick={handleFinish}
          disabled={finishing}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {finishing ? 'Saving…' : 'Finish'}
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {exercisesInSession.map(exercise => {
          const exerciseSets = sets.filter(s => s.exercise_id === exercise.id)
          const catColor = CATEGORY_COLORS[exercise.category] ?? 'text-zinc-400'
          return (
            <div key={exercise.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-zinc-100 text-sm">{exercise.name}</span>
                  <span className={`text-xs ml-2 ${catColor}`}>{exercise.category.replace('_', ' ')}</span>
                </div>
                <div className="flex gap-2 text-xs text-zinc-500">
                  {exercise.type === 'cardio' ? (
                    <><span>mins</span><span>km</span></>
                  ) : exercise.type === 'bodyweight' ? (
                    <span>reps</span>
                  ) : (
                    <><span>kg</span><span>reps</span></>
                  )}
                  <span className="w-7 text-center">✓</span>
                </div>
              </div>

              <div className="divide-y divide-zinc-800">
                {exerciseSets.map(set => (
                  <SetRow
                    key={set.id}
                    set={set}
                    exerciseType={exercise.type}
                    sessionId={sessionId}
                  />
                ))}
              </div>

              <button
                onClick={() => handleAddSet(exercise.id)}
                disabled={addingSet}
                className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-orange-400 disabled:opacity-40 transition-colors"
              >
                <Plus size={13} /> Add set
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-700 hover:border-orange-500 text-zinc-500 hover:text-orange-400 rounded-xl py-4 text-sm transition-colors"
        >
          <Plus size={16} /> Add exercise
        </button>

        {exercisesInSession.length === 0 && (
          <p className="text-center text-zinc-600 text-sm pt-4">
            Tap "Add exercise" to get started
          </p>
        )}
      </div>

      <AnimatePresence>
        {showSearch && (
          <ExerciseSearch
            exercises={exercises}
            onSelect={handleSelectExercise}
            onClose={() => setShowSearch(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newPRs.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div className="absolute inset-0 bg-black/70"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setNewPRs([]); router.push('/workout') }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center max-w-sm w-full z-10"
            >
              <Trophy className="text-orange-400 mx-auto mb-3" size={40} />
              <h2 className="text-xl font-bold mb-2">New PR{newPRs.length > 1 ? 's' : ''}!</h2>
              <div className="space-y-1 mb-6">
                {newPRs.map(name => (
                  <p key={name} className="text-orange-400 font-medium">{name}</p>
                ))}
              </div>
              <button
                onClick={() => { setNewPRs([]); router.push('/workout') }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Let&apos;s go! 🔥
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
