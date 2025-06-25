/*
  # Service-Based Booking System

  1. New Tables
    - `service_categories` - Available service categories (RO, AC, Electrician, etc.)
    - `service_bookings` - Customer service requests (not tied to specific providers)
    - `booking_assignments` - Admin assigns providers to bookings
    - `service_areas` - Define service coverage areas
    
  2. Modified Tables
    - Update existing tables to support new booking flow
    
  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for customers, providers, and admins
*/

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  base_price numeric DEFAULT 0,
  estimated_duration text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create service_areas table for coverage mapping
CREATE TABLE IF NOT EXISTS service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create service_bookings table (replaces direct provider bookings)
CREATE TABLE IF NOT EXISTS service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users NOT NULL,
  service_category_id uuid REFERENCES service_categories NOT NULL,
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

-- Create booking_assignments table (admin assigns providers)
CREATE TABLE IF NOT EXISTS booking_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES service_bookings NOT NULL,
  provider_id uuid REFERENCES service_providers,
  assigned_by uuid REFERENCES auth.users, -- Admin who made the assignment
  assignment_type text DEFAULT 'manual' CHECK (assignment_type IN ('manual', 'automatic')),
  assigned_at timestamptz DEFAULT now(),
  provider_accepted boolean DEFAULT false,
  provider_response_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create provider_service_areas table (which areas each provider covers)
CREATE TABLE IF NOT EXISTS provider_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers NOT NULL,
  service_area_id uuid REFERENCES service_areas NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, service_area_id)
);

-- Create provider_categories table (which services each provider offers)
CREATE TABLE IF NOT EXISTS provider_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers NOT NULL,
  service_category_id uuid REFERENCES service_categories NOT NULL,
  experience_years integer DEFAULT 0,
  hourly_rate numeric,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, service_category_id)
);

-- Enable RLS on new tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;

-- Policies for service_categories (public read, admin write)
CREATE POLICY "Service categories are viewable by everyone"
  ON service_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage service categories"
  ON service_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
    )
  );

-- Policies for service_areas (public read, admin write)
CREATE POLICY "Service areas are viewable by everyone"
  ON service_areas
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage service areas"
  ON service_areas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
    )
  );

-- Policies for service_bookings
CREATE POLICY "Customers can create their own bookings"
  ON service_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can view their own bookings"
  ON service_bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can update their own pending bookings"
  ON service_bookings
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid() AND status = 'pending')
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can view all bookings"
  ON service_bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON service_bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
    )
  );

CREATE POLICY "Assigned providers can view their bookings"
  ON service_bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM booking_assignments ba
      JOIN service_providers sp ON sp.id = ba.provider_id
      WHERE ba.booking_id = service_bookings.id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Assigned providers can update booking status"
  ON service_bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM booking_assignments ba
      JOIN service_providers sp ON sp.id = ba.provider_id
      WHERE ba.booking_id = service_bookings.id
      AND sp.user_id = auth.uid()
      AND ba.provider_accepted = true
    )
  );

-- Policies for booking_assignments
CREATE POLICY "Admins can manage booking assignments"
  ON booking_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view their assignments"
  ON booking_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = booking_assignments.provider_id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their assignment response"
  ON booking_assignments
  FOR UPDATE
  TO authenticated
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

-- Policies for provider_service_areas
CREATE POLICY "Providers can manage their service areas"
  ON provider_service_areas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = provider_service_areas.provider_id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Service areas are viewable by everyone"
  ON provider_service_areas
  FOR SELECT
  TO public
  USING (true);

-- Policies for provider_categories
CREATE POLICY "Providers can manage their categories"
  ON provider_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = provider_categories.provider_id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Provider categories are viewable by everyone"
  ON provider_categories
  FOR SELECT
  TO public
  USING (true);

