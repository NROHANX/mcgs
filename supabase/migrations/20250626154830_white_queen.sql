/*
  # Insert Fresh Data

  1. Insert service categories
  2. Insert service areas for Nagpur
  3. Prepare for admin user creation (will be done via application)

  This migration sets up the basic data structure with fresh content.
*/

-- Insert service categories
INSERT INTO service_categories (name, description, icon, base_price, estimated_duration) VALUES
('RO Technician', 'Water purifier installation, maintenance & repair services', '💧', 800, '1-2 hours'),
('AC Technician', 'Air conditioning installation, service & repair', '❄️', 600, '2-3 hours'),
('Electrician', 'Electrical wiring, repairs & installations', '⚡', 200, '1-2 hours'),
('Plumber', 'Plumbing repairs, installations & maintenance', '🔧', 500, '1-3 hours'),
('Mechanic', 'Vehicle repair, maintenance & diagnostics', '🔩', 500, '2-4 hours'),
('Carpenter', 'Furniture making, repairs & custom work', '🪚', 1000, '3-6 hours'),
('Painter', 'Interior & exterior painting services', '🎨', 25, '1-3 days'),
('Cleaner', 'Home, office & deep cleaning services', '🧹', 500, '2-4 hours'),
('Gardener', 'Garden maintenance & landscaping', '🌱', 800, '2-4 hours')
ON CONFLICT (name) DO NOTHING;

-- Insert service areas for Nagpur
INSERT INTO service_areas (area_name, city, state, pincode) VALUES
('Sitabuldi', 'Nagpur', 'Maharashtra', '440012'),
('Dharampeth', 'Nagpur', 'Maharashtra', '440010'),
('Sadar', 'Nagpur', 'Maharashtra', '440001'),
('Itwari', 'Nagpur', 'Maharashtra', '440002'),
('Hingna Road', 'Nagpur', 'Maharashtra', '440016'),
('Manish Nagar', 'Nagpur', 'Maharashtra', '440015'),
('Wardha Road', 'Nagpur', 'Maharashtra', '440025'),
('Amravati Road', 'Nagpur', 'Maharashtra', '440033'),
('Kamptee Road', 'Nagpur', 'Maharashtra', '440026'),
('Civil Lines', 'Nagpur', 'Maharashtra', '440001'),
('Ramdaspeth', 'Nagpur', 'Maharashtra', '440010'),
('Mahal', 'Nagpur', 'Maharashtra', '440032'),
('Gandhibagh', 'Nagpur', 'Maharashtra', '440002'),
('Nandanvan', 'Nagpur', 'Maharashtra', '440009'),
('Pratap Nagar', 'Nagpur', 'Maharashtra', '440022'),
('Shankar Nagar', 'Nagpur', 'Maharashtra', '440013'),
('Bajaj Nagar', 'Nagpur', 'Maharashtra', '440010'),
('Manewada', 'Nagpur', 'Maharashtra', '440027'),
('Koradi Road', 'Nagpur', 'Maharashtra', '440013'),
('Katol Road', 'Nagpur', 'Maharashtra', '440013')
ON CONFLICT DO NOTHING;