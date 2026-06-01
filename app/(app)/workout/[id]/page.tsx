import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ActiveWorkout from '@/components/workout/ActiveWorkout'
import WorkoutSummary from '@/components/workout/WorkoutSummary'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) redirect('/workout')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (error) { console.error(error); redirect('/workout') }
  if (!session) notFound()

  const [setsResult, exercisesResult] = await Promise.all([
    supabase.from('workout_sets').select('*').eq('session_id', id).order('created_at'),
    supabase.from('exercises').select('*').order('name'),
  ])

  const sets = setsResult.data ?? []
  const exercises = exercisesResult.data ?? []

  // Finished session — show read-only summary
  if (session.finished_at) {
    return (
      <WorkoutSummary
        session={session}
        sets={sets}
        exercises={exercises}
      />
    )
  }

  // Active session
  return (
    <div className="min-h-screen bg-zinc-950">
      <ActiveWorkout
        sessionId={id}
        startedAt={session.started_at}
        initialSets={sets}
        exercises={exercises}
      />
    </div>
  )
}
