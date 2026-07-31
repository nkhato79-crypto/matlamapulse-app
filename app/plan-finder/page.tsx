'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Megaphone, Target, Eye, Zap, Sparkles, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Option = { text: string; tier: number }

const QUESTIONS: { id: string; label: string; icon: any; prompt: string; options: Option[] }[] = [
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    prompt: 'Besides you, how many people need their own login to manage campaigns?',
    options: [
      { text: 'Just me', tier: 0 },
      { text: '2 – 5 people', tier: 1 },
      { text: '6 – 15 people', tier: 2 },
    ],
  },
  {
    id: 'events',
    label: 'Campaigns',
    icon: Megaphone,
    prompt: 'How many brand campaigns do you typically run at once?',
    options: [
      { text: 'Up to 5', tier: 0 },
      { text: '6 – 15', tier: 1 },
      { text: 'More than 15', tier: 2 },
    ],
  },
  {
    id: 'vendors',
    label: 'Creators',
    icon: Target,
    prompt: 'How many creators are in your roster?',
    options: [
      { text: 'Up to 10', tier: 0 },
      { text: 'Up to 50', tier: 1 },
      { text: 'More than 50', tier: 2 },
    ],
  },
  {
    id: 'clients',
    label: 'Brand access',
    icon: Eye,
    prompt: 'Do your brand clients need their own read-only view of campaign progress?',
    options: [
      { text: "No, they don't need a login", tier: 0 },
      { text: 'Yes, one brand at a time', tier: 1 },
      { text: 'Yes, several brands at once', tier: 2 },
    ],
  },
  {
    id: 'rsvp',
    label: 'Automation',
    icon: Zap,
    prompt: 'Do you need automated cross-platform posting via PhoneClaw?',
    options: [
      { text: 'No, manual posting is fine', tier: 0 },
      { text: 'Yes, for select campaigns', tier: 1 },
      { text: 'Yes, across all campaigns', tier: 2 },
    ],
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: Sparkles,
    prompt: 'Do you need white-label branding or custom analytics dashboards?',
    options: [
      { text: 'No', tier: 0 },
      { text: 'Yes', tier: 2 },
    ],
  },
]

const PLANS = [
  {
    tier: 0,
    key: 'standard',
    name: 'Starter',
    price: 'R499',
    tagline: 'For solo agencies getting started with creator clusters',
    features: ['1 user', '5 active campaigns', '10 creators', 'No brand portal access', 'No automation', 'Basic deliverable tracking'],
  },
  {
    tier: 1,
    key: 'pro',
    name: 'Growth',
    price: 'R1,499',
    tagline: 'For growing agencies managing multiple brand campaigns',
    features: ['5 team members', '1 brand portal', '15 campaigns', '50 creators', 'PhoneClaw automation', 'Full analytics + Engage AI'],
  },
  {
    tier: 2,
    key: 'max',
    name: 'Agency',
    price: 'R3,999',
    tagline: 'For full-scale agencies running creator clusters at volume',
    features: ['Team of 15', 'Unlimited campaigns', 'Unlimited creators', 'Unlimited brand portals', 'Full automation + custom scripts', 'White-label branding + priority support'],
  },
]

export default function PlanFinderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Option>>({})
  const [saving, setSaving] = useState(false)

  const total = QUESTIONS.length
  const done = step >= total
  const current = QUESTIONS[step]

  const selectAnswer = (option: Option) => {
    setAnswers((prev) => ({ ...prev, [current.id]: option }))
    setStep((s) => s + 1)
  }

  const goBack = () => setStep((s) => Math.max(0, s - 1))
  const restart = () => {
    setAnswers({})
    setStep(0)
  }

  const recommendedTier = Math.max(0, ...Object.values(answers).map((a) => a.tier))
  const plan = PLANS[recommendedTier]

  const reasons = QUESTIONS
    .filter((q) => answers[q.id] && answers[q.id].tier === recommendedTier && recommendedTier > 0)
    .map((q) => `${q.label}: ${answers[q.id].text}`)

  const handleContinue = async () => {
    setSaving(true)
    try {
      await supabase.from('plan_finder_leads').insert({
        team_answer: answers.team?.text ?? '',
        events_answer: answers.events?.text ?? '',
        vendors_answer: answers.vendors?.text ?? '',
        clients_answer: answers.clients?.text ?? '',
        rsvp_answer: answers.rsvp?.text ?? '',
        custom_answer: answers.custom?.text ?? '',
        recommended_plan: plan.key,
      })
    } catch (err) {
      console.error('plan_finder_leads insert failed', err)
    } finally {
      setSaving(false)
      router.push(`/auth/register?plan=${plan.key}`)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">ET</span>
            </div>
            <span className="text-dark font-semibold">Engage Terminal</span>
          </div>
          <h1 className="text-2xl font-bold text-dark">Find the plan that fits how you run campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">Six quick questions, no commitment</p>
        </div>

        {!done && (
          <>
            <div className="flex items-center gap-2 mb-8">
              {QUESTIONS.map((q, i) => (
                <div key={q.id} className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="h-full bg-brand transition-all duration-500"
                    style={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
                  />
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-brand-muted flex items-center justify-center">
                  <current.icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs tracking-wide uppercase text-gray-400">Step {step + 1} of {total}</p>
                  <p className="text-xs tracking-wide uppercase text-brand font-medium">{current.label}</p>
                </div>
              </div>

              <p className="text-lg font-semibold text-dark mb-6 leading-snug">{current.prompt}</p>

              <div className="space-y-3">
                {current.options.map((opt) => (
                  <button
                    key={opt.text}
                    onClick={() => selectAnswer(opt)}
                    className="w-full text-left px-5 py-4 rounded-lg border border-gray-200 text-dark hover:border-brand hover:bg-brand-muted transition-colors flex items-center justify-between group"
                  >
                    {opt.text}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity text-brand" />
                  </button>
                ))}
              </div>

              {step > 0 && (
                <button
                  onClick={goBack}
                  className="mt-6 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
            </div>
          </>
        )}

        {done && (
          <div>
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-8 pt-8 pb-6 text-center bg-dark-sidebar">
                <p className="text-xs tracking-widest uppercase text-brand-light font-semibold mb-2">Recommended Plan</p>
                <h2 className="text-3xl font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-gray-400 text-sm">{plan.tagline}</p>
              </div>

              <div className="px-8 py-6">
                <p className="text-center mb-5">
                  <span className="text-3xl font-bold text-dark">{plan.price}</span>
                  <span className="text-gray-400 text-sm"> / month</span>
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {reasons.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <p className="text-xs tracking-wide uppercase text-brand font-medium mb-2">Matched to your answers</p>
                    <ul className="space-y-1.5">
                      {reasons.map((r, i) => (
                        <li key={i} className="text-xs text-gray-500">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={handleContinue}
                  disabled={saving}
                  className="w-full py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : `Continue with ${plan.name}`}
                </button>
              </div>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={restart}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
