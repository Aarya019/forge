'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function StartWorkoutButton() {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleStart = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({ user_id: user.id })
        .select('id')
        .single()

      if (!error && data) router.push(`/workout/${data.id}`)
    })
  }

  return (
    <button
      onClick={handleStart}
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-4 rounded-xl text-sm transition-colors mb-8"
    >
      <Play size={16} />
      {pending ? 'Starting…' : 'Start new workout'}
    </button>
  )
}
