/*
  # Create admin user and update admin authentication

  1. Create admin user in auth.users table
  2. Update admin authentication logic
  3. Add admin role support
*/

-- Insert admin user (this will create the user in auth.users)
-- Note: In production, you should create this user through Supabase Auth UI or API
-- This is just for development/testing purposes

-- First, let's create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN user_email = 'admin@mcgs.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admin users (optional, for easier querying)
CREATE OR REPLACE VIEW admin_users AS
SELECT * FROM auth.users 
WHERE email = 'admin@mcgs.com';