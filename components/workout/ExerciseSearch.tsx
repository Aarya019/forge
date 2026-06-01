'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

type Exercise = { id: string; name: string; category: string; type: string }

const CATEGORY_COLORS: Record<string, string> = {
  push: 'text-orange-400 bg-orange-400/10',
  pull: 'text-blue-400 bg-blue-400/10',
  legs: 'text-green-400 bg-green-400/10',
  core: 'text-yellow-400 bg-yellow-400/10',
  cardio: 'text-pink-400 bg-pink-400/10',
  full_body: 'text-purple-400 bg-purple-400/10',
}

type Props = {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export default function ExerciseSearch({ exercises, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? exercises.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : exercises

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = []
    acc[ex.category].push(ex)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-xl flex flex-col max-h-[80vh] z-10">
        <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
          <Search size={16} className="text-zinc-500 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {Object.entries(grouped).map(([category, exs]) => (
            <div key={category} className="mb-2">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium px-2 py-1">
                {category.replace('_', ' ')}
              </p>
              {exs.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => { onSelect(ex); onClose() }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                >
                  <span className="text-sm text-zinc-200">{ex.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[ex.category] ?? 'text-zinc-400 bg-zinc-700'}`}>
                    {ex.type}
                  </span>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-zinc-600 text-center py-8">No exercises found</p>
          )}
        </div>
      </div>
    </div>
  )
}
