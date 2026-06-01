'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Props = {
  data: { week: string; pct: number }[]
}

export default function HabitConsistencyChart({ data }: Props) {
  const hasData = data.some(d => d.pct > 0)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Habit Consistency</p>
      <p className="text-zinc-400 text-sm mb-5">% of daily habits completed each week</p>

      {!hasData ? (
        <p className="text-zinc-600 text-sm text-center py-8">No habit data yet — start checking off habits daily</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={28}>
            <XAxis
              dataKey="week"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
              width={36}
            />
            <Tooltip
              cursor={{ fill: '#27272a' }}
              contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(v) => [`${v}%`, 'Completion']}
            />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.pct >= 80 ? '#f97316' : entry.pct >= 50 ? '#fb923c' : '#431407'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
