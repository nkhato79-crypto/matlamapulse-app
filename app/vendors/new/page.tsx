'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCreatorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: '',
    contact_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    address: '',
    city: '',
    notes: '',
    is_preferred: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to add creator')
      setLoading(false)
    } else {
      router.push(`/vendors/${data.id}`)
    }
  }

  const update = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const niches = [
    'Lifestyle', 'Fashion', 'Beauty', 'Tech', 'Food', 'Fitness',
    'Travel', 'Finance', 'Gaming', 'Music', 'Comedy', 'Education',
    'Parenting', 'Health', 'Other',
  ]

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center gap-3 border-b border-[#e5e5eb]">
        <Link href="/vendors" className="text-[#80808c] hover:text-[#26262e] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a1f]">Add Creator</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-dark mb-4">Creator Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">Creator / Handle Name *</label>
              <input
                required
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. @thando_creates"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Niche</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              >
                <option value="">Select niche</option>
                {niches.map(niche => (
                  <option key={niche}>{niche}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Location</label>
              <input
                value={form.city}
                onChange={e => update('city', e.target.value)}
                placeholder="e.g. Johannesburg"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_preferred}
                  onChange={e => update('is_preferred', e.target.checked)}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                Mark as preferred creator
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-dark mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">Full Name</label>
              <input
                value={form.contact_name}
                onChange={e => update('contact_name', e.target.value)}
                placeholder="Creator's real name"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="e.g. 082 123 4567"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => update('whatsapp', e.target.value)}
                placeholder="e.g. +27821234567"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="creator@email.com"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Profile / Portfolio URL</label>
              <input
                type="url"
                value={form.website}
                onChange={e => update('website', e.target.value)}
                placeholder="https://linktr.ee/creator"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">Address</label>
              <input
                value={form.address}
                onChange={e => update('address', e.target.value)}
                placeholder="Street address (for gifting / product drops)"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-dark mb-4">Notes</h2>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Content style, engagement rate, past brand collabs, platform strengths..."
            rows={3}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Link
            href="/vendors"
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? 'Adding...' : 'Add Creator'}
          </button>
        </div>
      </form>
    </div>
  )
}
