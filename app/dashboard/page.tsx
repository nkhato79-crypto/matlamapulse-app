import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, CheckSquare, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { data: events },
    { data: vendors },
    { data: tasks },
  ] = await Promise.all([
    supabase.from('events').select('*').order('event_date', { ascending: true }).limit(10),
    supabase.from('vendors').select('id'),
    supabase.from('tasks').select('*'),
  ])

  const activeEvents = events?.filter(e => e.status === 'active').length ?? 0
  const totalVendors = vendors?.length ?? 0
  const completedTasks = tasks?.filter(t => t.status === 'completed').length ?? 0
  const pendingTasks = tasks?.filter(t => t.status === 'pending').length ?? 0

  const stats = [
    { label: 'Active Events',     value: activeEvents,    icon: Calendar,    color: 'bg-brand' },
    { label: 'Total Vendors',     value: totalVendors,    icon: Users,       color: 'bg-blue-500' },
    { label: 'Tasks Completed',   value: completedTasks,  icon: CheckSquare, color: 'bg-green-500' },
    { label: 'Pending Tasks',     value: pendingTasks,    icon: Clock,       color: 'bg-amber-500' },
  ]

  const statusColors: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    planning:  'bg-blue-100 text-blue-700',
    draft:     'bg-gray-100 text-gray-600',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back — here's what's happening</p>
        </div>
        <Link
          href="/events/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={15} />
          New Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className={`${color} w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Events table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-dark">Recent Events</h2>
          <Link href="/events" className="text-sm text-brand hover:underline">View all</Link>
        </div>

        {!events || events.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No events yet</p>
            <Link href="/events/new" className="text-brand text-sm hover:underline mt-1 inline-block">
              Create your first event
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Event</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Venue</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Guests</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-dark text-sm">{event.name}</p>
                    {event.event_type && (
                      <p className="text-xs text-gray-400 mt-0.5">{event.event_type}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{event.venue_name ?? '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{event.guest_count ?? '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[event.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/events/${event.id}`} className="text-xs text-brand hover:underline font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
