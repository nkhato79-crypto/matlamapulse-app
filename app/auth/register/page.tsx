'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
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
          organization_name: 'Matlama Marketing Concepts',
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
    } else {
      setAwaitingConfirmation(true)
      setLoading(false)
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-brand text-xl font-bold">&#10003;</span>
          </div>
          <h1 className="text-xl font-bold text-dark mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm">
            We&apos;ve sent a confirmation link to <span className="font-medium text-dark">{email}</span>.
            Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-sidebar flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-dark-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ET</span>
          </div>
          <span className="text-white font-semibold text-lg">Engage Terminal</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Creator clusters,<br />
            <span className="text-brand">maximum reach.</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Matlama Marketing Concepts — managing micro-influencer campaigns, tracking deliverables, and automating cross-platform posting.
          </p>
        </div>

        <p className="text-sm text-gray-500">Matlama Marketing Concepts &mdash; Internal Use Only</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ET</span>
            </div>
            <span className="font-semibold text-lg">Engage Terminal</span>
          </div>

          <h2 className="text-2xl font-bold text-dark mb-2">Join the team</h2>
          <p className="text-gray-500 mb-6">Create your Engage Terminal account</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@matlama.co.za"
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
              {loading ? 'Creating your account...' : 'Create account'}
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
