/*
  # Add Complete Address Field

  1. Changes
    - Add `complete_address` column to `service_providers` table
    - This field will store the full address details for both providers and customers

  2. Security
    - No changes to existing RLS policies needed
    - The field follows the same access patterns as other profile fields
*/

-- Add complete_address column to service_providers table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'service_providers' AND column_name = 'complete_address'
  ) THEN
    ALTER TABLE service_providers ADD COLUMN complete_address text;
  END IF;
END $$;