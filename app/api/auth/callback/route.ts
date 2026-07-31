import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan')
  const next = searchParams.get('next') ?? '/dashboard'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          const tier = ['standard', 'pro', 'max'].includes(plan ?? '')
            ? plan!
            : 'standard'

          const userName = user.user_metadata?.full_name
            ?? user.user_metadata?.name
            ?? user.email?.split('@')[0]
            ?? ''

          const orgName = user.user_metadata?.organization_name
            ?? `${userName}'s Organization`

          try {
            const { data: org } = await supabase
              .from('organizations')
              .insert({
                name: orgName,
                subscription_tier: tier,
                subscription_status: 'trial',
              })
              .select('id')
              .single()

            if (org) {
              await supabase.from('profiles').insert({
                id: user.id,
                full_name: userName,
                email: user.email,
                organization_id: org.id,
                role: 'owner',
              })
            }
          } catch {
            // Profile/org may have been created by a database trigger
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/register?error=auth_failed`)
}
