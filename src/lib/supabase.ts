import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface ServiceProvider {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
  contact?: string;
  available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  provider_id: string;
  customer_id: string;
  service_name: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
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