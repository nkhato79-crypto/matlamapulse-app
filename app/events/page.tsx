'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Calendar, MapPin, Users } from 'lucide-react'

type EventStatus = 'all' | 'active' | 'planning' | 'draft' | 'completed'

export default function EventsPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<any[] | null>(null)
  const [filter, setFilter] = useState<EventStatus>('all')

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
      setEvents(data)
    }
    fetchEvents()
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

  const tabs: EventStatus[] = ['all', 'active', 'planning', 'draft', 'completed']

  const filteredEvents = events?.filter(e =>
    filter === 'all' ? true : e.status === filter
  )

  return (
    <div>
      {/* Top header bar */}
      <div className="bg-white px-8 h-16 flex items-center justify-between border-b border-[#e5e5eb]">
        <h1 className="text-xl font-bold text-[#1a1a1f]">Events</h1>
        <Link
          href="/events/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors"
        >
          <Plus size={14} />
          New Event
        </Link>
      </div>

      <div className="p-6">
        {/* Filter tabs */}
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

        {!filteredEvents || filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg py-20 text-center">
            <Calendar size={40} className="text-[#ededf2] mx-auto mb-4" />
            <h3 className="font-semibold text-[#1a1a1f] mb-1">
              {filter === 'all' ? 'No events yet' : `No ${filter} events`}
            </h3>
            <p className="text-[#80808c] text-[13px] mb-4">
              {filter === 'all' ? 'Create your first event to get started' : 'No events match this filter'}
            </p>
            {filter === 'all' && (
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-brand-dark transition-colors"
              >
                <Plus size={14} />
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map(event => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="bg-white rounded-lg hover:shadow-md transition-all p-5 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[#1a1a1f] text-[13px] leading-tight">{event.name}</h3>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusBadge(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {event.event_date && (
                      <div className="flex items-center gap-2 text-[11px] text-[#80808c]">
                        <Calendar size={11} />
                        {new Date(event.event_date).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                    )}
                    {event.venue_name && (
                      <div className="flex items-center gap-2 text-[11px] text-[#80808c]">
                        <MapPin size={11} />
                        {event.venue_name}
                      </div>
                    )}
                    {event.guest_count > 0 && (
                      <div className="flex items-center gap-2 text-[11px] text-[#80808c]">
                        <Users size={11} />
                        {event.guest_count} guests
                      </div>
                    )}
                  </div>
                  {event.budget && (
                    <div className="mt-3 pt-3 border-t border-[#ededf2]">
                      <p className="text-[11px] text-[#80808c]">Budget</p>
                      <p className="text-[13px] font-semibold text-[#1a1a1f]">
                        R{Number(event.budget).toLocaleString('en-ZA')}
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
