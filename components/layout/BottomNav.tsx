'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Activity, TrendingUp, MoreHorizontal } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/workout', label: 'Workout', icon: Activity },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/history', label: 'More', icon: MoreHorizontal },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                active ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
