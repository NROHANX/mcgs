/*
  # Add bookings table

  1. New Tables
    - bookings
      - id (uuid, primary key)
      - provider_id (uuid, references service_providers)
      - customer_id (uuid, references auth.users)
      - service_name (text)
      - date (timestamptz)
      - status (text)
      - amount (numeric)
      - created_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for providers and customers
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES auth.users NOT NULL,
  service_name text NOT NULL,
  date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Providers can view and manage their bookings
CREATE POLICY "Providers can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE id = provider_id
      AND user_id = auth.uid()
    )
  );

-- Customers can view their own bookings
CREATE POLICY "Customers can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Providers can update booking status
CREATE POLICY "Providers can update booking status"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE id = provider_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE id = provider_id
      AND user_id = auth.uid()
    )
  );