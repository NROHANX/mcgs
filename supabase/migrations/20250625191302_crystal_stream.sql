/*
  # Insert Default Admin User

  1. Data
    - Create default admin user
    - Email: admin@mcgs.com
    - Password will be set via Supabase Auth
*/

-- Insert admin user (this will be created via auth, but we prepare the user record)
-- The actual auth user will be created through the application
INSERT INTO users (email, full_name, user_type, status) 
VALUES ('admin@mcgs.com', 'MCGS Admin', 'admin', 'approved')
ON CONFLICT (email) DO NOTHING;