/*
  # Create provider relationship tables

  1. New Tables
    - `provider_service_areas` - Many-to-many relationship between providers and service areas
    - `provider_categories` - Many-to-many relationship between providers and service categories

  2. Security
    - Enable RLS on both tables
    - Add policies for providers to manage their own relationships
    - Add policies for public to view relationships
</sql>

-- Create provider service areas junction table
CREATE TABLE IF NOT EXISTS provider_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_area_id uuid NOT NULL REFERENCES service_areas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, service_area_id)
);

-- Create provider categories junction table
CREATE TABLE IF NOT EXISTS provider_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_category_id uuid NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  experience_years integer DEFAULT 0,
  hourly_rate numeric,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, service_category_id)
);

-- Enable RLS on provider_service_areas
ALTER TABLE provider_service_areas ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_service_areas
CREATE POLICY "Service areas are viewable by everyone"
  ON provider_service_areas
  FOR SELECT
  TO public
  USING (true);

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

-- Enable RLS on provider_categories
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_categories
CREATE POLICY "Provider categories are viewable by everyone"
  ON provider_categories
  FOR SELECT
  TO public
  USING (true);

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