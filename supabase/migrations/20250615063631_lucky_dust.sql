/*
  # Add contacts table for contact form submissions

  1. New Tables
    - contacts
      - id (uuid, primary key)
      - name (text)
      - email (text)
      - phone (text)
      - subject (text)
      - message (text)
      - service_type (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for inserting contact forms
*/

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

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit contact forms
CREATE POLICY "Anyone can submit contact forms"
  ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users (admins) can view contact submissions
CREATE POLICY "Only authenticated users can view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);