import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface Booking {
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
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
}