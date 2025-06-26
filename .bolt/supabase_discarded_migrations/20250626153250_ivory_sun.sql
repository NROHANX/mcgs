/*
  # Create Booking Related Tables

  1. New Tables
    - `service_bookings` - Main booking table
    - `booking_assignments` - Provider assignments to bookings
    - `earnings` - Provider earnings tracking
    - `payments` - Payment records

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Service Bookings table (main booking table)
CREATE TABLE service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id) NOT NULL,
  service_category_id uuid REFERENCES service_categories(id) NOT NULL,
  service_name text NOT NULL,
  description text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  service_address text NOT NULL,
  preferred_date timestamptz,
  preferred_time_slot text,
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  estimated_price numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own bookings"
  ON service_bookings FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create their own bookings"
  ON service_bookings FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their own pending bookings"
  ON service_bookings FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() AND status = 'pending')
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Assigned providers can view their bookings"
  ON service_bookings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM booking_assignments ba
      JOIN service_providers sp ON sp.id = ba.provider_id
      WHERE ba.booking_id = service_bookings.id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Assigned providers can update booking status"
  ON service_bookings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM booking_assignments ba
      JOIN service_providers sp ON sp.id = ba.provider_id
      WHERE ba.booking_id = service_bookings.id 
      AND sp.user_id = auth.uid() 
      AND ba.provider_accepted = true
    )
  );

CREATE POLICY "Admins can view all bookings"
  ON service_bookings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON service_bookings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

CREATE TRIGGER update_service_bookings_updated_at
  BEFORE UPDATE ON service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Booking Assignments table
CREATE TABLE booking_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES service_bookings(id) NOT NULL,
  provider_id uuid REFERENCES service_providers(id),
  assigned_by uuid REFERENCES auth.users(id),
  assignment_type text DEFAULT 'manual' CHECK (assignment_type IN ('manual', 'automatic')),
  assigned_at timestamptz DEFAULT now(),
  provider_accepted boolean DEFAULT false,
  provider_response_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their assignments"
  ON booking_assignments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = booking_assignments.provider_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their assignment response"
  ON booking_assignments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = booking_assignments.provider_id 
      AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = booking_assignments.provider_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage booking assignments"
  ON booking_assignments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Legacy bookings table for backward compatibility
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES auth.users(id) NOT NULL,
  service_name text NOT NULL,
  date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own bookings"
  ON bookings FOR SELECT TO authenticated
  USING (uid() = customer_id);

CREATE POLICY "Customers can view their bookings"
  ON bookings FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers can view their bookings"
  ON bookings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = bookings.provider_id 
      AND service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view their assigned bookings"
  ON bookings FOR SELECT TO authenticated
  USING (
    provider_id IN (
      SELECT service_providers.id
      FROM service_providers
      WHERE service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update booking status"
  ON bookings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = bookings.provider_id 
      AND service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their bookings"
  ON bookings FOR UPDATE TO authenticated
  USING (
    provider_id IN (
      SELECT service_providers.id
      FROM service_providers
      WHERE service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON bookings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND users.user_type = 'admin' 
      AND users.status = 'approved'
    )
  );

-- Earnings table
CREATE TABLE earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) NOT NULL,
  booking_id uuid REFERENCES bookings(id) NOT NULL,
  gross_amount numeric NOT NULL,
  platform_fee numeric DEFAULT 0 NOT NULL,
  net_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'on_hold')) NOT NULL,
  payment_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own earnings"
  ON earnings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = earnings.provider_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all earnings"
  ON earnings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  transaction_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) NOT NULL,
  processed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own payments"
  ON payments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = payments.provider_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Function to create earnings record when booking is completed
CREATE OR REPLACE FUNCTION create_earnings_record()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO earnings (provider_id, booking_id, gross_amount, net_amount)
    VALUES (NEW.provider_id, NEW.id, NEW.amount, NEW.amount * 0.9); -- 10% platform fee
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create earnings when booking is completed
CREATE TRIGGER create_earnings_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_earnings_record();