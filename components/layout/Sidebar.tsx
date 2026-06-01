'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Activity,
  TrendingUp,
  Calendar,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/challenge', label: 'Challenge', icon: Flame },
  { href: '/workout', label: 'Workout', icon: Activity },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/history', label: 'History', icon: Calendar },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 border-r border-zinc-800 bg-zinc-950 px-3 py-5">
      <div className="flex items-center gap-2 px-3 mb-8">
        <Flame className="text-orange-500" size={20} />
        <span className="font-bold text-lg tracking-tight">Forge</span>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-orange-500/10 text-orange-400 font-medium'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors w-full"
      >
        <LogOut size={17} />
        Sign out
      </button>
    </aside>
  )
}
