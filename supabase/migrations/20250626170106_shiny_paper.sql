/*
  # Create service areas table

  1. New Tables
    - `service_areas`
      - `id` (uuid, primary key)
      - `area_name` (text, not null)
      - `city` (text, not null)
      - `state` (text, not null)
      - `pincode` (text)
      - `is_active` (boolean, default: true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `service_areas` table
    - Add policies for public to view active areas
    - Add policies for admins to manage areas
</sql>

-- Create service areas table
CREATE TABLE IF NOT EXISTS service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;

-- Create policies
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
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

-- Insert default service areas for Nagpur
INSERT INTO service_areas (area_name, city, state, pincode) VALUES
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
('Shankar Nagar', 'Nagpur', 'Maharashtra', '440013'),
('Bajaj Nagar', 'Nagpur', 'Maharashtra', '440010'),
('Manewada', 'Nagpur', 'Maharashtra', '440024'),
('Koradi Road', 'Nagpur', 'Maharashtra', '440013'),
('Katol Road', 'Nagpur', 'Maharashtra', '440013'),
('Amravati Road', 'Nagpur', 'Maharashtra', '440033'),
('Wardha Road', 'Nagpur', 'Maharashtra', '440015'),
('Kamptee Road', 'Nagpur', 'Maharashtra', '440026'),
('Hingna Road', 'Nagpur', 'Maharashtra', '440016'),
('Manish Nagar', 'Nagpur', 'Maharashtra', '440015');