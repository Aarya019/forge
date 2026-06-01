'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type Exercise = { id: string; name: string; type: string }
type Props = {
  exercises: Exercise[]
  progressMap: Record<string, { date: string; value: number }[]>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ExerciseProgressChart({ exercises, progressMap }: Props) {
  const [selectedId, setSelectedId] = useState(exercises[0]?.id ?? '')
  const selected = exercises.find(e => e.id === selectedId)
  const data = (progressMap[selectedId] ?? []).map(p => ({ ...p, date: formatDate(p.date) }))
  const unit = selected?.type === 'cardio' ? 'km' : selected?.type === 'bodyweight' ? 'reps' : 'kg'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Exercise Progress</p>

      {exercises.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-8">Log workouts to see progress</p>
      ) : (
        <>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 mb-4 [color-scheme:dark]"
          >
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>

          {data.length < 2 ? (
            <p className="text-zinc-600 text-sm text-center py-6">Log at least 2 sessions to see a trend</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v) => [`${v} ${unit}`, selected?.name ?? '']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  )
}
