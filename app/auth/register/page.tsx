'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

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

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium text-dark transition-colors disabled:opacity-60 mb-5"
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

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
