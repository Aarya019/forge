'use client'

import { useTransition } from 'react'
import { motion } from 'framer-motion'
import { Flame, StopCircle } from 'lucide-react'
import { toggleActivityLog, endChallenge } from '@/lib/actions/challenges'

type Challenge = {
  id: string; name: string; duration_days: number; start_date: string
}
type Activity = {
  id: string; name: string; order_index: number
}
type ActivityLog = {
  activity_id: string; date: string; completed: boolean
}
type ChallengeDay = {
  day_number: number; date: string; all_completed: boolean
}

type Props = {
  challenge: Challenge
  activities: Activity[]
  activityLogs: ActivityLog[]
  days: ChallengeDay[]
  today: string
  currentDayNumber: number
}

export default function ChallengeView({
  challenge, activities, activityLogs, days, today, currentDayNumber,
}: Props) {
  const [pending, startTransition] = useTransition()

  const dayMap = new Map(days.map(d => [d.day_number, d]))

  // Today's activity completion state
  const todayLogMap = new Map(
    activityLogs.filter(l => l.date === today).map(l => [l.activity_id, l.completed]),
  )
  const completedTodayCount = activities.filter(a => todayLogMap.get(a.id)).length
  const allDoneToday = activities.length > 0 && completedTodayCount === activities.length
  const isFinished = currentDayNumber > challenge.duration_days

  const completedDays = days.filter(d => d.all_completed).length
  const failedDays = days.filter(d => !d.all_completed).length
  const progressPct = Math.round(
    (Math.min(currentDayNumber - 1, challenge.duration_days) / challenge.duration_days) * 100,
  )

  const toggle = (activityId: string, currentValue: boolean) => {
    startTransition(() =>
      toggleActivityLog(
        activityId,
        challenge.id,
        today,
        currentDayNumber,
        !currentValue,
        activities.length,
      ),
    )
  }

  const stop = () => {
    if (confirm('End this challenge?')) startTransition(() => endChallenge(challenge.id))
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="text-orange-500" size={18} />
              <h2 className="font-semibold text-zinc-100">{challenge.name}</h2>
            </div>
            <p className="text-zinc-400 text-sm">
              {isFinished
                ? 'Challenge complete!'
                : `Day ${Math.min(currentDayNumber, challenge.duration_days)} of ${challenge.duration_days}`}
            </p>
          </div>
          <button onClick={stop} disabled={pending} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors">
            <StopCircle size={14} /> End
          </button>
        </div>

        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPct, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Completed', value: completedDays, color: 'text-green-400' },
            { label: 'Failed', value: failedDays, color: 'text-red-400' },
            { label: 'Remaining', value: Math.max(0, challenge.duration_days - (currentDayNumber - 1)), color: 'text-zinc-300' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-800 rounded-lg px-3 py-2.5 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's activities */}
      {!isFinished && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Today — Day {currentDayNumber}
            </p>
            {activities.length > 0 && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                allDoneToday
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {completedTodayCount}/{activities.length}
              </span>
            )}
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-zinc-600">No activities defined for this challenge.</p>
          ) : (
            <div className="space-y-2">
              {activities
                .sort((a, b) => a.order_index - b.order_index)
                .map(activity => {
                  const done = todayLogMap.get(activity.id) ?? false
                  return (
                    <button
                      key={activity.id}
                      onClick={() => toggle(activity.id, done)}
                      disabled={pending}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                        done
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        done ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                      }`}>
                        {done && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {activity.name}
                      </span>
                    </button>
                  )
                })}
            </div>
          )}

          {allDoneToday && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-green-400 font-medium mt-4"
            >
              🔥 Day {currentDayNumber} complete!
            </motion.p>
          )}
        </div>
      )}

      {/* Completion grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4">Progress grid</p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: challenge.duration_days }, (_, i) => i + 1).map(dayNum => {
            const log = dayMap.get(dayNum)
            const isToday = dayNum === currentDayNumber
            const isFuture = dayNum > currentDayNumber
            return (
              <div
                key={dayNum}
                title={`Day ${dayNum}${log ? (log.all_completed ? ' ✓' : ' ✗') : ''}`}
                className={`w-6 h-6 rounded-sm transition-colors ${
                  isFuture ? 'bg-zinc-800/50'
                  : log ? (log.all_completed ? 'bg-green-500' : 'bg-red-500/60')
                  : isToday ? 'bg-zinc-700 ring-1 ring-orange-400'
                  : 'bg-zinc-800'
                }`}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />Done</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/60 inline-block" />Missed</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-zinc-700 ring-1 ring-orange-400 inline-block" />Today</span>
        </div>
      </div>
    </div>
  )
}
