'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Flame, X } from 'lucide-react'
import { createHabit, deleteHabit, toggleHabitLog } from '@/lib/actions/habits'
import { type Habit, type HabitLog, CATEGORIES, calcStreak } from '@/lib/types'

type Props = {
  habits: Habit[]
  logs: HabitLog[]
  today: string
}

function HabitCard({
  habit,
  logs,
  today,
}: {
  habit: Habit
  logs: HabitLog[]
  today: string
}) {
  const [pending, startTransition] = useTransition()
  const cat = CATEGORIES[habit.category] ?? CATEGORIES.custom
  const todayLog = logs.find(l => l.habit_id === habit.id && l.date === today)
  const checked = todayLog?.completed ?? false
  const streak = calcStreak(habit.id, logs, today)

  const toggle = () =>
    startTransition(() => toggleHabitLog(habit.id, today, !checked))

  const remove = () =>
    startTransition(() => deleteHabit(habit.id))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-4 bg-zinc-900 border rounded-xl px-4 py-3.5 transition-colors ${
        checked ? 'border-zinc-700' : 'border-zinc-800'
      }`}
    >
      <button
        onClick={toggle}
        disabled={pending}
        aria-label="Toggle habit"
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked
            ? 'bg-orange-500 border-orange-500'
            : 'border-zinc-600 hover:border-orange-400'
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${checked ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
          {habit.name}
        </p>
      </div>

      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${cat.color}`}>
        {cat.label}
      </span>

      {streak > 0 && (
        <span className="flex items-center gap-0.5 text-xs text-orange-400 shrink-0">
          <Flame size={12} />
          {streak}
        </span>
      )}

      <button
        onClick={remove}
        disabled={pending}
        className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
        aria-label="Delete habit"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  )
}

function AddHabitModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('fitness')
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      await createHabit(name.trim(), category)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-6 z-10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-zinc-100">New habit</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 8hrs sleep"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORIES).map(([key, { label, color }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    category === key ? color + ' ring-1 ring-current' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {pending ? 'Adding…' : 'Add habit'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default function HabitList({ habits, logs, today }: Props) {
  const [showModal, setShowModal] = useState(false)

  const todayCompleted = habits.filter(h =>
    logs.some(l => l.habit_id === h.id && l.date === today && l.completed),
  ).length

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-zinc-400">
          {todayCompleted}/{habits.length} done today
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Add habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-sm">No habits yet — add your first one</p>
        </div>
      ) : (
        <motion.div layout className="space-y-2">
          <AnimatePresence mode="popLayout">
            {habits.map(habit => (
              <HabitCard key={habit.id} habit={habit} logs={logs} today={today} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && <AddHabitModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}
