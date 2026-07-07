import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Calendar, MapPin, Users } from 'lucide-react'

export default async function EventsPage() {
  const supabase = createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  const statusColors: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    planning:  'bg-blue-100 text-blue-700',
    draft:     'bg-gray-100 text-gray-600',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  }

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
        {['All', 'Active', 'Planning', 'Draft', 'Completed'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'All'
                ? 'bg-brand text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20 text-center">
          <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-dark mb-1">No events yet</h3>
          <p className="text-gray-500 text-sm mb-4">Create your first event to get started</p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors"
          >
            <Plus size={15} />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {events.map(event => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-dark text-sm leading-tight">{event.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusColors[event.status]}`}>
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
