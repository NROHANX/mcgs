/*
  # Create service providers table

  1. New Tables
    - `service_providers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, not null)
      - `category` (text, not null)
      - `subcategory` (text)
      - `description` (text)
      - `image` (text)
      - `contact` (text)
      - `location` (text)
      - `complete_address` (text)
      - `available` (boolean, default: true)
      - `average_rating` (numeric, default: 0)
      - `review_count` (integer, default: 0)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `service_providers` table
    - Add policies for providers to manage their own profile
    - Add policies for public to view approved providers
    - Add policies for admins to manage all providers
</sql>

-- Create service providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  description text,
  image text,
  contact text,
  location text,
  complete_address text,
  available boolean DEFAULT true,
  average_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service providers are viewable by everyone"
  ON service_providers
  FOR SELECT
  TO public
  USING (true);

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

CREATE POLICY "Users can create their own provider profile"
  ON service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can manage their own profile"
  ON service_providers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile"
  ON service_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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