'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [orgForm, setOrgForm] = useState({ name: '', email: '', phone: '', website: '' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (p) {
        setProfile(p)
        setForm({ full_name: p.full_name ?? '', email: p.email ?? user.email ?? '', phone: p.phone ?? '' })

        if (p.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', p.organization_id)
            .single()
          if (org) {
            setOrganization(org)
            setOrgForm({ name: org.name ?? '', email: org.email ?? '', phone: org.phone ?? '', website: org.website ?? '' })
          }
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', profile.id)

    if (error) alert(error.message)
    setSaving(false)
  }

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return
    setSaving(true)

    const { error } = await supabase
      .from('organizations')
      .update(orgForm)
      .eq('id', organization.id)

    if (error) alert(error.message)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and organization</p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-dark mb-4">Your Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-dark mb-1.5">Full Name</label>
            <input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Email</label>
            <input
              value={form.email}
              disabled
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Phone</label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. 082 123 4567"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 bg-brand hover:bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Organization */}
      {organization && (
        <form onSubmit={handleSaveOrg} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark">Organization</h2>
            <span className="text-xs font-semibold text-brand bg-brand-muted px-2.5 py-1 rounded-full capitalize">
              {organization.subscription_tier} plan
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">Organization Name</label>
              <input
                value={orgForm.name}
                onChange={e => setOrgForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Business Email</label>
              <input
                type="email"
                value={orgForm.email}
                onChange={e => setOrgForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Business Phone</label>
              <input
                value={orgForm.phone}
                onChange={e => setOrgForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark mb-1.5">Website</label>
              <input
                type="url"
                value={orgForm.website}
                onChange={e => setOrgForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-brand hover:bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Organization'}
          </button>
        </form>
      )}

      {/* Subscription Info */}
      {organization && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-dark mb-4">Subscription</h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="text-lg font-bold text-dark capitalize">{organization.subscription_tier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-bold text-dark capitalize">{organization.subscription_status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
