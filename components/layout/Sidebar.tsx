'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Calendar, Users, CheckSquare,
  BarChart2, Settings, LogOut, Zap
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/events',    label: 'Events',     icon: Calendar },
  { href: '/vendors',   label: 'Vendors',    icon: Users },
  { href: '/tasks',     label: 'Tasks',      icon: CheckSquare },
  { href: '/reports',   label: 'Reports',    icon: BarChart2 },
  { href: '/settings',  label: 'Settings',   icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-dark-sidebar flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-16 bg-brand flex items-center px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">EventPulse</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand/15 text-brand border-l-2 border-brand pl-2.5'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon size={16} className={active ? 'text-brand' : ''} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Pulse AI widget */}
      <div className="px-3 mb-3">
        <button className="w-full bg-brand/20 hover:bg-brand/30 text-brand rounded-lg px-3 py-3 text-sm font-semibold flex items-center gap-2.5 transition-colors">
          <Zap size={14} />
          Ask Pulse AI
        </button>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-500 hover:text-gray-300 text-sm rounded-lg hover:bg-white/5 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
