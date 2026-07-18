import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react'

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const [{ data: tasks }, { data: vendors }] = await Promise.all([
    supabase.from('tasks').select('*').eq('event_id', params.id).order('due_date', { ascending: true }),
    supabase
      .from('vendor_assignments')
      .select('*, vendor:vendors(*)')
      .eq('event_id', params.id),
  ])

  const statusColors: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    planning:  'bg-blue-100 text-blue-700',
    draft:     'bg-gray-100 text-gray-600',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const taskStatusColors: Record<string, string> = {
    pending:     'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
  }

  const completedTasks = tasks?.filter(t => t.status === 'completed').length ?? 0
  const totalTasks = tasks?.length ?? 0

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/events" className="text-gray-400 hover:text-dark">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-dark">{event.name}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[event.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
          {event.event_type && (
            <p className="text-gray-500 text-sm mt-0.5">{event.event_type}</p>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Calendar size={14} />
            <span className="text-xs font-medium">Date</span>
          </div>
          <p className="text-sm font-semibold text-dark">
            {event.event_date
              ? new Date(event.event_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Not set'}
          </p>
          {event.event_time && (
            <p className="text-xs text-gray-500 mt-0.5">{event.event_time}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <MapPin size={14} />
            <span className="text-xs font-medium">Venue</span>
          </div>
          <p className="text-sm font-semibold text-dark">{event.venue_name ?? 'Not set'}</p>
          {event.venue_city && (
            <p className="text-xs text-gray-500 mt-0.5">{event.venue_city}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Users size={14} />
            <span className="text-xs font-medium">Guests</span>
          </div>
          <p className="text-sm font-semibold text-dark">{event.guest_count || 'Not set'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <DollarSign size={14} />
            <span className="text-xs font-medium">Budget</span>
          </div>
          <p className="text-sm font-semibold text-dark">
            {event.budget ? `R${Number(event.budget).toLocaleString('en-ZA')}` : 'Not set'}
          </p>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-dark text-sm mb-2">Description</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-dark text-sm">Tasks</h2>
            <span className="text-xs text-gray-400">{completedTasks}/{totalTasks} done</span>
          </div>
          {!tasks || tasks.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm">No tasks yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-dark'}`}>
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(task.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${taskStatusColors[task.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vendors */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-dark text-sm">Assigned Vendors</h2>
            <span className="text-xs text-gray-400">{vendors?.length ?? 0} vendors</span>
          </div>
          {!vendors || vendors.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm">No vendors assigned</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {vendors.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark">{assignment.vendor?.name ?? 'Unknown vendor'}</p>
                    {assignment.vendor?.category && (
                      <p className="text-xs text-gray-400 mt-0.5">{assignment.vendor.category}</p>
                    )}
                  </div>
                  {assignment.agreed_amount && (
                    <span className="text-xs font-medium text-dark">
                      R{Number(assignment.agreed_amount).toLocaleString('en-ZA')}
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    assignment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    assignment.status === 'declined' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {event.notes && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-6">
          <h2 className="font-semibold text-dark text-sm mb-2">Notes</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.notes}</p>
        </div>
      )}
    </div>
  )
}
