/*
  # Fix migration to avoid duplicate policy errors

  1. Tables
    - Create service_providers, bookings, and contacts tables if they don't exist
    - Add proper constraints and defaults
  
  2. Security
    - Enable RLS on all tables
    - Create policies with proper existence checks
    - Handle cases where policies might already exist

  3. Changes
    - Use IF NOT EXISTS where possible
    - Drop and recreate policies to avoid conflicts
    - Ensure idempotent migration
*/

-- Create service_providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  location text,
  contact text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers NOT NULL,
  customer_id uuid REFERENCES auth.users NOT NULL,
  service_name text NOT NULL,
  date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
-- This ensures we don't get duplicate policy errors

-- Service providers policies
DROP POLICY IF EXISTS "Service providers are viewable by everyone" ON service_providers;
CREATE POLICY "Service providers are viewable by everyone"
  ON service_providers
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can create their own provider profile" ON service_providers;
CREATE POLICY "Users can create their own provider profile"
  ON service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can update their own profile" ON service_providers;
CREATE POLICY "Providers can update their own profile"
  ON service_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bookings policies
DROP POLICY IF EXISTS "Customers can view their bookings" ON bookings;
CREATE POLICY "Customers can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Providers can view their bookings" ON bookings;
CREATE POLICY "Providers can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = bookings.provider_id
      AND service_providers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
CREATE POLICY "Customers can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Providers can update booking status" ON bookings;
CREATE POLICY "Providers can update booking status"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = bookings.provider_id
      AND service_providers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = bookings.provider_id
      AND service_providers.user_id = auth.uid()
    )
  );

-- Contacts policies
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contacts;
CREATE POLICY "Anyone can submit contact forms"
  ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated users can view contacts" ON contacts;
CREATE POLICY "Only authenticated users can view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can delete contacts" ON contacts;
CREATE POLICY "Admins can delete contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (true);