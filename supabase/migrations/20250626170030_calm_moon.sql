/*
  # Create service bookings table

  1. New Tables
    - `service_bookings`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to auth.users)
      - `service_category_id` (uuid, foreign key to service_categories)
      - `service_name` (text, not null)
      - `description` (text)
      - `customer_name` (text, not null)
      - `customer_phone` (text, not null)
      - `customer_email` (text, not null)
      - `service_address` (text, not null)
      - `preferred_date` (date)
      - `preferred_time_slot` (text)
      - `urgency` (text, not null, default: normal)
      - `estimated_price` (numeric)
      - `status` (text, not null, default: pending)
      - `special_instructions` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `service_bookings` table
    - Add policies for customers to manage their own bookings
    - Add policies for admins to view all bookings
</sql>

-- Create service bookings table
CREATE TABLE IF NOT EXISTS service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_category_id uuid REFERENCES service_categories(id),
  service_name text NOT NULL,
  description text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  service_address text NOT NULL,
  preferred_date date,
  preferred_time_slot text DEFAULT 'flexible',
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  estimated_price numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Customers can update their own bookings"
  ON service_bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all bookings"
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

-- Create updated_at trigger
CREATE TRIGGER update_service_bookings_updated_at
  BEFORE UPDATE ON service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();