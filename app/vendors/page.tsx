'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Star, Phone, Mail, Users, Instagram, Youtube } from 'lucide-react'

export default function CreatorsPage() {
  const supabase = createClient()
  const [creators, setCreators] = useState<any[] | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchCreators() {
      const { data } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true })
      setCreators(data)
    }
    fetchCreators()
  }, [])

  const niches = Array.from(new Set(creators?.map((c: any) => c.category).filter(Boolean) ?? []))

  const filteredCreators = creators?.filter(c =>
    filter === 'all' ? true : c.category === filter
  )

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center justify-between border-b border-[#e5e5eb]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#1a1a1f]">Creators</h1>
          <span className="text-[13px] text-[#80808c]">{creators?.length ?? 0} total</span>
        </div>
        <Link
          href="/vendors/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors"
        >
          <Plus size={14} />
          Add Creator
        </Link>
      </div>

      <div className="p-6">
        {niches.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-brand text-white'
                  : 'bg-white text-[#26262e] hover:bg-[#f7f7fa] border border-[#e5e5eb]'
              }`}
            >
              All
            </button>
            {niches.map(niche => (
              <button
                key={niche}
                onClick={() => setFilter(niche)}
                className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  filter === niche
                    ? 'bg-brand text-white'
                    : 'bg-white text-[#26262e] hover:bg-[#f7f7fa] border border-[#e5e5eb]'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        )}

        {!filteredCreators || filteredCreators.length === 0 ? (
          <div className="bg-white rounded-lg py-20 text-center">
            <Users size={40} className="text-[#ededf2] mx-auto mb-4" />
            <h3 className="font-semibold text-[#1a1a1f] mb-1">
              {filter === 'all' ? 'No creators yet' : `No creators in "${filter}"`}
            </h3>
            <p className="text-[#80808c] text-[13px] mb-4">
              {filter === 'all' ? 'Add creators to your roster to assign them to campaigns' : 'No creators match this niche'}
            </p>
            {filter === 'all' && (
              <Link
                href="/vendors/new"
                className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-brand-dark transition-colors"
              >
                <Plus size={14} />
                Add Creator
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f7f7fa]">
                  <th className="text-left text-[11px] font-semibold text-[#80808c] px-6 py-3">Creator</th>
                  <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Niche</th>
                  <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Contact</th>
                  <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Rating</th>
                  <th className="text-left text-[11px] font-semibold text-[#80808c] px-4 py-3">Location</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ededf2]">
                {filteredCreators.map(creator => (
                  <tr key={creator.id} className="hover:bg-[#f7f7fa]/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#26262e] text-[13px]">{creator.name}</p>
                        {creator.is_preferred && (
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      {creator.contact_name && (
                        <p className="text-[11px] text-[#80808c] mt-0.5">{creator.contact_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {creator.category && (
                        <span className="text-[11px] bg-[#f7f7fa] text-[#26262e] px-2.5 py-1 rounded-full font-medium">
                          {creator.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {creator.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#80808c]">
                            <Phone size={10} />
                            {creator.phone}
                          </div>
                        )}
                        {creator.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#80808c]">
                            <Mail size={10} />
                            {creator.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {creator.rating ? (
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-[13px] font-medium text-[#1a1a1f]">{creator.rating}</span>
                        </div>
                      ) : <span className="text-[#a6a6b2]">&mdash;</span>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#26262e]">{creator.city ?? <span className="text-[#a6a6b2]">&mdash;</span>}</td>
                    <td className="px-4 py-3">
                      <Link href={`/vendors/${creator.id}`} className="text-[11px] text-brand hover:underline font-medium">
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
