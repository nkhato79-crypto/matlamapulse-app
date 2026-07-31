'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Megaphone, Users, ListChecks,
  BarChart2, Settings, LogOut, Zap
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/events',    label: 'Campaigns',     icon: Megaphone },
  { href: '/vendors',   label: 'Creators',      icon: Users },
  { href: '/tasks',     label: 'Deliverables',  icon: ListChecks },
  { href: '/reports',   label: 'Analytics',     icon: BarChart2 },
  { href: '/settings',  label: 'Settings',      icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/register')
  }

  return (
    <aside className="w-60 min-h-screen bg-dark-sidebar flex flex-col flex-shrink-0">
      <div className="h-16 bg-brand flex items-center px-6">
        <span className="text-white font-bold text-xl tracking-tight">Engage Terminal</span>
      </div>

      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] uppercase tracking-widest text-[#555560] px-2">Matlama Marketing</p>
      </div>

      <nav className="flex-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 h-12 text-sm transition-colors ${
                active
                  ? 'bg-brand/15 text-brand font-semibold border-l-[3px] border-brand pl-[21px]'
                  : 'text-[#a6a6b2] hover:text-gray-200 hover:bg-white/5 pl-6'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 mb-3">
        <button className="w-full bg-brand/20 hover:bg-brand/30 text-brand rounded-lg px-3 py-3.5 text-[13px] font-semibold flex items-center gap-2.5 transition-colors">
          <Zap size={14} />
          Ask Engage AI
        </button>
      </div>

      <div className="px-4 pb-4 border-t border-white/5 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-500 hover:text-gray-300 text-sm hover:bg-white/5 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
