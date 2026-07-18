export type PlanTier = 'standard' | 'pro' | 'max'

export const PLAN_FEATURES: Record<PlanTier, {
  name: string
  price: string
  maxEvents: number
  maxVendors: number
  maxUsers: number
  hasReports: boolean
  hasRSVP: boolean
  hasPulseAI: boolean
  hasWhatsApp: boolean
  hasTimeline: boolean
}> = {
  standard: {
    name: 'Standard',
    price: 'R299/mo',
    maxEvents: 5,
    maxVendors: 5,
    maxUsers: 1,
    hasReports: false,
    hasRSVP: false,
    hasPulseAI: false,
    hasWhatsApp: false,
    hasTimeline: false,
  },
  pro: {
    name: 'Pro',
    price: 'R999/mo',
    maxEvents: 15,
    maxVendors: 15,
    maxUsers: 5,
    hasReports: true,
    hasRSVP: true,
    hasPulseAI: false,
    hasWhatsApp: true,
    hasTimeline: true,
  },
  max: {
    name: 'Max',
    price: 'R2,999/mo',
    maxEvents: 999999,
    maxVendors: 999999,
    maxUsers: 15,
    hasReports: true,
    hasRSVP: true,
    hasPulseAI: true,
    hasWhatsApp: true,
    hasTimeline: true,
  },
}

export function canAccess(tier: PlanTier | undefined, feature: keyof typeof PLAN_FEATURES['standard']): boolean {
  if (!tier) return false
  const plan = PLAN_FEATURES[tier]
  if (!plan) return false
  return !!plan[feature]
}

export function getUpgradeTier(currentTier: PlanTier, feature: string): PlanTier | null {
  const order: PlanTier[] = ['standard', 'pro', 'max']
  const currentIndex = order.indexOf(currentTier)
  for (let i = currentIndex + 1; i < order.length; i++) {
    const plan = PLAN_FEATURES[order[i]]
    if ((plan as any)[feature]) return order[i]
  }
  return null
}
