export type PlanTier = 'standard' | 'pro' | 'max'

export const PLAN_FEATURES: Record<PlanTier, {
  name: string
  price: string
  maxCampaigns: number
  maxCreators: number
  maxUsers: number
  hasReports: boolean
  hasBrandApproval: boolean
  hasEngageAI: boolean
  hasWhatsApp: boolean
  hasTimeline: boolean
}> = {
  standard: {
    name: 'Starter',
    price: 'R499/mo',
    maxCampaigns: 3,
    maxCreators: 10,
    maxUsers: 1,
    hasReports: false,
    hasBrandApproval: false,
    hasEngageAI: false,
    hasWhatsApp: false,
    hasTimeline: false,
  },
  pro: {
    name: 'Growth',
    price: 'R1,499/mo',
    maxCampaigns: 15,
    maxCreators: 50,
    maxUsers: 5,
    hasReports: true,
    hasBrandApproval: true,
    hasEngageAI: false,
    hasWhatsApp: true,
    hasTimeline: true,
  },
  max: {
    name: 'Agency',
    price: 'R3,999/mo',
    maxCampaigns: 999999,
    maxCreators: 999999,
    maxUsers: 15,
    hasReports: true,
    hasBrandApproval: true,
    hasEngageAI: true,
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
