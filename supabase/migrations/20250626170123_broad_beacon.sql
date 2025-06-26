/*
  # Create admin management table

  1. New Tables
    - `admin_management`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users, unique)
      - `email` (text, not null)
      - `role` (text, not null, default: admin)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `admin_management` table
    - Add policies for admins to view admin management
    - Add policies for super admins to manage admin users
</sql>

-- Create admin management table
CREATE TABLE IF NOT EXISTS admin_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_management ENABLE ROW LEVEL SECURITY;

-- Create policies
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
      WHERE am.user_id = auth.uid() 
      AND am.role = 'super_admin'
    )
  );