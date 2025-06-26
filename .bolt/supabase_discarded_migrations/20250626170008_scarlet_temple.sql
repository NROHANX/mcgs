/*
  # Create service categories table

  1. New Tables
    - `service_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `description` (text)
      - `icon` (text)
      - `base_price` (numeric, default: 0)
      - `estimated_duration` (text)
      - `is_active` (boolean, default: true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `service_categories` table
    - Add policies for public read access to active categories
    - Add policies for admins to manage categories
</sql>

-- Create service categories table
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

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
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
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Insert default service categories
INSERT INTO service_categories (name, description, icon, base_price, estimated_duration) VALUES
('RO Technician', 'Water purifier installation, maintenance, and repair services', '💧', 800, '1-2 hours'),
('AC Technician', 'Air conditioning installation, repair, and maintenance services', '❄️', 600, '2-3 hours'),
('Electrician', 'Electrical wiring, repairs, and installations', '⚡', 500, '1-3 hours'),
('Plumber', 'Plumbing repairs, installations, and maintenance', '🔧', 600, '1-2 hours'),
('Mechanic', 'Vehicle repair, maintenance, and diagnostics', '🔩', 800, '2-4 hours'),
('Carpenter', 'Furniture making, repairs, and custom woodwork', '🪚', 1000, '3-6 hours'),
('Painter', 'Interior and exterior painting services', '🎨', 400, '4-8 hours'),
('Cleaner', 'Home, office, and deep cleaning services', '🧹', 300, '2-4 hours'),
('Gardener', 'Garden maintenance, landscaping, and plant care', '🌱', 500, '2-3 hours');