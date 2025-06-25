import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'mcgs-service-platform'
    }
  }
});

// Database types for TypeScript - aligned with actual schema
export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: 'customer' | 'provider' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  image?: string;
  contact?: string;
  location?: string;
  complete_address?: string;
  available: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description?: string;
  price?: string;
  estimated_time?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  provider_id?: string;
  customer_id: string;
  service_name: string;
  date?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_address: string;
  preferred_date?: string;
  description?: string;
}

export interface ServiceBooking {
  id: string;
  customer_id: string;
  service_category_id: string;
  service_name: string;
  description?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_address: string;
  preferred_date?: string;
  preferred_time_slot?: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  estimated_price?: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  service_type?: string;
  created_at: string;
}

export interface Review {
  id: string;
  provider_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'booking' | 'account';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  base_price?: number;
  estimated_duration?: string;
  is_active: boolean;
  created_at: string;
}

export interface BookingAssignment {
  id: string;
  booking_id: string;
  provider_id?: string;
  assigned_by?: string;
  assignment_type: 'manual' | 'automatic';
  assigned_at: string;
  provider_accepted: boolean;
  provider_response_at?: string;
  notes?: string;
  created_at: string;
}