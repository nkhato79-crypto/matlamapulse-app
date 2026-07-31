'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Lock } from 'lucide-react'
import { PLAN_FEATURES, type PlanTier } from '@/lib/plans'

const allTabs = ['Overview', 'Creators', 'Deliverables', 'Timeline', 'Approval']

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [creators, setCreators] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState<PlanTier>('standard')

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
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
          if (org?.subscription_tier) setTier(org.subscription_tier as PlanTier)
        }
      }

      const { data: campaignData } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!campaignData) {
        router.push('/events')
        return
      }

      const [{ data: deliverablesData }, { data: creatorsData }] = await Promise.all([
        supabase.from('tasks').select('*').eq('event_id', params.id).order('due_date', { ascending: true }),
        supabase.from('vendor_assignments').select('*, vendor:vendors(*)').eq('event_id', params.id),
      ])

      setCampaign(campaignData)
      setDeliverables(deliverablesData ?? [])
      setCreators(creatorsData ?? [])
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (loading || !campaign) {
    return (
      <div className="h-16 bg-white border-b border-[#e5e5eb] flex items-center px-8">
        <p className="text-[14px] text-[#80808c]">Loading...</p>
      </div>
    )
  }

  const completedDeliverables = deliverables.filter(t => t.status === 'completed').length
  const totalDeliverables = deliverables.length
  const deliverablePercent = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0
  const totalSpent = creators.reduce((sum: number, v: any) => sum + (Number(v.agreed_amount) || 0), 0)
  const daysToGo = campaign.event_date
    ? Math.max(0, Math.ceil((new Date(campaign.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':    return 'bg-[rgba(51,199,89,0.15)] text-[#33c759]'
      case 'planning':  return 'bg-[rgba(51,153,219,0.15)] text-[#3399db]'
      case 'draft':     return 'bg-[rgba(166,166,178,0.15)] text-[#a6a6b2]'
      case 'completed': return 'bg-[rgba(147,51,234,0.15)] text-purple-600'
      case 'cancelled': return 'bg-[rgba(217,69,54,0.15)] text-brand'
      default:          return 'bg-[rgba(166,166,178,0.15)] text-[#a6a6b2]'
    }
  }

  const creatorStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-[rgba(51,199,89,0.15)] text-[#33c759]'
      case 'pending':   return 'bg-[rgba(245,166,36,0.15)] text-[#f5a624]'
      case 'declined':  return 'bg-[rgba(217,69,54,0.15)] text-[#d94536]'
      default:          return 'bg-[rgba(166,166,178,0.15)] text-[#a6a6b2]'
    }
  }

  const deliverableStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':   return 'bg-[rgba(51,199,89,0.15)] text-[#33c759]'
      case 'in_progress': return 'bg-[rgba(51,153,219,0.15)] text-[#3399db]'
      case 'pending':     return 'bg-[rgba(245,166,36,0.15)] text-[#f5a624]'
      case 'cancelled':   return 'bg-[rgba(217,69,54,0.15)] text-[#d94536]'
      default:            return 'bg-[rgba(166,166,178,0.15)] text-[#a6a6b2]'
    }
  }

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center border-b border-[#e5e5eb]">
        <p className="text-[14px] text-[#80808c]">
          <Link href="/events" className="hover:text-[#26262e] transition-colors">Campaigns</Link>
          <span className="mx-2">/</span>
          <span className="text-[#26262e]">{campaign.name}</span>
        </p>
      </div>

      <div className="bg-white px-8 py-4 border-b border-[#e5e5eb]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#1a1a1f]">{campaign.name}</h1>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(campaign.status)}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
            <p className="text-[13px] text-[#80808c]">
              {campaign.event_date
                ? new Date(campaign.event_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Launch date TBD'}
              {campaign.venue_name && <>&nbsp;&nbsp;&bull;&nbsp;&nbsp;{campaign.venue_name}</>}
              {campaign.guest_count > 0 && <>&nbsp;&nbsp;&bull;&nbsp;&nbsp;{campaign.guest_count.toLocaleString()} target reach</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-[#f7f7fa] hover:bg-[#ededf2] text-[#26262e] px-4 py-2 rounded-md text-[13px] font-semibold transition-colors">
              Edit Campaign
            </button>
            <button className="bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-md text-[13px] font-semibold transition-colors">
              Send for Approval
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white px-8 border-b border-[#e5e5eb]">
        <div className="flex gap-8">
          {allTabs.map(tab => {
            const plan = PLAN_FEATURES[tier]
            const locked = (tab === 'Approval' && !plan.hasBrandApproval) || (tab === 'Timeline' && !plan.hasTimeline)

            return (
              <button
                key={tab}
                onClick={() => !locked && setActiveTab(tab)}
                className={`py-3.5 text-[14px] relative transition-colors flex items-center gap-1.5 ${
                  locked
                    ? 'text-[#c5c5ce] cursor-not-allowed'
                    : activeTab === tab
                      ? 'text-brand font-semibold'
                      : 'text-[#80808c] hover:text-[#26262e]'
                }`}
              >
                {tab}
                {locked && <Lock size={11} />}
                {activeTab === tab && !locked && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand rounded-t" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6 flex gap-6">
        <div className="flex-1 min-w-0">
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              {campaign.description && (
                <div className="bg-white rounded-lg p-5">
                  <h3 className="font-semibold text-[#1a1a1f] text-sm mb-2">Campaign Brief</h3>
                  <p className="text-[13px] text-[#26262e] whitespace-pre-wrap">{campaign.description}</p>
                </div>
              )}
              {campaign.notes && (
                <div className="bg-white rounded-lg p-5">
                  <h3 className="font-semibold text-[#1a1a1f] text-sm mb-2">Internal Notes</h3>
                  <p className="text-[13px] text-[#26262e] whitespace-pre-wrap">{campaign.notes}</p>
                </div>
              )}
              {!campaign.description && !campaign.notes && (
                <div className="bg-white rounded-lg py-10 text-center">
                  <p className="text-[#80808c] text-[13px]">No campaign brief yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Creators' && (
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f7f7fa]">
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-6 py-3">Creator</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Niche</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Contact</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Fee</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">
                      <button className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors">
                        + Creator
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ededf2]">
                  {creators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#80808c] text-[13px]">
                        No creators assigned to this campaign yet
                      </td>
                    </tr>
                  ) : (
                    creators.map((assignment: any) => (
                      <tr key={assignment.id} className="hover:bg-[#f7f7fa]/50 transition-colors">
                        <td className="px-6 py-3">
                          <p className="font-semibold text-[#26262e] text-[13px]">
                            {assignment.vendor?.name ?? 'Unknown'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#26262e]">
                          {assignment.vendor?.category ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#26262e]">
                          {assignment.vendor?.phone ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#26262e]">
                          {assignment.agreed_amount
                            ? `R${Number(assignment.agreed_amount).toLocaleString('en-ZA')}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${creatorStatusBadge(assignment.status)}`}>
                            {assignment.status
                              ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)
                              : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/vendors/${assignment.vendor?.id}`}
                            className="text-[11px] text-brand hover:underline font-medium"
                          >
                            View &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Deliverables' && (
            <div className="bg-white rounded-lg overflow-hidden">
              {deliverables.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-[#80808c] text-[13px]">No deliverables yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#ededf2]">
                  {deliverables.map(d => (
                    <div key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-medium ${
                          d.status === 'completed' ? 'text-[#a6a6b2] line-through' : 'text-[#26262e]'
                        }`}>
                          {d.title}
                        </p>
                        {d.due_date && (
                          <p className="text-[11px] text-[#80808c] mt-0.5">
                            Due {new Date(d.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${deliverableStatusBadge(d.status)}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'Timeline' || activeTab === 'Approval') && (
            <div className="bg-white rounded-lg py-10 text-center">
              <p className="text-[#80808c] text-[13px]">{activeTab} coming soon</p>
            </div>
          )}
        </div>

        <div className="w-[264px] flex-shrink-0 space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-[#1a1a1f] text-sm mb-3">Campaign Summary</h3>
            <div className="space-y-2">
              <div className="bg-[#f7f7fa] rounded-md px-4 py-2.5">
                <p className="text-[11px] text-[#80808c]">Days to Launch</p>
                <p className="text-lg font-bold text-[#1a1a1f]">{daysToGo}</p>
              </div>
              <div className="bg-[#f7f7fa] rounded-md px-4 py-2.5">
                <p className="text-[11px] text-[#80808c]">Campaign Budget</p>
                <p className="text-lg font-bold text-[#1a1a1f]">
                  {campaign.budget ? `R${Number(campaign.budget).toLocaleString('en-ZA')}` : 'Not set'}
                </p>
              </div>
              <div className="bg-[#f7f7fa] rounded-md px-4 py-2.5">
                <p className="text-[11px] text-[#80808c]">Creator Fees</p>
                <p className="text-lg font-bold text-[#1a1a1f]">R{totalSpent.toLocaleString('en-ZA')}</p>
              </div>
              <div className="bg-[#f7f7fa] rounded-md px-4 py-2.5">
                <p className="text-[11px] text-[#80808c]">Target Reach</p>
                <p className="text-lg font-bold text-[#1a1a1f]">{campaign.guest_count ? campaign.guest_count.toLocaleString() : '0'}</p>
              </div>
              <div className="bg-[#f7f7fa] rounded-md px-4 py-2.5">
                <p className="text-[11px] text-[#80808c]">Creators in Cluster</p>
                <p className="text-lg font-bold text-[#1a1a1f]">{creators.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-[#1a1a1f] text-[13px] mb-2">Deliverable Progress</h3>
            <div className="bg-[#ededf2] rounded-full h-2 mb-1.5">
              <div
                className="bg-brand rounded-full h-2 transition-all"
                style={{ width: `${deliverablePercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#80808c]">
              {deliverablePercent}% complete ({completedDeliverables}/{totalDeliverables})
            </p>
          </div>

          {PLAN_FEATURES[tier].hasEngageAI ? (
            <div className="bg-[#1a1a1f] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={12} className="text-white" />
                <p className="text-[13px] font-bold text-white">Engage AI</p>
              </div>
              <div className="bg-[#33333d] rounded-md p-3 mb-3">
                <p className="text-[11px] text-[#ccccd9] leading-relaxed">
                  {creators.filter((v: any) => v.status === 'pending').length > 0
                    ? `${creators.filter((v: any) => v.status === 'pending').length} creators haven't confirmed yet. Send reminders?`
                    : 'All creators confirmed. Ready to launch!'}
                </p>
              </div>
              <button className="w-full bg-brand hover:bg-brand-dark rounded py-1.5 text-[11px] text-white/70 transition-colors">
                Ask Engage AI anything...
              </button>
            </div>
          ) : (
            <div className="bg-[#f7f7fa] rounded-lg p-4 text-center">
              <Lock size={16} className="text-[#a6a6b2] mx-auto mb-2" />
              <p className="text-[11px] text-[#80808c]">Engage AI requires the Agency plan</p>
              <Link href="/settings" className="text-[11px] text-brand hover:underline font-medium">
                Upgrade
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
