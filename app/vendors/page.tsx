'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Star, Phone, Mail } from 'lucide-react'

export default function VendorsPage() {
  const supabase = createClient()
  const [vendors, setVendors] = useState<any[] | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchVendors() {
      const { data } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true })
      setVendors(data)
    }
    fetchVendors()
  }, [])

  const categories = Array.from(new Set(vendors?.map((v: any) => v.category).filter(Boolean) ?? []))

  const filteredVendors = vendors?.filter(v =>
    filter === 'all' ? true : v.category === filter
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Vendors</h1>
          <p className="text-gray-500 text-sm mt-1">{vendors?.length ?? 0} vendors in your database</p>
        </div>
        <Link
          href="/vendors/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={15} />
          Add Vendor
        </Link>
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-brand text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {!filteredVendors || filteredVendors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20 text-center">
          <Star size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-dark mb-1">
            {filter === 'all' ? 'No vendors yet' : `No vendors in "${filter}"`}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {filter === 'all' ? 'Add vendors to your database to assign them to events' : 'No vendors match this category'}
          </p>
          {filter === 'all' && (
            <Link
              href="/vendors/new"
              className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              <Plus size={15} />
              Add Vendor
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Vendor</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Rating</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">City</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVendors.map(vendor => (
                <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-dark text-sm">{vendor.name}</p>
                      {vendor.is_preferred && (
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    {vendor.contact_name && (
                      <p className="text-xs text-gray-400 mt-0.5">{vendor.contact_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {vendor.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                        {vendor.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {vendor.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone size={10} />
                          {vendor.phone}
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail size={10} />
                          {vendor.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {vendor.rating ? (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-dark">{vendor.rating}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{vendor.city ?? '—'}</td>
                  <td className="px-4 py-4">
                    <Link href={`/vendors/${vendor.id}`} className="text-xs text-brand hover:underline font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
