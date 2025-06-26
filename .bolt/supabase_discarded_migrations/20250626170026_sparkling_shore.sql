/*
  # Create services table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to service_providers)
      - `name` (text, not null)
      - `description` (text)
      - `price` (text)
      - `estimated_time` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `services` table
    - Add policies for providers to manage their own services
    - Add policies for public to view services
</sql>

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price text,
  estimated_time text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Services are viewable by everyone"
  ON services
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Providers can manage their own services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers 
      WHERE service_providers.id = services.provider_id 
      AND service_providers.user_id = auth.uid()
    )
  );