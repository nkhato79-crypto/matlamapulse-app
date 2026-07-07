import { createClient } from '@/lib/supabase/server'
import { CheckSquare, Circle } from 'lucide-react'

export default async function TasksPage() {
  const supabase = createClient()
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, events(name)')
    .order('due_date', { ascending: true })

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high:   'bg-orange-100 text-orange-700',
    medium: 'bg-blue-100 text-blue-700',
    low:    'bg-gray-100 text-gray-600',
  }

  const pending   = tasks?.filter(t => t.status === 'pending') ?? []
  const inProgress = tasks?.filter(t => t.status === 'in_progress') ?? []
  const completed = tasks?.filter(t => t.status === 'completed') ?? []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">
            {completed.length}/{tasks?.length ?? 0} completed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {tasks && tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark">Overall Progress</span>
            <span className="text-sm font-bold text-brand">
              {Math.round((completed.length / tasks.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-brand h-2 rounded-full transition-all"
              style={{ width: `${(completed.length / tasks.length) * 100}%` }}
            />
          </div>
          <div className="flex gap-6 mt-3 text-xs text-gray-500">
            <span>{pending.length} pending</span>
            <span>{inProgress.length} in progress</span>
            <span>{completed.length} completed</span>
          </div>
        </div>
      )}

      {!tasks || tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20 text-center">
          <CheckSquare size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-dark mb-1">No tasks yet</h3>
          <p className="text-gray-500 text-sm">Tasks are created within individual events</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending */}
          {pending.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-dark text-sm">Pending ({pending.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {pending.map(task => (
                  <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50">
                    <Circle size={16} className="text-gray-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark">{task.title}</p>
                      {task.events?.name && (
                        <p className="text-xs text-gray-400 mt-0.5">{task.events.name}</p>
                      )}
                    </div>
                    {task.priority && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(task.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {inProgress.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-dark text-sm">In Progress ({inProgress.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {inProgress.map(task => (
                  <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50">
                    <div className="w-4 h-4 rounded-full border-2 border-brand flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark">{task.title}</p>
                      {task.events?.name && (
                        <p className="text-xs text-gray-400 mt-0.5">{task.events.name}</p>
                      )}
                    </div>
                    {task.priority && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm opacity-70">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-gray-500 text-sm">Completed ({completed.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {completed.map(task => (
                  <div key={task.id} className="flex items-center gap-4 px-5 py-3.5">
                    <CheckSquare size={16} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-gray-400 line-through">{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
