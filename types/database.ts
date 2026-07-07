export type SubscriptionTier = 'standard' | 'pro' | 'max'
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired'
export type EventStatus = 'draft' | 'planning' | 'active' | 'completed' | 'cancelled'
export type VendorAssignmentStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe'
export type UserRole = 'owner' | 'admin' | 'member'

export interface Organization {
  id: string
  name: string
  slug: string
  email?: string
  phone?: string
  website?: string
  logo_url?: string
  address?: string
  city?: string
  country: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  trial_ends_at?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  organization_id?: string
  full_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  organization_id: string
  created_by?: string
  name: string
  description?: string
  event_date?: string
  event_time?: string
  end_date?: string
  venue_name?: string
  venue_address?: string
  venue_city?: string
  guest_count: number
  budget?: number
  status: EventStatus
  event_type?: string
  cover_image_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  organization_id: string
  name: string
  category?: string
  contact_name?: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  address?: string
  city?: string
  rating?: number
  notes?: string
  is_preferred: boolean
  created_at: string
  updated_at: string
}

export interface VendorAssignment {
  id: string
  event_id: string
  vendor_id: string
  organization_id: string
  status: VendorAssignmentStatus
  quoted_amount?: number
  agreed_amount?: number
  deposit_amount?: number
  deposit_paid: boolean
  notes?: string
  confirmed_at?: string
  created_at: string
  updated_at: string
  vendor?: Vendor
}

export interface Task {
  id: string
  event_id: string
  organization_id: string
  assigned_to?: string
  vendor_id?: string
  title: string
  description?: string
  category?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface RSVPResponse {
  id: string
  event_id: string
  vendor_assignment_id?: string
  organization_id: string
  recipient_name?: string
  recipient_phone: string
  recipient_type: 'vendor' | 'guest'
  message_sent?: string
  message_sid?: string
  response?: string
  rsvp_status: RSVPStatus
  sent_at?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  organization_id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  billing_cycle: 'monthly' | 'annual'
  amount_zar?: number
  payfast_token?: string
  payfast_sub_id?: string
  current_period_start?: string
  current_period_end?: string
  trial_ends_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
}
