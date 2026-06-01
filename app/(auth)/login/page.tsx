'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        // Auto sign-in after sign-up
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          setError('Account created — please sign in.')
          setIsSignUp(false)
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Flame className="text-orange-500" size={28} />
          <span className="text-2xl font-bold tracking-tight">Forge</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h1 className="text-xl font-semibold mb-1">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-zinc-400 text-sm mb-6">
            {isSignUp ? 'Set a password to get started.' : 'Sign in to your account.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-zinc-400 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? '…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-5">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(v => !v); setError('') }}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
