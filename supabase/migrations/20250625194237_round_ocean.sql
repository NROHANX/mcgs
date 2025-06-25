/*
  # Fix contacts table migration

  1. Tables
    - Create contacts table if it doesn't exist
    - Add proper columns and constraints

  2. Security
    - Enable RLS on contacts table
    - Create policies for public insert and admin access
    - Handle existing policies gracefully

  3. Changes
    - Use IF NOT EXISTS for policies to avoid conflicts
    - Ensure proper permissions for contact form submissions
*/

-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contacts;
DROP POLICY IF EXISTS "Only authenticated users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON contacts;

-- Create policies
CREATE POLICY "Anyone can submit contact forms"
  ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can delete contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin' 
      AND status = 'approved'
    )
  );