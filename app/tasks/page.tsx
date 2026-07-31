import { createClient } from '@/lib/supabase/server'
import { CheckSquare, Circle } from 'lucide-react'

export default async function DeliverablesPage() {
  const supabase = createClient()
  const { data: deliverables } = await supabase
    .from('tasks')
    .select('*, events(name)')
    .order('due_date', { ascending: true })

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high:   'bg-orange-100 text-orange-700',
    medium: 'bg-blue-100 text-blue-700',
    low:    'bg-gray-100 text-gray-600',
  }

  const pending    = deliverables?.filter(t => t.status === 'pending') ?? []
  const inProgress = deliverables?.filter(t => t.status === 'in_progress') ?? []
  const completed  = deliverables?.filter(t => t.status === 'completed') ?? []

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center justify-between border-b border-[#e5e5eb]">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1f]">Deliverables</h1>
        </div>
        <span className="text-[13px] text-[#80808c]">
          {completed.length}/{deliverables?.length ?? 0} completed
        </span>
      </div>

      <div className="p-6">
        {deliverables && deliverables.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-dark">Overall Progress</span>
              <span className="text-sm font-bold text-brand">
                {Math.round((completed.length / deliverables.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-brand h-2 rounded-full transition-all"
                style={{ width: `${(completed.length / deliverables.length) * 100}%` }}
              />
            </div>
            <div className="flex gap-6 mt-3 text-xs text-gray-500">
              <span>{pending.length} pending</span>
              <span>{inProgress.length} in progress</span>
              <span>{completed.length} delivered</span>
            </div>
          </div>
        )}

        {!deliverables || deliverables.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20 text-center">
            <CheckSquare size={40} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-dark mb-1">No deliverables yet</h3>
            <p className="text-gray-500 text-sm">Deliverables are created within individual campaigns</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h2 className="font-semibold text-dark text-sm">Pending ({pending.length})</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {pending.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50">
                      <Circle size={16} className="text-gray-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark">{item.title}</p>
                        {item.events?.name && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.events.name}</p>
                        )}
                      </div>
                      {item.priority && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                      )}
                      {item.due_date && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(item.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inProgress.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h2 className="font-semibold text-dark text-sm">In Progress ({inProgress.length})</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {inProgress.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50">
                      <div className="w-4 h-4 rounded-full border-2 border-brand flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark">{item.title}</p>
                        {item.events?.name && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.events.name}</p>
                        )}
                      </div>
                      {item.priority && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm opacity-70">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-500 text-sm">Delivered ({completed.length})</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {completed.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                      <CheckSquare size={16} className="text-green-500 flex-shrink-0" />
                      <p className="text-sm text-gray-400 line-through">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
