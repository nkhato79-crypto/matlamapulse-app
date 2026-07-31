'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Megaphone, Calendar, Users } from 'lucide-react'

type CampaignStatus = 'all' | 'active' | 'planning' | 'draft' | 'completed'

export default function CampaignsPage() {
  const supabase = createClient()
  const [campaigns, setCampaigns] = useState<any[] | null>(null)
  const [filter, setFilter] = useState<CampaignStatus>('all')

  useEffect(() => {
    async function fetchCampaigns() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
      setCampaigns(data)
    }
    fetchCampaigns()
  }, [])

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

  const tabs: CampaignStatus[] = ['all', 'active', 'planning', 'draft', 'completed']

  const filteredCampaigns = campaigns?.filter(e =>
    filter === 'all' ? true : e.status === filter
  )

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center justify-between border-b border-[#e5e5eb]">
        <h1 className="text-xl font-bold text-[#1a1a1f]">Campaigns</h1>
        <Link
          href="/events/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors"
        >
          <Plus size={14} />
          New Campaign
        </Link>
      </div>

      <div className="p-6">
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                filter === tab
                  ? 'bg-brand text-white'
                  : 'bg-white text-[#26262e] hover:bg-[#f7f7fa] border border-[#e5e5eb]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {!filteredCampaigns || filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-lg py-20 text-center">
            <Megaphone size={40} className="text-[#ededf2] mx-auto mb-4" />
            <h3 className="font-semibold text-[#1a1a1f] mb-1">
              {filter === 'all' ? 'No campaigns yet' : `No ${filter} campaigns`}
            </h3>
            <p className="text-[#80808c] text-[13px] mb-4">
              {filter === 'all' ? 'Create your first brand campaign to get started' : 'No campaigns match this filter'}
            </p>
            {filter === 'all' && (
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-brand-dark transition-colors"
              >
                <Plus size={14} />
                Create Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map(campaign => (
              <Link key={campaign.id} href={`/events/${campaign.id}`}>
                <div className="bg-white rounded-lg hover:shadow-md transition-all p-5 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[#1a1a1f] text-[13px] leading-tight">{campaign.name}</h3>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusBadge(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {campaign.event_date && (
                      <div className="flex items-center gap-2 text-[11px] text-[#80808c]">
                        <Calendar size={11} />
                        {new Date(campaign.event_date).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                    )}
                    {campaign.venue_name && (
                      <div className="flex items-center gap-2 text-[11px] text-[#80808c]">
                        <Megaphone size={11} />
                        {campaign.venue_name}
                      </div>
                    )}
                    {campaign.guest_count > 0 && (
                      <div className="flex items-center gap-2 text-[11px] text-[#80808c]">
                        <Users size={11} />
                        {campaign.guest_count.toLocaleString()} target reach
                      </div>
                    )}
                  </div>
                  {campaign.budget && (
                    <div className="mt-3 pt-3 border-t border-[#ededf2]">
                      <p className="text-[11px] text-[#80808c]">Campaign Budget</p>
                      <p className="text-[13px] font-semibold text-[#1a1a1f]">
                        R{Number(campaign.budget).toLocaleString('en-ZA')}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
