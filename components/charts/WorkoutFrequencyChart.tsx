'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {
  data: { week: string; count: number }[]
}

export default function WorkoutFrequencyChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Workouts</p>
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="text-2xl font-bold text-zinc-100">{total}</span>
        <span className="text-zinc-500 text-sm">in 8 weeks</span>
      </div>

      {total === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-8">No workouts logged yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={20}>
            <XAxis
              dataKey="week"
              tick={{ fill: '#71717a', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={20}
            />
            <Tooltip
              cursor={{ fill: '#27272a' }}
              contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(v) => [v, 'Workouts']}
            />
            <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
