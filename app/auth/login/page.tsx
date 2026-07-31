'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleMagicLink = async () => {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
    })
    if (error) { setError(error.message) }
    else { setError('') ; alert('Check your email for the login link!') }
    setLoading(false)
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

          <h2 className="text-2xl font-bold text-dark mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your Engage Terminal account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@matlama.co.za"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-brand bg-brand-muted px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full mt-3 text-brand hover:underline text-sm font-medium disabled:opacity-60"
          >
            Email me a login link instead
          </button>
        </div>
      </div>
    </div>
  )
}
