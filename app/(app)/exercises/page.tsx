import { createClient } from '@/lib/supabase/server'
import { addCustomExercise } from '@/lib/actions/workouts'

const CATEGORY_LABELS: Record<string, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs',
  core: 'Core', cardio: 'Cardio', full_body: 'Full Body',
}

const TYPE_COLORS: Record<string, string> = {
  strength: 'text-orange-400 bg-orange-400/10',
  bodyweight: 'text-green-400 bg-green-400/10',
  cardio: 'text-pink-400 bg-pink-400/10',
}

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user!.id}`)
    .order('name')

  const grouped = (exercises ?? []).reduce<Record<string, typeof exercises>>((acc, ex) => {
    if (!acc[ex!.category]) acc[ex!.category] = []
    acc[ex!.category]!.push(ex)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Exercises</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{exercises?.length ?? 0} exercises available</p>
        </div>
      </div>

      {/* Add custom exercise */}
      <form action={async (fd: FormData) => {
        'use server'
        const name = fd.get('name') as string
        const category = fd.get('category') as string
        const type = fd.get('type') as string
        if (name && category && type) await addCustomExercise(name, category, type)
      }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-8 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-36">
          <label className="block text-xs text-zinc-500 mb-1">Name</label>
          <input name="name" placeholder="e.g. Hip Thrust" required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors" />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Category</label>
          <select name="category" required className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 [color-scheme:dark]">
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Type</label>
          <select name="type" required className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 [color-scheme:dark]">
            <option value="strength">Strength</option>
            <option value="bodyweight">Bodyweight</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Add
        </button>
      </form>

      {/* Exercise list */}
      <div className="space-y-6">
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
          const exs = grouped[cat] ?? []
          if (!exs.length) return null
          return (
            <div key={cat}>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">{label}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {exs.map(ex => (
                  <div key={ex!.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-zinc-200">{ex!.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[ex!.type] ?? ''}`}>{ex!.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
