import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { data: campaigns },
    { data: creators },
    { data: deliverables },
    { data: creatorAssignments },
  ] = await Promise.all([
    supabase.from('events').select('*').order('event_date', { ascending: true }).limit(10),
    supabase.from('vendors').select('id'),
    supabase.from('tasks').select('*'),
    supabase.from('vendor_assignments').select('event_id'),
  ])

  const activeCampaigns = campaigns?.filter(e => e.status === 'active').length ?? 0
  const totalCreators = creators?.length ?? 0
  const completedDeliverables = deliverables?.filter(t => t.status === 'completed').length ?? 0
  const pendingDeliverables = deliverables?.filter(t => t.status === 'pending').length ?? 0

  const clusterCountMap: Record<string, number> = {}
  creatorAssignments?.forEach(va => {
    clusterCountMap[va.event_id] = (clusterCountMap[va.event_id] || 0) + 1
  })

  const stats = [
    { label: 'Active Campaigns',  value: activeCampaigns,      borderColor: 'bg-brand' },
    { label: 'Total Creators',    value: totalCreators,         borderColor: 'bg-[#3399db]' },
    { label: 'Delivered',         value: completedDeliverables, borderColor: 'bg-[#33c759]' },
    { label: 'Pending',           value: pendingDeliverables,   borderColor: 'bg-[#f5a624]' },
  ]

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

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center justify-between border-b border-[#e5e5eb]">
        <h1 className="text-xl font-bold text-[#1a1a1f]">Dashboard</h1>
        <Link
          href="/events/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors"
        >
          <Plus size={14} />
          New Campaign
        </Link>
      </div>

      <div className="p-6 flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, borderColor }) => (
              <div key={label} className="bg-white rounded-lg p-5 flex items-start gap-3">
                <div className={`${borderColor} w-1.5 rounded-full self-stretch`} />
                <div>
                  <p className="text-xs text-[#80808c]">{label}</p>
                  <p className="text-[32px] font-bold text-[#1a1a1f] leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf2]">
              <h2 className="font-semibold text-[#1a1a1f] text-sm">Recent Campaigns</h2>
              <Link href="/events" className="text-[13px] text-brand hover:underline font-medium">View all</Link>
            </div>

            {!campaigns || campaigns.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[#80808c] text-sm">No campaigns yet</p>
                <Link href="/events/new" className="text-brand text-sm hover:underline mt-1 inline-block">
                  Create your first campaign
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f7f7fa]">
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-6 py-3">Campaign</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Launch Date</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Brand</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Target Reach</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Creators</th>
                    <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ededf2]">
                  {campaigns.map(campaign => (
                    <tr key={campaign.id} className="hover:bg-[#f7f7fa]/50 transition-colors">
                      <td className="px-6 py-3">
                        <p className="font-semibold text-[#26262e] text-[13px]">{campaign.name}</p>
                        {campaign.event_type && (
                          <p className="text-[11px] text-[#80808c] mt-0.5">{campaign.event_type}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#26262e]">
                        {campaign.event_date
                          ? new Date(campaign.event_date).toLocaleDateString('en-ZA', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#26262e]">{campaign.venue_name ?? '—'}</td>
                      <td className="px-4 py-3 text-[13px] text-[#26262e]">{campaign.guest_count ? `${(campaign.guest_count).toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3 text-[13px] text-[#26262e]">{clusterCountMap[campaign.id] ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadge(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/events/${campaign.id}`} className="text-[11px] text-brand hover:underline font-medium">
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="w-[264px] flex-shrink-0">
          <div className="bg-white rounded-lg p-5">
            <h3 className="font-semibold text-[#1a1a1f] text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/vendors/new"
                className="block w-full bg-brand hover:bg-brand-dark text-white text-center py-2.5 rounded-md text-[13px] font-semibold transition-colors"
              >
                + Add Creator
              </Link>
              <Link
                href="/tasks"
                className="block w-full bg-[#f7f7fa] hover:bg-[#ededf2] text-[#26262e] text-center py-2.5 rounded-md text-[13px] font-semibold transition-colors"
              >
                + New Deliverable
              </Link>
              <Link
                href="/events/new"
                className="block w-full bg-[#f7f7fa] hover:bg-[#ededf2] text-[#26262e] text-center py-2.5 rounded-md text-[13px] font-semibold transition-colors"
              >
                + Launch Campaign
              </Link>
              <Link
                href="/reports"
                className="block w-full bg-[#f7f7fa] hover:bg-[#ededf2] text-[#26262e] text-center py-2.5 rounded-md text-[13px] font-semibold transition-colors"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
