import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Phone, Mail, Globe, MapPin, MessageCircle } from 'lucide-react'

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!vendor) notFound()

  const { data: assignments } = await supabase
    .from('vendor_assignments')
    .select('*, event:events(name, event_date, status)')
    .eq('vendor_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/vendors" className="text-gray-400 hover:text-dark">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-dark">{vendor.name}</h1>
            {vendor.is_preferred && (
              <Star size={16} className="text-amber-400 fill-amber-400" />
            )}
          </div>
          {vendor.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium mt-1 inline-block">
              {vendor.category}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-dark text-sm mb-4">Contact Information</h2>
          <div className="space-y-3">
            {vendor.contact_name && (
              <div>
                <p className="text-xs text-gray-400">Contact Person</p>
                <p className="text-sm font-medium text-dark">{vendor.contact_name}</p>
              </div>
            )}
            {vendor.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <a href={`tel:${vendor.phone}`} className="text-sm text-brand hover:underline">{vendor.phone}</a>
              </div>
            )}
            {vendor.whatsapp && (
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">{vendor.whatsapp}</span>
              </div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                <a href={`mailto:${vendor.email}`} className="text-sm text-brand hover:underline">{vendor.email}</a>
              </div>
            )}
            {vendor.website && (
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline truncate">
                  {vendor.website}
                </a>
              </div>
            )}
            {(vendor.address || vendor.city) && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 mt-0.5" />
                <div>
                  {vendor.address && <p className="text-sm text-gray-600">{vendor.address}</p>}
                  {vendor.city && <p className="text-sm text-gray-600">{vendor.city}</p>}
                </div>
              </div>
            )}
          </div>

          {vendor.rating && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={14}
                    className={i <= vendor.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                  />
                ))}
                <span className="text-sm font-medium text-dark ml-1">{vendor.rating}/5</span>
              </div>
            </div>
          )}
        </div>

        {/* Event History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-dark text-sm">Event Assignments</h2>
            <span className="text-xs text-gray-400">{assignments?.length ?? 0} events</span>
          </div>
          {!assignments || assignments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm">Not assigned to any events yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-2.5">Event</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignments.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <Link href={`/events/${a.event_id}`} className="text-sm font-medium text-brand hover:underline">
                        {a.event?.name ?? 'Unknown event'}
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

      {/* Notes */}
      {vendor.notes && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-6">
          <h2 className="font-semibold text-dark text-sm mb-2">Notes</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{vendor.notes}</p>
        </div>
      )}
    </div>
  )
}
