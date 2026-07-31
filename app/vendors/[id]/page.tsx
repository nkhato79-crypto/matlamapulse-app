import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Phone, Mail, Globe, MapPin, MessageCircle } from 'lucide-react'

export default async function CreatorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: creator } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!creator) notFound()

  const { data: assignments } = await supabase
    .from('vendor_assignments')
    .select('*, event:events(name, event_date, status)')
    .eq('vendor_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="bg-white px-8 h-16 flex items-center gap-3 border-b border-[#e5e5eb]">
        <Link href="/vendors" className="text-[#80808c] hover:text-[#26262e] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1a1a1f]">{creator.name}</h1>
            {creator.is_preferred && (
              <Star size={16} className="text-amber-400 fill-amber-400" />
            )}
          </div>
        </div>
        {creator.category && (
          <span className="text-[11px] bg-[#f7f7fa] text-[#26262e] px-2.5 py-1 rounded-full font-medium">
            {creator.category}
          </span>
        )}
      </div>

      <div className="p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-dark text-sm mb-4">Contact Information</h2>
            <div className="space-y-3">
              {creator.contact_name && (
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-sm font-medium text-dark">{creator.contact_name}</p>
                </div>
              )}
              {creator.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <a href={`tel:${creator.phone}`} className="text-sm text-brand hover:underline">{creator.phone}</a>
                </div>
              )}
              {creator.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{creator.whatsapp}</span>
                </div>
              )}
              {creator.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <a href={`mailto:${creator.email}`} className="text-sm text-brand hover:underline">{creator.email}</a>
                </div>
              )}
              {creator.website && (
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-gray-400" />
                  <a href={creator.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline truncate">
                    {creator.website}
                  </a>
                </div>
              )}
              {(creator.address || creator.city) && (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5" />
                  <div>
                    {creator.address && <p className="text-sm text-gray-600">{creator.address}</p>}
                    {creator.city && <p className="text-sm text-gray-600">{creator.city}</p>}
                  </div>
                </div>
              )}
            </div>

            {creator.rating && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Performance Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={14}
                      className={i <= creator.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                    />
                  ))}
                  <span className="text-sm font-medium text-dark ml-1">{creator.rating}/5</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-dark text-sm">Campaign Assignments</h2>
              <span className="text-xs text-gray-400">{assignments?.length ?? 0} campaigns</span>
            </div>
            {!assignments || assignments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-sm">Not assigned to any campaigns yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-2.5">Campaign</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Launch Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Fee</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assignments.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <Link href={`/events/${a.event_id}`} className="text-sm font-medium text-brand hover:underline">
                          {a.event?.name ?? 'Unknown campaign'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {a.event?.event_date
                          ? new Date(a.event.event_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-dark font-medium">
                        {a.agreed_amount ? `R${Number(a.agreed_amount).toLocaleString('en-ZA')}` : a.quoted_amount ? `R${Number(a.quoted_amount).toLocaleString('en-ZA')} (quoted)` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          a.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          a.status === 'declined' ? 'bg-red-100 text-red-700' :
                          a.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {creator.notes && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-6">
            <h2 className="font-semibold text-dark text-sm mb-2">Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{creator.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
