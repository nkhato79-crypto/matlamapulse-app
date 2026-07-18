'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { type PlanTier, PLAN_FEATURES } from '@/lib/plans'

export default function UpgradeGate({
  currentTier,
  requiredTier,
  feature,
}: {
  currentTier: PlanTier
  requiredTier: PlanTier
  feature: string
}) {
  const plan = PLAN_FEATURES[requiredTier]

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center border-b border-[#e5e5eb]">
        <h1 className="text-xl font-bold text-[#1a1a1f]">{feature}</h1>
      </div>
      <div className="flex items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-[#f7f7fa] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-[#a6a6b2]" />
          </div>
          <h2 className="text-lg font-bold text-[#1a1a1f] mb-2">
            Upgrade to {plan.name}
          </h2>
          <p className="text-[13px] text-[#80808c] mb-6">
            {feature} is available on the {plan.name} plan ({plan.price}) and above.
            You&apos;re currently on the {PLAN_FEATURES[currentTier].name} plan.
          </p>
          <Link
            href="/settings"
            className="inline-block bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-md text-[13px] font-semibold transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    </div>
  )
}
