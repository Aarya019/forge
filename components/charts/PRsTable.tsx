'use client'

import { Trophy } from 'lucide-react'

type PR = { exercise: string; value: number; unit: string; date: string }

export default function PRsTable({ prs }: { prs: PR[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-orange-400" size={16} />
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Personal Records</p>
      </div>

      {prs.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-6">
          No PRs yet — finish a workout to set your first records
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                <th className="pb-3 font-medium">Exercise</th>
                <th className="pb-3 font-medium text-right">Best</th>
                <th className="pb-3 font-medium text-right">Achieved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {prs.map((pr, i) => (
                <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 text-zinc-200">{pr.exercise}</td>
                  <td className="py-3 text-right font-medium text-orange-400">
                    {pr.value} {pr.unit}
                  </td>
                  <td className="py-3 text-right text-zinc-500 text-xs">
                    {new Date(pr.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
