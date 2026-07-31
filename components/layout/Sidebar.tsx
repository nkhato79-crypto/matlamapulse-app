'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PLAN_FEATURES, type PlanTier } from '@/lib/plans'
import {
  LayoutDashboard, Megaphone, Users, ListChecks,
  BarChart2, Settings, LogOut, Zap, Lock
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard, gate: null },
  { href: '/events',    label: 'Campaigns',     icon: Megaphone,       gate: null },
  { href: '/vendors',   label: 'Creators',      icon: Users,           gate: null },
  { href: '/tasks',     label: 'Deliverables',  icon: ListChecks,      gate: null },
  { href: '/reports',   label: 'Analytics',     icon: BarChart2,       gate: 'hasReports' as const },
  { href: '/settings',  label: 'Settings',      icon: Settings,        gate: null },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [tier, setTier] = useState<PlanTier | null>(null)

  useEffect(() => {
    async function loadTier() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('subscription_tier')
          .eq('id', profile.organization_id)
          .single()

        if (org?.subscription_tier) {
          setTier(org.subscription_tier as PlanTier)
        }
      }
    }
    loadTier()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const plan = tier ? PLAN_FEATURES[tier] : null

  return (
    <aside className="w-60 min-h-screen bg-dark-sidebar flex flex-col flex-shrink-0">
      <div className="h-16 bg-brand flex items-center px-6">
        <span className="text-white font-bold text-xl tracking-tight">Engage Terminal</span>
      </div>

      <nav className="flex-1 pt-4">
        {nav.map(({ href, label, icon: Icon, gate }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const locked = gate && plan ? !(plan as any)[gate] : false

          return (
            <Link
              key={href}
              href={locked ? '#' : href}
              onClick={locked ? (e) => e.preventDefault() : undefined}
              className={`flex items-center gap-3 h-12 text-sm transition-colors ${
                locked
                  ? 'text-[#555560] cursor-not-allowed pl-6'
                  : active
                    ? 'bg-brand/15 text-brand font-semibold border-l-[3px] border-brand pl-[21px]'
                    : 'text-[#a6a6b2] hover:text-gray-200 hover:bg-white/5 pl-6'
              }`}
            >
              <Icon size={16} />
              {label}
              {locked && <Lock size={12} className="ml-auto mr-6 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {plan && (
        <div className="px-4 mb-2">
          <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-[11px] text-[#a6a6b2]">Plan</span>
            <span className="text-[11px] font-semibold text-brand">{plan.name}</span>
          </div>
        </div>
      )}

      <div className="px-4 mb-3">
        {tier === 'max' ? (
          <button className="w-full bg-brand/20 hover:bg-brand/30 text-brand rounded-lg px-3 py-3.5 text-[13px] font-semibold flex items-center gap-2.5 transition-colors">
            <Zap size={14} />
            Ask Engage AI
          </button>
        ) : (
          <div className="w-full bg-white/5 rounded-lg px-3 py-3.5 text-[13px] text-[#555560] flex items-center gap-2.5">
            <Zap size={14} />
            <span>Engage AI</span>
            <Lock size={11} className="ml-auto opacity-50" />
          </div>
        )}
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
