import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptFields, decryptFields } from '@/lib/encryption'

const SENSITIVE_FIELDS = ['phone', 'whatsapp', 'email', 'address'] as const

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 })
  }

  const encrypted = encryptFields(body, [...SENSITIVE_FIELDS])

  const { data, error } = await supabase
    .from('vendors')
    .insert({ ...encrypted, organization_id: profile.organization_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const decrypted = decryptFields(data, [...SENSITIVE_FIELDS])
  return NextResponse.json(decrypted)
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 })
  }

  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('organization_id', profile.organization_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const decrypted = vendors?.map(v => decryptFields(v, [...SENSITIVE_FIELDS])) ?? []
  return NextResponse.json(decrypted)
}
