/*
  # Create booking assignments table

  1. New Tables
    - `booking_assignments`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to service_bookings)
      - `provider_id` (uuid, foreign key to service_providers)
      - `assigned_by` (uuid, foreign key to auth.users)
      - `assignment_type` (text, not null) - manual, automatic
      - `assigned_at` (timestamp, default: now)
      - `provider_accepted` (boolean, default: false)
      - `provider_response_at` (timestamp)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `booking_assignments` table
    - Add policies for providers to view their assignments
    - Add policies for admins to manage assignments
</sql>

-- Create booking assignments table
CREATE TABLE IF NOT EXISTS booking_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES service_providers(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assignment_type text NOT NULL DEFAULT 'manual' CHECK (assignment_type IN ('manual', 'automatic')),
  assigned_at timestamptz DEFAULT now(),
  provider_accepted boolean DEFAULT false,
  provider_response_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE booking_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Providers can view their assignments"
  ON booking_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers 
      WHERE service_providers.id = booking_assignments.provider_id 
      AND service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their assignments"
  ON booking_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers 
      WHERE service_providers.id = booking_assignments.provider_id 
      AND service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all assignments"
  ON booking_assignments
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