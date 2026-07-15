'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const VALID_PLANS = ['standard', 'pro', 'max'] as const
type PlanKey = (typeof VALID_PLANS)[number]

const PLAN_LABELS: Record<PlanKey, { name: string; price: string }> = {
  standard: { name: 'Standard', price: 'R299/mo' },
  pro: { name: 'Pro', price: 'R999/mo' },
  max: { name: 'Max', price: 'R2,999/mo' },
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const planParam = searchParams.get('plan')
  const plan: PlanKey = (VALID_PLANS as readonly string[]).includes(planParam ?? '')
    ? (planParam as PlanKey)
    : 'standard'

  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_name: organizationName,
          plan,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      // Email confirmation is off — user is signed in immediately
      router.push('/dashboard')
    } else {
      // Email confirmation is required before a session exists
      setAwaitingConfirmation(true)
      setLoading(false)
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-brand text-xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-dark mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm">
            We've sent a confirmation link to <span className="font-medium text-dark">{email}</span>.
            Click it to activate your {PLAN_LABELS[plan].name} account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-sidebar flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-dark-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EP</span>
          </div>
          <span className="text-white font-semibold text-lg">EventPulse</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Vendor coordination,<br />
            <span className="text-brand">finally simple.</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage vendors, track tasks, send WhatsApp RSVPs — all in one place built for SA event planners.
          </p>
        </div>

        <div className="flex gap-8 text-sm text-gray-500">
          <span>500+ Events managed</span>
          <span>48+ Vendor categories</span>
          <span>WhatsApp RSVP built-in</span>
        </div>
      </div>

      {/* Right — register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EP</span>
            </div>
            <span className="font-semibold text-lg">EventPulse</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-dark">Start your trial</h2>
            <span className="text-xs font-semibold text-brand bg-brand-muted px-2.5 py-1 rounded-full">
              {PLAN_LABELS[plan].name} · {PLAN_LABELS[plan].price}
            </span>
          </div>
          <p className="text-gray-500 mb-8">
            14 days free, no card required.{' '}
            <a href="/plan-finder" className="text-brand hover:underline">Not the right plan?</a>
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Lucky Nkhathoo"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Company / organisation name</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Matlama Events"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.co.za"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-brand bg-brand-muted px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating your account...' : `Start free trial`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <a href="/auth/login" className="text-brand font-medium hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
