import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message, context } = await req.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name')
    .eq('id', user.id)
    .single()

  let orgContext = ''
  if (profile?.organization_id) {
    const [{ data: campaigns }, { data: deliverables }, { data: creators }] = await Promise.all([
      supabase.from('events').select('name, status, event_date').eq('organization_id', profile.organization_id).limit(10),
      supabase.from('tasks').select('title, status, priority').eq('organization_id', profile.organization_id).eq('status', 'pending').limit(10),
      supabase.from('vendors').select('name, category').eq('organization_id', profile.organization_id).limit(10),
    ])
    orgContext = `
Active campaigns: ${JSON.stringify(campaigns)}
Pending deliverables: ${JSON.stringify(deliverables)}
Creators: ${JSON.stringify(creators)}
    `
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: `You are Engage AI, the in-house assistant for Matlama Marketing Concepts, built into Engage Terminal.
You help the Matlama team run brand campaigns, manage creator clusters (groups of micro-influencers with ~1K followers each clustered together for wider reach), track deliverables, and optimize engagement.
Be concise, practical and friendly. Use ZAR (Rand) for currency references.
Key concepts: creator clusters (multiple small creators vs one macro-influencer), cross-platform posting (TikTok, Instagram, YouTube, Twitter), deliverable tracking, brand campaign management, engagement rate optimization, PhoneClaw automation.
Current user: ${profile?.full_name ?? 'Team Member'}
${orgContext ? `Current org data:\n${orgContext}` : ''}
Context: ${context ?? 'General assistance'}`,
    messages: [{ role: 'user', content: message }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ reply: text })
}
