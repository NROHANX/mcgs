/*
  # Reset and Simplify MCGS Database Schema

  1. New Tables
    - `users` - Basic user management (customers, providers, admins)
    - `service_providers` - Service provider profiles
    - `service_bookings` - Customer service requests
    - `contacts` - Contact form submissions

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control

  3. Simplified Structure
    - Removed complex assignment system
    - Direct booking to provider assignment
    - Streamlined user roles
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS booking_assignments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS admin_management CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS provider_categories CASCADE;
DROP TABLE IF EXISTS provider_service_areas CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS service_areas CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS service_bookings CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'provider', 'admin')),
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_providers table
CREATE TABLE service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  category text NOT NULL,
  description text,
  phone text,
  address text,
  is_available boolean DEFAULT true,
  rating numeric DEFAULT 0,
  total_jobs integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create service_bookings table
CREATE TABLE service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES service_providers(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  description text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  service_address text NOT NULL,
  preferred_date date,
  preferred_time_slot text DEFAULT 'flexible',
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  estimated_price numeric DEFAULT 0,
  actual_price numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contacts table
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  service_type text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Service providers policies
CREATE POLICY "Everyone can view approved providers"
  ON service_providers
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = service_providers.user_id 
      AND status = 'approved'
    )
  );

CREATE POLICY "Providers can manage their own profile"
  ON service_providers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all providers"
  ON service_providers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Service bookings policies
CREATE POLICY "Customers can view their own bookings"
  ON service_bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create bookings"
  ON service_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers can view their assigned bookings"
  ON service_bookings
  FOR SELECT
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their assigned bookings"
  ON service_bookings
  FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON service_bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Contacts policies
CREATE POLICY "Anyone can create contacts"
  ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at
    BEFORE UPDATE ON service_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (id, email, full_name, user_type, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'worldecare@gmail.com', 'MCGS Admin', 'admin', 'approved'),
  ('22222222-2222-2222-2222-222222222222', 'nexterplus.com@gmail.com', 'Test Provider', 'provider', 'approved'),
  ('33333333-3333-3333-3333-333333333333', 'customer@mcgs.com', 'Test Customer', 'customer', 'approved');

INSERT INTO service_providers (user_id, business_name, category, description, phone, address, is_available, rating, total_jobs) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Expert RO Services', 'RO Technician', 'Professional water purifier installation and maintenance services', '+91 98765 43210', 'Sitabuldi, Nagpur, Maharashtra', true, 4.8, 25);

INSERT INTO service_bookings (customer_id, service_name, description, customer_name, customer_phone, customer_email, service_address, urgency, estimated_price, status) VALUES
  ('33333333-3333-3333-3333-333333333333', 'RO Installation', 'Need new RO system installation', 'Test Customer', '+91 98765 43210', 'customer@mcgs.com', '123 Test Address, Nagpur', 'normal', 3000, 'pending');