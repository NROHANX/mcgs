import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a fallback client even if env vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
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
  }
);

// Simplified database types
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
  business_name: string;
  category: string;
  description?: string;
  phone?: string;
  address?: string;
  is_available: boolean;
  rating: number;
  total_jobs: number;
  created_at: string;
}

export interface ServiceBooking {
  id: string;
  customer_id: string;
  provider_id?: string;
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
  actual_price?: number;
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