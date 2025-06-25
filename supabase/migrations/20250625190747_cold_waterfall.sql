/*
  # Admin Approval System Migration

  1. New Tables
    - `admin_management` - Stores admin user information
    - `user_registration_requests` - Stores pending registration requests
    - `user_approval_status` - Tracks user approval status after account creation

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access control
    - Add policies for user registration workflow

  3. Functions
    - Add trigger function for updating timestamps
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Admins can view admin management" ON admin_management;
  DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_management;
  DROP POLICY IF EXISTS "Anyone can create registration requests" ON user_registration_requests;
  DROP POLICY IF EXISTS "Admins can view all registration requests" ON user_registration_requests;
  DROP POLICY IF EXISTS "Admins can update registration requests" ON user_registration_requests;
  DROP POLICY IF EXISTS "Users can view their own approval status" ON user_approval_status;
  DROP POLICY IF EXISTS "Admins can view all approval statuses" ON user_approval_status;
  DROP POLICY IF EXISTS "Admins can manage approval statuses" ON user_approval_status;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create admin_management table
CREATE TABLE IF NOT EXISTS admin_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create user_registration_requests table
CREATE TABLE IF NOT EXISTS user_registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'provider')),
  provider_details jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  approved_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_approval_status table
CREATE TABLE IF NOT EXISTS user_approval_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'provider')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_approval_status ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_management
CREATE POLICY "Admins can view admin management"
  ON admin_management
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management am 
      WHERE am.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_management
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management am 
      WHERE am.user_id = auth.uid() AND am.role = 'super_admin'
    )
  );

-- Create policies for user_registration_requests
CREATE POLICY "Anyone can create registration requests"
  ON user_registration_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all registration requests"
  ON user_registration_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update registration requests"
  ON user_registration_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_management 
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for user_approval_status
CREATE POLICY "Users can view their own approval status"
  ON user_approval_status
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all approval statuses"
  ON user_approval_status
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage approval statuses"
  ON user_approval_status
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management 
      WHERE user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_registration_requests
DROP TRIGGER IF EXISTS update_user_registration_requests_updated_at ON user_registration_requests;
CREATE TRIGGER update_user_registration_requests_updated_at
  BEFORE UPDATE ON user_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert super admin (replace with your actual admin email)
INSERT INTO admin_management (user_id, email, role)
SELECT 
  id,
  email,
  'super_admin'
FROM auth.users 
WHERE email = 'ashish15.nehamaiyah@gmail.com'
ON CONFLICT (user_id) DO NOTHING;