import { createClient } from '@/lib/supabase/server'
import { PLAN_FEATURES, type PlanTier } from '@/lib/plans'
import UpgradeGate from '@/components/UpgradeGate'

export default async function AnalyticsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let tier: PlanTier = 'standard'

  if (user) {
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
      if (org?.subscription_tier) tier = org.subscription_tier as PlanTier
    }
  }

  if (!PLAN_FEATURES[tier].hasReports) {
    return <UpgradeGate currentTier={tier} requiredTier="pro" feature="Analytics" />
  }

  const [{ data: campaigns }, { data: deliverables }, { data: creators }] = await Promise.all([
    supabase.from('events').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('vendors').select('id'),
  ])

  const totalCampaigns = campaigns?.length ?? 0
  const activeCampaigns = campaigns?.filter(e => e.status === 'active').length ?? 0
  const completedCampaigns = campaigns?.filter(e => e.status === 'completed').length ?? 0
  const totalBudget = campaigns?.reduce((sum, e) => sum + (Number(e.budget) || 0), 0) ?? 0

  const totalDeliverables = deliverables?.length ?? 0
  const completedDeliverables = deliverables?.filter(t => t.status === 'completed').length ?? 0
  const pendingDeliverables = deliverables?.filter(t => t.status === 'pending').length ?? 0
  const overdueDeliverables = deliverables?.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()).length ?? 0

  const totalCreators = creators?.length ?? 0
  const deliveryRate = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0

  const stats = [
    { label: 'Total Campaigns', value: totalCampaigns, sub: `${activeCampaigns} active, ${completedCampaigns} completed`, borderColor: 'bg-brand' },
    { label: 'Total Budget', value: `R${totalBudget.toLocaleString('en-ZA')}`, sub: 'Across all campaigns', borderColor: 'bg-[#3399db]' },
    { label: 'Delivery Rate', value: `${deliveryRate}%`, sub: `${completedDeliverables}/${totalDeliverables} deliverables done`, borderColor: 'bg-[#33c759]' },
    { label: 'Creators', value: totalCreators, sub: 'In your roster', borderColor: 'bg-[#f5a624]' },
  ]

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center border-b border-[#e5e5eb]">
        <h1 className="text-xl font-bold text-[#1a1a1f]">Analytics</h1>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, sub, borderColor }) => (
            <div key={label} className="bg-white rounded-lg p-5 flex items-start gap-3">
              <div className={`${borderColor} w-1.5 rounded-full self-stretch`} />
              <div>
                <p className="text-xs text-[#80808c]">{label}</p>
                <p className="text-2xl font-bold text-[#1a1a1f] leading-tight">{value}</p>
                <p className="text-[11px] text-[#80808c] mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-5">
            <h2 className="font-semibold text-[#1a1a1f] text-sm mb-4">Deliverable Status</h2>
            <div className="space-y-3">
              {[
                { label: 'Pending', count: pendingDeliverables, color: 'bg-[#f5a624]' },
                { label: 'Delivered', count: completedDeliverables, color: 'bg-[#33c759]' },
                { label: 'Overdue', count: overdueDeliverables, color: 'bg-[#d94536]' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[13px] text-[#26262e]">{label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-[#ededf2] rounded-full h-2">
                      <div className={`${color} h-2 rounded-full`} style={{ width: `${totalDeliverables > 0 ? (count / totalDeliverables) * 100 : 0}%` }} />
                    </div>
                    <span className="text-[13px] font-semibold text-[#1a1a1f] w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-5">
            <h2 className="font-semibold text-[#1a1a1f] text-sm mb-4">Campaign Status</h2>
            <div className="space-y-3">
              {[
                { status: 'draft', color: 'bg-[#a6a6b2]' },
                { status: 'planning', color: 'bg-[#3399db]' },
                { status: 'active', color: 'bg-[#33c759]' },
                { status: 'completed', color: 'bg-purple-500' },
                { status: 'cancelled', color: 'bg-[#d94536]' },
              ].map(({ status, color }) => {
                const count = campaigns?.filter(e => e.status === status).length ?? 0
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#26262e] capitalize">{status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-[#ededf2] rounded-full h-2">
                        <div className={`${color} h-2 rounded-full`} style={{ width: `${totalCampaigns > 0 ? (count / totalCampaigns) * 100 : 0}%` }} />
                      </div>
                      <span className="text-[13px] font-semibold text-[#1a1a1f] w-8 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