-- Insert default service categories
INSERT INTO service_categories (name, description, icon, base_price, estimated_duration) VALUES
('RO Technician', 'Water purifier installation, maintenance, and repair services', '💧', 800, '1-3 hours'),
('AC Technician', 'Air conditioning installation, repair, and maintenance', '❄️', 600, '1-4 hours'),
('Electrician', 'Electrical wiring, repairs, and installations', '⚡', 300, '1-2 hours'),
('Plumber', 'Plumbing repairs, installations, and maintenance', '🔧', 500, '1-3 hours'),
('Mechanic', 'Vehicle repair, maintenance, and diagnostics', '🔩', 500, '2-4 hours'),
('Carpenter', 'Furniture making, repairs, and custom woodwork', '🪚', 1000, '2-8 hours'),
('Painter', 'Interior and exterior painting services', '🎨', 25, '4-8 hours'),
('Cleaner', 'Home, office, and deep cleaning services', '🧹', 500, '2-4 hours'),
('Gardener', 'Garden maintenance, landscaping, and plant care', '🌱', 800, '2-6 hours')
ON CONFLICT (name) DO NOTHING;

-- Insert some default service areas (you can add more based on your coverage)
INSERT INTO service_areas (area_name, city, state) VALUES
('Sitabuldi', 'Nagpur', 'Maharashtra'),
('Dharampeth', 'Nagpur', 'Maharashtra'),
('Sadar', 'Nagpur', 'Maharashtra'),
('Itwari', 'Nagpur', 'Maharashtra'),
('Hingna Road', 'Nagpur', 'Maharashtra'),
('Manish Nagar', 'Nagpur', 'Maharashtra'),
('Wardha Road', 'Nagpur', 'Maharashtra'),
('Amravati Road', 'Nagpur', 'Maharashtra'),
('Kamptee Road', 'Nagpur', 'Maharashtra'),
('Civil Lines', 'Nagpur', 'Maharashtra')
ON CONFLICT DO NOTHING;

-- Create trigger for service_bookings updated_at
CREATE TRIGGER update_service_bookings_updated_at
  BEFORE UPDATE ON service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically assign providers (basic implementation)
CREATE OR REPLACE FUNCTION auto_assign_provider(booking_id_param uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_record service_bookings%ROWTYPE;
  available_provider_id uuid;
  assignment_id uuid;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record FROM service_bookings WHERE id = booking_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Find an available provider for this service category
  -- This is a simple implementation - you can make it more sophisticated
  SELECT sp.id INTO available_provider_id
  FROM service_providers sp
  JOIN provider_categories pc ON pc.provider_id = sp.id
  WHERE pc.service_category_id = booking_record.service_category_id
    AND sp.available = true
    AND NOT EXISTS (
      -- Provider is not already assigned to this booking
      SELECT 1 FROM booking_assignments ba 
      WHERE ba.booking_id = booking_id_param AND ba.provider_id = sp.id
    )
  ORDER BY sp.average_rating DESC, sp.created_at ASC
  LIMIT 1;

  IF available_provider_id IS NOT NULL THEN
    -- Create assignment
    INSERT INTO booking_assignments (
      booking_id, 
      provider_id, 
      assignment_type,
      assigned_by
    ) VALUES (
      booking_id_param, 
      available_provider_id, 
      'automatic',
      NULL -- System assignment
    ) RETURNING id INTO assignment_id;

    -- Update booking status
    UPDATE service_bookings 
    SET status = 'assigned', updated_at = now()
    WHERE id = booking_id_param;

    RETURN assignment_id;
  END IF;

  RETURN NULL;
END;
$$;

-- Create function to manually assign provider
CREATE OR REPLACE FUNCTION manual_assign_provider(
  booking_id_param uuid,
  provider_id_param uuid,
  admin_id_param uuid,
  notes_param text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assignment_id uuid;
BEGIN
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM admin_management WHERE user_id = admin_id_param
  ) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  -- Verify provider exists and is available
  IF NOT EXISTS (
    SELECT 1 FROM service_providers 
    WHERE id = provider_id_param AND available = true
  ) THEN
    RAISE EXCEPTION 'Provider not found or not available';
  END IF;

  -- Create assignment
  INSERT INTO booking_assignments (
    booking_id, 
    provider_id, 
    assignment_type,
    assigned_by,
    notes
  ) VALUES (
    booking_id_param, 
    provider_id_param, 
    'manual',
    admin_id_param,
    notes_param
  ) RETURNING id INTO assignment_id;

  -- Update booking status
  UPDATE service_bookings 
  SET status = 'assigned', updated_at = now()
  WHERE id = booking_id_param;

  RETURN assignment_id;
END;
$$;