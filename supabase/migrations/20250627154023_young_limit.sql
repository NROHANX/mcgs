/*
  # Reset and Simplify MCGS Database Schema
  
  This migration resets the database by dropping all existing tables and recreating
  a simplified schema with only the essential tables needed for the application.
*/

-- Drop all existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS booking_assignments CASCADE;
DROP TABLE IF EXISTS provider_service_areas CASCADE;
DROP TABLE IF EXISTS provider_categories CASCADE;
DROP TABLE IF EXISTS service_bookings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS admin_management CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS service_areas CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_provider_rating() CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to update provider rating
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE service_providers 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        )
    WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 1. Users table - Simplified
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    user_type text NOT NULL CHECK (user_type IN ('customer', 'provider', 'admin')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_admin_all" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin' 
            AND status = 'approved'
        )
    );

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Service Categories table - Simplified
CREATE TABLE service_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    icon text,
    base_price numeric DEFAULT 0,
    estimated_duration text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_categories_select_active" ON service_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "service_categories_admin_all" ON service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin' 
            AND status = 'approved'
        )
    );

-- Insert essential service categories
INSERT INTO service_categories (name, description, icon, base_price, estimated_duration) VALUES
('RO Technician', 'Water purifier installation, maintenance & repair', '💧', 800, '1-2 hours'),
('AC Technician', 'Air conditioning installation, service & repair', '❄️', 1000, '2-3 hours'),
('Electrician', 'Electrical wiring, repairs & installations', '⚡', 500, '1-3 hours'),
('Plumber', 'Plumbing repairs, installations & maintenance', '🔧', 600, '1-2 hours'),
('Mechanic', 'Vehicle repair, maintenance & diagnostics', '🔩', 800, '2-4 hours');

-- 3. Service Areas table - Simplified
CREATE TABLE service_areas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    area_name text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    pincode text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_areas_select_active" ON service_areas
    FOR SELECT USING (is_active = true);

CREATE POLICY "service_areas_admin_all" ON service_areas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin' 
            AND status = 'approved'
        )
    );

-- Insert essential service areas (Nagpur)
INSERT INTO service_areas (area_name, city, state, pincode) VALUES
('Sitabuldi', 'Nagpur', 'Maharashtra', '440012'),
('Dharampeth', 'Nagpur', 'Maharashtra', '440010'),
('Sadar', 'Nagpur', 'Maharashtra', '440001'),
('Itwari', 'Nagpur', 'Maharashtra', '440002'),
('Civil Lines', 'Nagpur', 'Maharashtra', '440001');

-- 4. Service Providers table - Simplified
CREATE TABLE service_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
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

ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_providers_select_all" ON service_providers
    FOR SELECT USING (true);

CREATE POLICY "service_providers_all_own" ON service_providers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "service_providers_admin_all" ON service_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin' 
            AND status = 'approved'
        )
    );

CREATE POLICY "service_providers_select_approved" ON service_providers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = service_providers.user_id 
            AND status = 'approved'
        )
    );

-- 5. Services table - Simplified
CREATE TABLE services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    price text,
    estimated_time text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_all" ON services
    FOR SELECT USING (true);

CREATE POLICY "services_manage_own" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id = services.provider_id 
            AND user_id = auth.uid()
        )
    );

-- 6. Reviews table - Simplified
CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_all" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_provider_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

-- 7. Service Bookings table - Simplified
CREATE TABLE service_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES auth.users(id) NOT NULL,
    service_category_id uuid REFERENCES service_categories(id),
    service_name text NOT NULL,
    description text,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text NOT NULL,
    service_address text NOT NULL,
    preferred_date date,
    preferred_time_slot text DEFAULT 'morning',
    urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    estimated_price numeric DEFAULT 0,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    special_instructions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_bookings_insert_own" ON service_bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "service_bookings_select_own" ON service_bookings
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "service_bookings_admin_all" ON service_bookings
    FOR ALL USING (
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

-- 8. Booking Assignments table - Simplified
CREATE TABLE booking_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES service_bookings(id) ON DELETE CASCADE NOT NULL,
    provider_id uuid REFERENCES service_providers(id),
    assigned_by uuid REFERENCES auth.users(id),
    assignment_type text NOT NULL DEFAULT 'manual' CHECK (assignment_type IN ('manual', 'automatic')),
    assigned_at timestamptz DEFAULT now(),
    provider_accepted boolean DEFAULT false,
    provider_response_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_assignments_admin_all" ON booking_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin' 
            AND status = 'approved'
        )
    );

CREATE POLICY "booking_assignments_provider_select" ON booking_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_providers sp 
            WHERE sp.id = booking_assignments.provider_id 
            AND sp.user_id = auth.uid()
        )
    );

CREATE POLICY "booking_assignments_provider_update" ON booking_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM service_providers sp 
            WHERE sp.id = booking_assignments.provider_id 
            AND sp.user_id = auth.uid()
        )
    );

-- 9. Contacts table - Simplified
CREATE TABLE contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text NOT NULL,
    message text NOT NULL,
    service_type text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_insert_public" ON contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "contacts_select_admin" ON contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin' 
            AND status = 'approved'
        )
    );

CREATE POLICY "contacts_delete_admin" ON contacts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin' 
            AND status = 'approved'
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX idx_service_providers_category ON service_providers(category);
CREATE INDEX idx_service_providers_available ON service_providers(available);
CREATE INDEX idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX idx_service_bookings_status ON service_bookings(status);
CREATE INDEX idx_booking_assignments_booking_id ON booking_assignments(booking_id);
CREATE INDEX idx_booking_assignments_provider_id ON booking_assignments(provider_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);