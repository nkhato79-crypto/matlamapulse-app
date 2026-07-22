---
name: eventpulse-dev
description: >
  Skill for developing and modifying EventPulse (MatlamaPulse), a Next.js 14
  event-management SaaS for South African event planners. Covers the full stack:
  App Router pages, Supabase auth/RLS/queries, Tailwind UI, API routes, Pulse AI
  integration, subscription gating, and deployment. Use when adding features,
  fixing bugs, creating pages/components, modifying the database schema, or
  working on the vendor/event/task/RSVP system.
---

# EventPulse Development Skill

## Product

EventPulse is a B2B SaaS for South African event planners. It manages events,
vendors, tasks, vendor assignments, guest RSVPs, and budgets. A built-in AI
assistant ("Pulse AI") uses the Anthropic SDK. The app is multi-tenant: every
user belongs to an **organization**, and all data is org-scoped via Supabase RLS.

Three subscription tiers gate features:

| Tier     | Price     | Events | Vendors | Users | Reports | RSVP | Pulse AI | WhatsApp |
|----------|-----------|--------|---------|-------|---------|------|----------|----------|
| Standard | R299/mo   | 5      | 5       | 1     | No      | No   | No       | No       |
| Pro      | R999/mo   | 15     | 15      | 5     | Yes     | Yes  | No       | Yes      |
| Max      | R2,999/mo | Unlimited | Unlimited | 15 | Yes  | Yes  | Yes      | Yes      |

Currency is always **ZAR (Rand)**, locale is **en-ZA**, dates use `en-ZA` formatting.

## Stack

| Layer          | Technology                                                        |
|----------------|-------------------------------------------------------------------|
| Framework      | Next.js 14.2.5 (App Router)                                      |
| Language       | TypeScript 5                                                      |
| Styling        | Tailwind CSS 3.4 + clsx + tailwind-merge                         |
| Icons          | lucide-react                                                      |
| Auth           | Supabase Auth (email/password, Google OAuth, magic link)          |
| Database       | Supabase (PostgreSQL + RLS)                                       |
| AI             | @anthropic-ai/sdk (Pulse AI, Max-tier only)                      |
| Charts         | recharts (reports page)                                           |
| Dates          | date-fns                                                          |
| Encryption     | Node crypto (AES-256-GCM for vendor PII)                         |
| Hosting        | Vercel (primary) or Render (fallback)                             |

## File Layout

```
app/
  layout.tsx              Root layout (Inter font, metadata)
  globals.css             Tailwind + CSS custom properties
  page.tsx                Redirects to /dashboard
  dashboard/page.tsx      Server component — stats + event table
  events/
    page.tsx              Client — event cards with status filter
    new/page.tsx          Client — create event form
    [id]/page.tsx         Client — event detail (tabs: Overview, Vendors, Tasks, Timeline, RSVP)
  vendors/
    page.tsx              Client — vendor table with category filter
    new/page.tsx          Client — add vendor (via /api/vendors for encryption)
    [id]/page.tsx         Server — vendor detail + assignment history
  tasks/page.tsx          Server — task list grouped by status
  reports/page.tsx        Server — gated to Pro+, aggregate stats
  settings/page.tsx       Client — profile + org settings
  auth/
    login/page.tsx        Client — email/password + Google + magic link
    register/page.tsx     Client — signup with plan selection
  plan-finder/page.tsx    Client — 6-question quiz recommending a tier
  api/
    auth/callback/route.ts   OAuth callback + auto-create org/profile
    pulse/route.ts           POST — Anthropic SDK chat (Max-tier only)
    vendors/route.ts         POST/GET — encrypted vendor CRUD
    health/route.ts          GET — Supabase connectivity check
components/
  layout/Sidebar.tsx      Client — nav + plan badge + Pulse AI button + logout
  UpgradeGate.tsx         Client — paywall placeholder for locked features
lib/
  supabase/server.ts      createClient() for server components/routes
  supabase/client.ts      createClient() for client components
  plans.ts                PLAN_FEATURES config, canAccess(), getUpgradeTier()
  encryption.ts           encrypt/decrypt/encryptFields/decryptFields (AES-256-GCM)
types/
  database.ts             TypeScript interfaces for all tables
middleware.ts             Auth guard + security headers (CSP, HSTS, etc.)
supabase/
  migrations/             RLS policies
```

