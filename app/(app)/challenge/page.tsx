import { createClient } from '@/lib/supabase/server'
import ChallengeSetup from '@/components/challenge/ChallengeSetup'
import ChallengeView from '@/components/challenge/ChallengeView'

export default async function ChallengePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-red-400 text-sm">
          Database error — make sure you have run the migration in Supabase SQL Editor.
        </p>
        <pre className="text-xs text-zinc-500 mt-2">{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  let activities: any[] = []
  let activityLogs: any[] = []
  let days: any[] = []
  let currentDayNumber = 1

  if (challenge) {
    const start = new Date(challenge.start_date + 'T00:00:00')
    const todayDate = new Date(today + 'T00:00:00')
    currentDayNumber = Math.floor((todayDate.getTime() - start.getTime()) / 86400000) + 1

    const [{ data: acts }, { data: logs }, { data: challengeDays }] = await Promise.all([
      supabase
        .from('challenge_activities')
        .select('*')
        .eq('challenge_id', challenge.id)
        .order('order_index'),
      supabase
        .from('challenge_activity_logs')
        .select('activity_id, date, completed')
        .eq('user_id', user!.id)
        .gte('date', challenge.start_date),
      supabase
        .from('challenge_days')
        .select('*')
        .eq('challenge_id', challenge.id)
        .order('day_number'),
    ])

    activities = acts ?? []
    activityLogs = logs ?? []
    days = challengeDays ?? []
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Challenge</h1>
        <p className="text-zinc-400 text-sm mt-0.5">
          {challenge ? 'Track your daily commitment' : 'Start a new challenge'}
        </p>
      </div>

      {challenge ? (
        <ChallengeView
          challenge={challenge}
          activities={activities}
          activityLogs={activityLogs}
          days={days}
          today={today}
          currentDayNumber={currentDayNumber}
        />
      ) : (
        <ChallengeSetup />
      )}
    </div>
  )
}
