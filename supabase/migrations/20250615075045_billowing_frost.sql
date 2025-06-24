/*
  # Create contacts table for contact form submissions

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `subject` (text, required)
      - `message` (text, required)
      - `service_type` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `contacts` table
    - Add policy for public to submit contact forms
    - Add policy for authenticated users to view contacts
    - Add policy for admins to delete contacts
*/

-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  service_type text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'contacts' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Policy for anyone to submit contact forms
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Anyone can submit contact forms'
  ) THEN
    CREATE POLICY "Anyone can submit contact forms"
      ON contacts
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  -- Policy for authenticated users to view contacts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Only authenticated users can view contacts'
  ) THEN
    CREATE POLICY "Only authenticated users can view contacts"
      ON contacts
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Policy for admins to delete contacts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Admins can delete contacts'
  ) THEN
    CREATE POLICY "Admins can delete contacts"
      ON contacts
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;