## Data Model

All tables carry `organization_id` and are protected by RLS policies that scope
every SELECT/INSERT/UPDATE/DELETE to the authenticated user's organization.

### Core Tables

| Table                | Key Columns                                                       | Notes |
|----------------------|-------------------------------------------------------------------|-------|
| `organizations`      | id, name, slug, subscription_tier, subscription_status, trial_ends_at | Multi-tenant root |
| `profiles`           | id (= auth.uid()), organization_id, full_name, email, role        | One per user |
| `events`             | id, organization_id, created_by, name, event_date, venue_*, guest_count, budget, status | Status: draft/planning/active/completed/cancelled |
| `vendors`            | id, organization_id, name, category, contact_name, phone, email, whatsapp, is_preferred, rating | PII encrypted via /api/vendors |
| `vendor_assignments` | id, event_id, vendor_id, organization_id, status, quoted/agreed/deposit amounts | Links vendors to events |
| `tasks`              | id, event_id, organization_id, assigned_to, vendor_id, title, status, priority, due_date | Status: pending/in_progress/completed/cancelled |
| `rsvp_responses`     | id, event_id, vendor_assignment_id, organization_id, recipient_phone, rsvp_status | For WhatsApp RSVP |
| `subscriptions`      | id, organization_id, tier, status, billing_cycle, payfast_token   | Billing integration |
| `plan_finder_leads`  | team/events/vendors/clients/rsvp/custom answers, recommended_plan | Lead capture |

### Type Enums (from `types/database.ts`)

- `SubscriptionTier`: standard | pro | max
- `EventStatus`: draft | planning | active | completed | cancelled
- `VendorAssignmentStatus`: pending | confirmed | declined | cancelled
- `TaskStatus`: pending | in_progress | completed | cancelled
- `TaskPriority`: low | medium | high | urgent
- `RSVPStatus`: pending | confirmed | declined | maybe
- `UserRole`: owner | admin | member

## Conventions

### Supabase Client Usage

- **Server components / Route Handlers**: `import { createClient } from '@/lib/supabase/server'`
- **Client components**: `import { createClient } from '@/lib/supabase/client'`
- Always call `createClient()` inside the function body, not at module level.
- For parallel data fetching, use `Promise.all([...])` with destructuring.

### Auth Pattern

Every protected page or API route starts by getting the current user:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) { /* redirect to /auth/login or return 401 */ }
```

To get the user's org context (needed for most queries):
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('organization_id')
  .eq('id', user.id)
  .single()
```

RLS handles row-level scoping automatically, but `organization_id` must be
included in INSERT payloads.

### Page Structure

Every page follows a consistent layout:
1. **Header bar**: white bg, h-16, px-8, border-b, contains page title + primary action button
2. **Content area**: p-6, optional sidebar at w-[264px]

Server components (async function) are preferred for read-only pages (dashboard,
tasks, reports, vendor detail). Client components ('use client' + useState/useEffect)
are used for pages with interactivity (events list, settings, forms, event detail).

### Styling

