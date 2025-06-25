/*
  # Create Service Providers Table

  1. New Tables
    - `service_providers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `business_name` (text)
      - `category` (text)
      - `description` (text)
      - `phone` (text)
      - `address` (text)
      - `is_available` (boolean)
      - `rating` (numeric)
      - `total_jobs` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for provider access
*/

CREATE TABLE IF NOT EXISTS service_providers (
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

-- Enable RLS
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Providers can manage their own profile"
  ON service_providers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view approved providers"
  ON service_providers
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = user_id 
      AND status = 'approved'
    )
  );

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