/*
  # Create Provider Related Tables

  1. New Tables
    - `service_providers` - Service provider profiles
    - `services` - Services offered by providers
    - `reviews` - Customer reviews for providers
    - `provider_categories` - Provider-category relationships
    - `provider_service_areas` - Provider service area coverage

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Service Providers table
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

CREATE POLICY "Service providers are viewable by everyone"
  ON service_providers FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can create their own provider profile"
  ON service_providers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can manage their own profile"
  ON service_providers FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile"
  ON service_providers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view approved providers"
  ON service_providers FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = service_providers.user_id 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage all providers"
  ON service_providers FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Services table
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

CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT TO public
  USING (true);

CREATE POLICY "Providers can manage their own services"
  ON services FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = services.provider_id 
      AND service_providers.user_id = auth.uid()
    )
  );

-- Reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Provider Categories junction table
CREATE TABLE provider_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) NOT NULL,
  service_category_id uuid REFERENCES service_categories(id) NOT NULL,
  experience_years integer DEFAULT 0,
  hourly_rate numeric,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, service_category_id)
);

ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider categories are viewable by everyone"
  ON provider_categories FOR SELECT TO public
  USING (true);

CREATE POLICY "Providers can manage their categories"
  ON provider_categories FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = provider_categories.provider_id 
      AND sp.user_id = auth.uid()
    )
  );

-- Provider Service Areas junction table
CREATE TABLE provider_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) NOT NULL,
  service_area_id uuid REFERENCES service_areas(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, service_area_id)
);

ALTER TABLE provider_service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service areas are viewable by everyone"
  ON provider_service_areas FOR SELECT TO public
  USING (true);

CREATE POLICY "Providers can manage their service areas"
  ON provider_service_areas FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = provider_service_areas.provider_id 
      AND sp.user_id = auth.uid()
    )
  );

-- Function to update provider rating
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
$$ LANGUAGE plpgsql;

-- Trigger to update provider rating when reviews change
CREATE TRIGGER update_provider_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_rating();