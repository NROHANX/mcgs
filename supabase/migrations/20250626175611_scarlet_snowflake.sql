/*
  # Complete MCGS Database Schema Setup

  1. Database Setup
    - Enable necessary extensions
    - Create utility functions for triggers

  2. Core Tables
    - users: User accounts and profiles
    - service_categories: Available service types
    - service_areas: Geographic service coverage
    - service_providers: Provider profiles and information
    - services: Individual services offered by providers

  3. Booking System
    - service_bookings: Main booking requests
    - booking_assignments: Assignment of providers to bookings

  4. Reviews and Feedback
    - reviews: Customer reviews and ratings

  5. Support and Communication
    - contacts: Contact form submissions
    - support_tickets: Customer support tickets

  6. Administration
    - admin_management: Admin user management
    - user_roles: Extended role-based permissions

  7. Relationship Tables
    - provider_categories: Provider-category relationships
    - provider_service_areas: Provider service area coverage

  8. Security
    - Row Level Security (RLS) enabled on all tables
    - Comprehensive policies for data access control
    - Proper indexes for performance optimization
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    -- Update the provider's average rating and review count
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

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'provider', 'admin')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own data" ON users;
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
    DROP POLICY IF EXISTS "users_select_own" ON users;
    DROP POLICY IF EXISTS "users_admin_all" ON users;
END $$;

-- Users policies
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

-- Users trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Service Categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    base_price NUMERIC DEFAULT 0,
    estimated_duration TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Service categories are viewable by everyone" ON service_categories;
    DROP POLICY IF EXISTS "Admins can manage service categories" ON service_categories;
    DROP POLICY IF EXISTS "service_categories_select_active" ON service_categories;
    DROP POLICY IF EXISTS "service_categories_admin_all" ON service_categories;
END $$;

-- Service categories policies
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

-- Insert default service categories (only if they don't exist)
INSERT INTO service_categories (name, description, icon, base_price, estimated_duration) 
SELECT * FROM (VALUES
    ('RO Technician', 'Water purifier installation, maintenance, and repair services', '💧', 800, '1-2 hours'),
    ('AC Technician', 'Air conditioning installation, repair, and maintenance', '❄️', 1000, '2-3 hours'),
    ('Electrician', 'Electrical wiring, repairs, and installations', '⚡', 500, '1-3 hours'),
    ('Plumber', 'Plumbing repairs, installations, and maintenance', '🔧', 600, '1-2 hours'),
    ('Mechanic', 'Vehicle repair, maintenance, and diagnostics', '🔩', 800, '2-4 hours'),
    ('Carpenter', 'Furniture making, repairs, and custom woodwork', '🪚', 1200, '3-6 hours'),
    ('Painter', 'Interior and exterior painting services', '🎨', 400, '4-8 hours'),
    ('Cleaner', 'Home, office, and deep cleaning services', '🧹', 300, '2-4 hours'),
    ('Gardener', 'Garden maintenance, landscaping, and plant care', '🌱', 500, '2-3 hours')
) AS v(name, description, icon, base_price, estimated_duration)
WHERE NOT EXISTS (SELECT 1 FROM service_categories WHERE service_categories.name = v.name);

-- 3. Service Areas table
CREATE TABLE IF NOT EXISTS service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Service areas are viewable by everyone" ON service_areas;
    DROP POLICY IF EXISTS "Admins can manage service areas" ON service_areas;
    DROP POLICY IF EXISTS "service_areas_select_active" ON service_areas;
    DROP POLICY IF EXISTS "service_areas_admin_all" ON service_areas;
END $$;

-- Service areas policies
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

-- Insert default service areas (Nagpur) - only if they don't exist
INSERT INTO service_areas (area_name, city, state, pincode) 
SELECT * FROM (VALUES
    ('Sitabuldi', 'Nagpur', 'Maharashtra', '440012'),
    ('Dharampeth', 'Nagpur', 'Maharashtra', '440010'),
    ('Sadar', 'Nagpur', 'Maharashtra', '440001'),
    ('Itwari', 'Nagpur', 'Maharashtra', '440002'),
    ('Civil Lines', 'Nagpur', 'Maharashtra', '440001'),
    ('Ramdaspeth', 'Nagpur', 'Maharashtra', '440010'),
    ('Mahal', 'Nagpur', 'Maharashtra', '440032'),
    ('Gandhibagh', 'Nagpur', 'Maharashtra', '440002'),
    ('Nandanvan', 'Nagpur', 'Maharashtra', '440009'),
    ('Pratap Nagar', 'Nagpur', 'Maharashtra', '440022'),
    ('Shankar Nagar', 'Nagpur', 'Maharashtra', '440010'),
    ('Bajaj Nagar', 'Nagpur', 'Maharashtra', '440010'),
    ('Manewada', 'Nagpur', 'Maharashtra', '440027'),
    ('Wardha Road', 'Nagpur', 'Maharashtra', '440025'),
    ('Amravati Road', 'Nagpur', 'Maharashtra', '440033'),
    ('Kamptee Road', 'Nagpur', 'Maharashtra', '440026'),
    ('Katol Road', 'Nagpur', 'Maharashtra', '440013'),
    ('Koradi Road', 'Nagpur', 'Maharashtra', '440025'),
    ('Hingna Road', 'Nagpur', 'Maharashtra', '440016'),
    ('Manish Nagar', 'Nagpur', 'Maharashtra', '440015')
) AS v(area_name, city, state, pincode)
WHERE NOT EXISTS (SELECT 1 FROM service_areas WHERE service_areas.area_name = v.area_name AND service_areas.city = v.city);

-- 4. Service Providers table
CREATE TABLE IF NOT EXISTS service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    image TEXT,
    contact TEXT,
    location TEXT,
    complete_address TEXT,
    available BOOLEAN DEFAULT true,
    average_rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Service providers are viewable by everyone" ON service_providers;
    DROP POLICY IF EXISTS "Users can create their own provider profile" ON service_providers;
    DROP POLICY IF EXISTS "Providers can update their own profile" ON service_providers;
    DROP POLICY IF EXISTS "Providers can manage their own profile" ON service_providers;
    DROP POLICY IF EXISTS "Admins can manage all providers" ON service_providers;
    DROP POLICY IF EXISTS "Everyone can view approved providers" ON service_providers;
    DROP POLICY IF EXISTS "service_providers_select_all" ON service_providers;
    DROP POLICY IF EXISTS "service_providers_insert_own" ON service_providers;
    DROP POLICY IF EXISTS "service_providers_update_own" ON service_providers;
    DROP POLICY IF EXISTS "service_providers_all_own" ON service_providers;
    DROP POLICY IF EXISTS "service_providers_admin_all" ON service_providers;
    DROP POLICY IF EXISTS "service_providers_select_approved" ON service_providers;
END $$;

-- Service providers policies
CREATE POLICY "service_providers_select_all" ON service_providers
    FOR SELECT USING (true);

CREATE POLICY "service_providers_insert_own" ON service_providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service_providers_update_own" ON service_providers
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

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

-- 5. Provider Categories relationship table
CREATE TABLE IF NOT EXISTS provider_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    service_category_id UUID NOT NULL REFERENCES service_categories(id),
    experience_years INTEGER DEFAULT 0,
    hourly_rate NUMERIC,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, service_category_id)
);

-- Enable RLS
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Provider categories are viewable by everyone" ON provider_categories;
    DROP POLICY IF EXISTS "Providers can manage their categories" ON provider_categories;
    DROP POLICY IF EXISTS "provider_categories_select_all" ON provider_categories;
    DROP POLICY IF EXISTS "provider_categories_manage_own" ON provider_categories;
END $$;

-- Provider categories policies
CREATE POLICY "provider_categories_select_all" ON provider_categories
    FOR SELECT USING (true);

CREATE POLICY "provider_categories_manage_own" ON provider_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM service_providers sp 
            WHERE sp.id = provider_categories.provider_id 
            AND sp.user_id = auth.uid()
        )
    );

-- 6. Provider Service Areas relationship table
CREATE TABLE IF NOT EXISTS provider_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    service_area_id UUID NOT NULL REFERENCES service_areas(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, service_area_id)
);

-- Enable RLS
ALTER TABLE provider_service_areas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Service areas are viewable by everyone" ON provider_service_areas;
    DROP POLICY IF EXISTS "Providers can manage their service areas" ON provider_service_areas;
    DROP POLICY IF EXISTS "provider_service_areas_select_all" ON provider_service_areas;
    DROP POLICY IF EXISTS "provider_service_areas_manage_own" ON provider_service_areas;
END $$;

-- Provider service areas policies
CREATE POLICY "provider_service_areas_select_all" ON provider_service_areas
    FOR SELECT USING (true);

CREATE POLICY "provider_service_areas_manage_own" ON provider_service_areas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM service_providers sp 
            WHERE sp.id = provider_service_areas.provider_id 
            AND sp.user_id = auth.uid()
        )
    );

-- 7. Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT,
    estimated_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
    DROP POLICY IF EXISTS "Providers can manage their own services" ON services;
    DROP POLICY IF EXISTS "services_select_all" ON services;
    DROP POLICY IF EXISTS "services_manage_own" ON services;
END $$;

-- Services policies
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

-- 8. Service Bookings table (main booking table)
CREATE TABLE IF NOT EXISTS service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    service_category_id UUID REFERENCES service_categories(id),
    service_name TEXT NOT NULL,
    description TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    service_address TEXT NOT NULL,
    preferred_date DATE,
    preferred_time_slot TEXT DEFAULT 'morning',
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    estimated_price NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can create bookings" ON service_bookings;
    DROP POLICY IF EXISTS "Users can view their own bookings" ON service_bookings;
    DROP POLICY IF EXISTS "Admins can view all bookings" ON service_bookings;
    DROP POLICY IF EXISTS "service_bookings_insert_own" ON service_bookings;
    DROP POLICY IF EXISTS "service_bookings_select_own" ON service_bookings;
    DROP POLICY IF EXISTS "service_bookings_admin_all" ON service_bookings;
END $$;

-- Service bookings policies
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

-- Service bookings trigger
DROP TRIGGER IF EXISTS update_service_bookings_updated_at ON service_bookings;
CREATE TRIGGER update_service_bookings_updated_at
    BEFORE UPDATE ON service_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Booking Assignments table
CREATE TABLE IF NOT EXISTS booking_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES service_providers(id),
    assigned_by UUID REFERENCES auth.users(id),
    assignment_type TEXT NOT NULL DEFAULT 'manual' CHECK (assignment_type IN ('manual', 'automatic')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    provider_accepted BOOLEAN DEFAULT false,
    provider_response_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE booking_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can manage assignments" ON booking_assignments;
    DROP POLICY IF EXISTS "Providers can view their assignments" ON booking_assignments;
    DROP POLICY IF EXISTS "Providers can update their assignment responses" ON booking_assignments;
    DROP POLICY IF EXISTS "booking_assignments_admin_all" ON booking_assignments;
    DROP POLICY IF EXISTS "booking_assignments_provider_select" ON booking_assignments;
    DROP POLICY IF EXISTS "booking_assignments_provider_update" ON booking_assignments;
END $$;

-- Booking assignments policies
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

-- 10. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
    DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
    DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
    DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
    DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
END $$;

-- Reviews policies
CREATE POLICY "reviews_select_all" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Reviews trigger to update provider rating
DROP TRIGGER IF EXISTS update_provider_rating_trigger ON reviews;
CREATE TRIGGER update_provider_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

-- 11. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    service_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contacts;
    DROP POLICY IF EXISTS "Only authenticated users can view contacts" ON contacts;
    DROP POLICY IF EXISTS "Admins can delete contacts" ON contacts;
    DROP POLICY IF EXISTS "contacts_insert_public" ON contacts;
    DROP POLICY IF EXISTS "contacts_select_admin" ON contacts;
    DROP POLICY IF EXISTS "contacts_delete_admin" ON contacts;
END $$;

-- Contacts policies
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

-- 12. Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'general', 'booking', 'account')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Users can create their own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "support_tickets_select_own" ON support_tickets;
    DROP POLICY IF EXISTS "support_tickets_insert_own" ON support_tickets;
    DROP POLICY IF EXISTS "support_tickets_update_own" ON support_tickets;
END $$;

-- Support tickets policies
CREATE POLICY "support_tickets_select_own" ON support_tickets
    FOR SELECT USING (
        auth.uid() = user_id OR auth.uid() = assigned_to
    );

CREATE POLICY "support_tickets_insert_own" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_tickets_update_own" ON support_tickets
    FOR UPDATE USING (
        auth.uid() = user_id OR auth.uid() = assigned_to
    );

-- Support tickets trigger
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 13. Admin Management table
CREATE TABLE IF NOT EXISTS admin_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_management ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can view admin management" ON admin_management;
    DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_management;
    DROP POLICY IF EXISTS "admin_management_select_admin" ON admin_management;
    DROP POLICY IF EXISTS "admin_management_super_admin_all" ON admin_management;
END $$;

-- Admin management policies
CREATE POLICY "admin_management_select_admin" ON admin_management
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_management am 
            WHERE am.user_id = auth.uid()
        )
    );

CREATE POLICY "admin_management_super_admin_all" ON admin_management
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_management am 
            WHERE am.user_id = auth.uid() 
            AND am.role = 'super_admin'
        )
    );

-- 14. User Roles table (extended role management)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('super_admin', 'admin', 'employee', 'support_staff', 'customer_care', 'booking_staff', 'service_provider', 'customer')),
    permissions JSONB DEFAULT '{}',
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
    DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
    DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
    DROP POLICY IF EXISTS "user_roles_admin_all" ON user_roles;
END $$;

-- User roles policies
CREATE POLICY "user_roles_select_own" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_roles_admin_all" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin')
        )
    );

-- User roles trigger
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_available ON service_providers(available);
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_assignments_booking_id ON booking_assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_assignments_provider_id ON booking_assignments(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);