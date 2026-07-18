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

  const statusColors: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    planning:  'bg-blue-100 text-blue-700',
    draft:     'bg-gray-100 text-gray-600',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const tabs: EventStatus[] = ['all', 'active', 'planning', 'draft', 'completed']

  const filteredEvents = events?.filter(e =>
    filter === 'all' ? true : e.status === filter
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Events</h1>
          <p className="text-gray-500 text-sm mt-1">{events?.length ?? 0} total events</p>
        </div>
        <Link
          href="/events/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={15} />
          New Event
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab
                ? 'bg-brand text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {!filteredEvents || filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20 text-center">
          <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-dark mb-1">
            {filter === 'all' ? 'No events yet' : `No ${filter} events`}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {filter === 'all' ? 'Create your first event to get started' : 'No events match this filter'}
          </p>
          {filter === 'all' && (
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              <Plus size={15} />
              Create Event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map(event => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-dark text-sm leading-tight">{event.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusColors[event.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {event.event_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={12} />
                      {new Date(event.event_date).toLocaleDateString('en-ZA', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>
                  )}
                  {event.venue_name && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={12} />
                      {event.venue_name}
                    </div>
                  )}
                  {event.guest_count > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users size={12} />
                      {event.guest_count} guests
                    </div>
                  )}
                </div>
                {event.budget && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-sm font-semibold text-dark">
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
  )
}
