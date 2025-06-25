/*
  # Admin Approval System Migration

  1. New Tables
    - `user_registration_requests` - Stores registration requests from users
    - `admin_management` - Manages admin users and their roles
    - `user_approval_status` - Tracks approval status of users

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access control
    - Add policies for user registration workflow

  3. Functions
    - `approve_user_registration` - Function to approve user registrations
    - `reject_user_registration` - Function to reject user registrations
    - `update_updated_at_column` - Trigger function for timestamp updates

  4. Changes
    - All user registrations now require admin approval
    - Admins can manage registration requests through admin panel
    - Users receive approval status updates
*/

-- Create user_registration_requests table
CREATE TABLE IF NOT EXISTS user_registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'provider')),
  provider_details jsonb, -- Store provider-specific details if user_type is 'provider'
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  approved_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_management table for admin users
CREATE TABLE IF NOT EXISTS admin_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create user_approval_status table
CREATE TABLE IF NOT EXISTS user_approval_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'provider')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE user_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_approval_status ENABLE ROW LEVEL SECURITY;

-- Policies for user_registration_requests
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
      WHERE admin_management.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update registration requests"
  ON user_registration_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
    )
  );

-- Policies for admin_management
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
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
      AND admin_management.role = 'super_admin'
    )
  );

-- Policies for user_approval_status
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
      WHERE admin_management.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage approval statuses"
  ON user_approval_status
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management
      WHERE admin_management.user_id = auth.uid()
    )
  );

-- Create or update trigger function for updated_at timestamp
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

-- Create function to approve user registration
CREATE OR REPLACE FUNCTION approve_user_registration(
  request_id uuid,
  admin_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record user_registration_requests%ROWTYPE;
BEGIN
  -- Check if the admin user exists
  IF NOT EXISTS (
    SELECT 1 FROM admin_management WHERE user_id = admin_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  -- Get the registration request
  SELECT * INTO request_record
  FROM user_registration_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration request not found or already processed';
  END IF;

  -- Update request status
  UPDATE user_registration_requests
  SET 
    status = 'approved',
    approved_by = admin_user_id,
    updated_at = now()
  WHERE id = request_id;

  -- Note: In a real implementation, you would need to:
  -- 1. Create the user via Supabase Auth API
  -- 2. Get the new user ID
  -- 3. Create the approval status record
  -- 4. If provider, create service_provider record
END;
$$;

-- Create function to reject user registration
CREATE OR REPLACE FUNCTION reject_user_registration(
  request_id uuid,
  admin_user_id uuid,
  rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the admin user exists
  IF NOT EXISTS (
    SELECT 1 FROM admin_management WHERE user_id = admin_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  -- Update request status
  UPDATE user_registration_requests
  SET 
    status = 'rejected',
    approved_by = admin_user_id,
    admin_notes = rejection_reason,
    updated_at = now()
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration request not found or already processed';
  END IF;
END;
$$;

-- Insert default super admin if the user exists
DO $$
BEGIN
  -- Check if the admin email exists in auth.users and insert into admin_management
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'ashish15.nehamaiyah@gmail.com') THEN
    INSERT INTO admin_management (user_id, email, role)
    SELECT id, email, 'super_admin'
    FROM auth.users
    WHERE email = 'ashish15.nehamaiyah@gmail.com'
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;