- **Brand colors**: `brand` (#D94635), `brand-dark` (#B83528), `brand-light` (#F05A47), `brand-muted` (#FDF1F0)
- **Dark colors**: `dark` (#1A1A1E), `dark-sidebar` (#101012), `dark-card` (#1E1E22)
- **Neutral text**: primary `text-[#1a1a1f]`, secondary `text-[#80808c]`, muted `text-[#a6a6b2]`
- **Borders**: `border-[#e5e5eb]` (header), `border-[#ededf2]` (table rows), `border-gray-100` (cards)
- **Font**: Inter via next/font/google
- **Font sizes**: headings `text-xl` (page title), body `text-[13px]`, labels `text-[11px]`, stats `text-[32px]`
- **Buttons**: primary `bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors`
- **Status badges**: `text-[11px] font-semibold px-2.5 py-1 rounded-full` with color-coded bg/text pairs
- **Cards**: `bg-white rounded-lg` (main pages) or `bg-white rounded-xl border border-gray-100 shadow-sm` (forms)
- **Inputs**: `w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand`

Status badge colors (used across dashboard, events, event detail):
```typescript
const statusBadge = (status: string) => {
  switch (status) {
    case 'active':    return 'bg-[rgba(51,199,89,0.15)] text-[#33c759]'
    case 'planning':  return 'bg-[rgba(51,153,219,0.15)] text-[#3399db]'
    case 'draft':     return 'bg-[rgba(166,166,178,0.15)] text-[#a6a6b2]'
    case 'completed': return 'bg-[rgba(147,51,234,0.15)] text-purple-600'
    case 'cancelled': return 'bg-[rgba(217,69,54,0.15)] text-brand'
    default:          return 'bg-[rgba(166,166,178,0.15)] text-[#a6a6b2]'
  }
}
```

### Feature Gating

Features are gated by subscription tier using `lib/plans.ts`:
- Check with `canAccess(tier, 'hasReports')` or check `PLAN_FEATURES[tier].hasReports`
- Locked features show `<UpgradeGate>` component
- Sidebar nav items show a lock icon for gated routes
- To gate a server component page, check tier at the top and return `<UpgradeGate>` early
- Pulse AI is gated to Max tier only

### Vendor PII Encryption

Sensitive vendor fields (phone, whatsapp, email, address) are encrypted at rest
using AES-256-GCM. New vendors MUST be created through `/api/vendors` (POST),
not by direct Supabase insert from client components. The API route handles
encryption on write and decryption on read.

### Pulse AI Integration

The `/api/pulse` route uses the Anthropic SDK:
- Model: `claude-sonnet-4-6` (update to latest when available)
- System prompt includes user's name and org context (events, pending tasks, vendors)
- Max 500 tokens per response
- Only accessible to Max-tier subscribers

### Public Routes

Defined in middleware.ts — these do NOT require authentication:
- `/auth/*` (login, register)
- `/plan-finder` (quiz)
- `/api/auth/*` (callbacks)

All other routes redirect unauthenticated users to `/auth/login`.

## Environment Variables

| Variable                        | Required | Notes |
|---------------------------------|----------|-------|
| NEXT_PUBLIC_SUPABASE_URL        | Yes      | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY   | Yes      | Supabase anon/public key |
| ANTHROPIC_API_KEY               | Yes      | For Pulse AI |
| ENCRYPTION_SECRET               | Yes      | For vendor PII encryption |
| TWILIO_ACCOUNT_SID              | Future   | WhatsApp RSVP (Vercel only) |
| TWILIO_AUTH_TOKEN                | Future   | WhatsApp RSVP |
| TWILIO_WHATSAPP_FROM            | Future   | WhatsApp sender number |

## Adding a New Feature — Checklist

1. **Type definitions**: Add interfaces/types to `types/database.ts`
2. **Database**: Write a migration in `supabase/migrations/` with RLS policies
3. **Page**: Create under `app/` following the header-bar + content pattern
4. **Supabase queries**: Use the correct client (server vs client), include `organization_id`
5. **Sidebar nav**: Add entry to `nav` array in `components/layout/Sidebar.tsx` with optional `gate`
6. **Feature gating**: If tier-locked, add boolean to `PLAN_FEATURES` in `lib/plans.ts`
7. **Encryption**: If storing PII, route writes through an API route using `lib/encryption.ts`
8. **Date formatting**: Use `en-ZA` locale, `date-fns` for calculations
9. **Currency**: Always ZAR, format with `R${Number(amount).toLocaleString('en-ZA')}`

## Adding a New Database Table

1. Write migration SQL enabling RLS:
```sql
CREATE TABLE new_table (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  -- columns
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org data" ON new_table
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );
-- Repeat for INSERT (WITH CHECK), UPDATE, DELETE
```

2. Add TypeScript interface to `types/database.ts`
3. Add to health check if it's a core table
