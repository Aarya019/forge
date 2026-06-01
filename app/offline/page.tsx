'use client'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <WifiOff className="text-zinc-600 mx-auto mb-4" size={40} />
        <h1 className="text-xl font-semibold text-zinc-200 mb-2">You&apos;re offline</h1>
        <p className="text-zinc-500 text-sm max-w-xs">
          No internet connection. Pages you&apos;ve visited recently are still available.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
