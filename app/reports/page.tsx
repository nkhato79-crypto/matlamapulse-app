import { createClient } from '@/lib/supabase/server'
import { BarChart2, Calendar, Users, DollarSign } from 'lucide-react'

export default async function ReportsPage() {
  const supabase = createClient()

  const [{ data: events }, { data: tasks }, { data: vendors }] = await Promise.all([
    supabase.from('events').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('vendors').select('id'),
  ])

  const totalEvents = events?.length ?? 0
  const activeEvents = events?.filter(e => e.status === 'active').length ?? 0
  const completedEvents = events?.filter(e => e.status === 'completed').length ?? 0
  const totalBudget = events?.reduce((sum, e) => sum + (Number(e.budget) || 0), 0) ?? 0

  const totalTasks = tasks?.length ?? 0
  const completedTasks = tasks?.filter(t => t.status === 'completed').length ?? 0
  const pendingTasks = tasks?.filter(t => t.status === 'pending').length ?? 0
  const overdueTasks = tasks?.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()).length ?? 0

  const totalVendors = vendors?.length ?? 0

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your organization's activity</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Calendar size={14} />
            <span className="text-xs font-medium">Total Events</span>
          </div>
          <p className="text-2xl font-bold text-dark">{totalEvents}</p>
          <p className="text-xs text-gray-400 mt-1">{activeEvents} active, {completedEvents} completed</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign size={14} />
            <span className="text-xs font-medium">Total Budget</span>
          </div>
          <p className="text-2xl font-bold text-dark">R{totalBudget.toLocaleString('en-ZA')}</p>
          <p className="text-xs text-gray-400 mt-1">Across all events</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <BarChart2 size={14} />
            <span className="text-xs font-medium">Task Completion</span>
          </div>
          <p className="text-2xl font-bold text-dark">{taskCompletionRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{completedTasks}/{totalTasks} tasks done</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users size={14} />
            <span className="text-xs font-medium">Vendors</span>
          </div>
          <p className="text-2xl font-bold text-dark">{totalVendors}</p>
          <p className="text-xs text-gray-400 mt-1">In your database</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-dark text-sm mb-4">Task Status Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-100 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium text-dark w-8 text-right">{pendingTasks}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium text-dark w-8 text-right">{completedTasks}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium text-dark w-8 text-right">{overdueTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-dark text-sm mb-4">Event Status</h2>
          <div className="space-y-3">
            {['draft', 'planning', 'active', 'completed', 'cancelled'].map(status => {
              const count = events?.filter(e => e.status === status).length ?? 0
              const colors: Record<string, string> = {
                draft: 'bg-gray-400', planning: 'bg-blue-500', active: 'bg-green-500',
                completed: 'bg-purple-500', cancelled: 'bg-red-500',
              }
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div className={`${colors[status]} h-2 rounded-full`} style={{ width: `${totalEvents > 0 ? (count / totalEvents) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-medium text-dark w-8 text-right">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
