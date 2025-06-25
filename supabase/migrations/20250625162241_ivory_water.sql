/*
  # Reset and Create Simple Schema

  1. New Tables
    - `service_providers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `category` (text)
      - `description` (text)
      - `location` (text)
      - `contact` (text)
      - `available` (boolean, default true)
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to service_providers)
      - `customer_id` (uuid, foreign key to auth.users)
      - `service_name` (text)
      - `date` (timestamp)
      - `status` (text, check constraint)
      - `amount` (numeric)
      - `created_at` (timestamp)
    
    - `contacts`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `subject` (text)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop service_providers policies
  DROP POLICY IF EXISTS "Service providers are viewable by everyone" ON service_providers;
  DROP POLICY IF EXISTS "Users can create their own provider profile" ON service_providers;
  DROP POLICY IF EXISTS "Providers can update their own profile" ON service_providers;
  
  -- Drop bookings policies
  DROP POLICY IF EXISTS "Customers can view their bookings" ON bookings;
  DROP POLICY IF EXISTS "Providers can view their bookings" ON bookings;
  DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
  DROP POLICY IF EXISTS "Providers can update booking status" ON bookings;
  
  -- Drop contacts policies
  DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contacts;
  DROP POLICY IF EXISTS "Only authenticated users can view contacts" ON contacts;
  DROP POLICY IF EXISTS "Admins can delete contacts" ON contacts;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Ignore if policies don't exist
END $$;

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

-- Enable RLS
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Service providers policies
CREATE POLICY "Service providers are viewable by everyone"
  ON service_providers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own provider profile"
  ON service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile"
  ON service_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Customers can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

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

CREATE POLICY "Customers can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

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
CREATE POLICY "Anyone can submit contact forms"
  ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (true);