'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Flame, Plus, X } from 'lucide-react'
import { createChallenge } from '@/lib/actions/challenges'

const PRESETS = [
  { label: '75 Hard', days: 75 },
  { label: '30 Days', days: 30 },
  { label: '21 Days', days: 21 },
]

const SUGGESTED_ACTIVITIES = [
  'Two 45-min workouts', 'Follow a diet', 'Drink 1 gallon of water',
  'Read 10 pages', 'No alcohol', 'Cold shower', 'Meditate', 'Spanish class',
]

export default function ChallengeSetup() {
  const [name, setName]           = useState('75 Hard')
  const [duration, setDuration]   = useState(75)
  const [customDuration, setCustom] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [activities, setActivities] = useState<string[]>([])
  const [activityInput, setActivityInput] = useState('')
  const [pending, startTransition] = useTransition()

  const effectiveDuration = useCustom ? (parseInt(customDuration) || 0) : duration

  const addActivity = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || activities.includes(trimmed)) return
    setActivities(prev => [...prev, trimmed])
    setActivityInput('')
  }

  const removeActivity = (name: string) =>
    setActivities(prev => prev.filter(a => a !== name))

  const handleActivityKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addActivity(activityInput) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || effectiveDuration < 1) return
    startTransition(() => createChallenge(name.trim(), effectiveDuration, startDate, activities))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="text-orange-500" size={20} />
          <h2 className="font-semibold text-zinc-100">Start a challenge</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Challenge name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 75 Hard"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Duration</label>
            <div className="flex gap-2 mb-2">
              {PRESETS.map(p => (
                <button
                  key={p.days} type="button"
                  onClick={() => { setDuration(p.days); setUseCustom(false); setName(p.label) }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !useCustom && duration === p.days
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button" onClick={() => setUseCustom(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useCustom ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                Custom
              </button>
            </div>
            {useCustom && (
              <input
                type="number" value={customDuration}
                onChange={e => setCustom(e.target.value)}
                placeholder="Number of days" min={1}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            )}
          </div>

          {/* Start date */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Start date</label>
            <input
              type="date" value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Daily activities */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Daily activities
              <span className="text-zinc-600 font-normal ml-1">(what you must do every day)</span>
            </label>

            {activities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {activities.map(a => (
                  <span key={a} className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs px-2.5 py-1 rounded-full">
                    {a}
                    <button type="button" onClick={() => removeActivity(a)} className="text-orange-400/60 hover:text-orange-300">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={activityInput}
                onChange={e => setActivityInput(e.target.value)}
                onKeyDown={handleActivityKey}
                placeholder="e.g. 45-min workout"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => addActivity(activityInput)}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTED_ACTIVITIES.filter(s => !activities.includes(s)).slice(0, 6).map(s => (
                <button
                  key={s} type="button"
                  onClick={() => addActivity(s)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || !name.trim() || effectiveDuration < 1}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {pending ? 'Starting…' : `Start ${effectiveDuration}-day challenge`}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
