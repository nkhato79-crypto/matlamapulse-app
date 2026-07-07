import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message, context } = await req.json()

  // Fetch user's org context for Pulse
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name')
    .eq('id', user.id)
    .single()

  let orgContext = ''
  if (profile?.organization_id) {
    const [{ data: events }, { data: tasks }, { data: vendors }] = await Promise.all([
      supabase.from('events').select('name, status, event_date').eq('organization_id', profile.organization_id).limit(10),
      supabase.from('tasks').select('title, status, priority').eq('organization_id', profile.organization_id).eq('status', 'pending').limit(10),
      supabase.from('vendors').select('name, category').eq('organization_id', profile.organization_id).limit(10),
    ])
    orgContext = `
Active events: ${JSON.stringify(events)}
Pending tasks: ${JSON.stringify(tasks)}
Vendors: ${JSON.stringify(vendors)}
    `
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: `You are Pulse, an AI assistant built into EventPulse — a vendor coordination platform for South African event planners.
You help event planners manage their events, vendors, tasks and RSVPs.
Be concise, practical and friendly. Use ZAR (Rand) for currency references.
Current user: ${profile?.full_name ?? 'Event Planner'}
${orgContext ? `Current org data:\n${orgContext}` : ''}
Context: ${context ?? 'General assistance'}`,
    messages: [{ role: 'user', content: message }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ reply: text })
}
