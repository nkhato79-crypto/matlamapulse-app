'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCampaignPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    event_type: '',
    event_date: '',
    event_time: '',
    end_date: '',
    venue_name: '',
    venue_address: '',
    venue_city: '',
    guest_count: '',
    budget: '',
    description: '',
    notes: '',
    status: 'draft',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/register'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      alert('No organization found. Please complete your profile setup.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.from('events').insert({
      ...form,
      organization_id: profile.organization_id,
      created_by: user.id,
      guest_count: form.guest_count ? parseInt(form.guest_count) : 0,
      budget: form.budget ? parseFloat(form.budget) : null,
      event_date: form.event_date || null,
      end_date: form.end_date || null,
      event_time: form.event_time || null,
    }).select().single()

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      router.push(`/events/${data.id}`)
    }
  }

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center gap-3 border-b border-[#e5e5eb]">
        <Link href="/events" className="text-[#80808c] hover:text-[#26262e] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a1f]">New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-dark mb-4">Campaign Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">Campaign Name *</label>
              <input
                required
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Summer Skincare Push — GlowCo"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Campaign Type</label>
              <select
                value={form.event_type}
                onChange={e => update('event_type', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              >
                <option value="">Select type</option>
                <option>Product Launch</option>
                <option>Brand Awareness</option>
                <option>Affiliate / CPA</option>
                <option>UGC Content</option>
                <option>Seasonal Promo</option>
                <option>Event Coverage</option>
                <option>Always-On</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => update('status', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              >
                <option value="draft">Draft</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Launch Date</label>
              <input
                type="date"
                value={form.event_date}
                onChange={e => update('event_date', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Post Time</label>
              <input
                type="time"
                value={form.event_time}
                onChange={e => update('event_time', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => update('end_date', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-dark mb-4">Brand Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">Brand Name</label>
              <input
                value={form.venue_name}
                onChange={e => update('venue_name', e.target.value)}
                placeholder="e.g. GlowCo Skincare"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Brand Website</label>
              <input
                value={form.venue_address}
                onChange={e => update('venue_address', e.target.value)}
                placeholder="https://glowco.co.za"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Industry</label>
              <input
                value={form.venue_city}
                onChange={e => update('venue_city', e.target.value)}
                placeholder="e.g. Beauty & Skincare"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-dark mb-4">Budget & Reach</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Campaign Budget (ZAR)</label>
              <input
                type="number"
                value={form.budget}
                onChange={e => update('budget', e.target.value)}
                placeholder="e.g. 25000"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Target Reach</label>
              <input
                type="number"
                value={form.guest_count}
                onChange={e => update('guest_count', e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">Campaign Brief</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe the campaign goals, key messages, and deliverables expected from creators"
                rows={3}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/events"
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  )
}
