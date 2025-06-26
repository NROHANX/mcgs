/*
  # Safe database cleanup migration
  
  This migration safely clears data from existing tables without failing if tables don't exist.
  It uses conditional logic to only truncate tables that actually exist in the database.
*/

-- Function to safely truncate a table if it exists
CREATE OR REPLACE FUNCTION safe_truncate_table(table_name text)
RETURNS void AS $$
BEGIN
  -- Check if table exists before truncating
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = safe_truncate_table.table_name
  ) THEN
    EXECUTE format('TRUNCATE TABLE %I CASCADE', table_name);
    RAISE NOTICE 'Truncated table: %', table_name;
  ELSE
    RAISE NOTICE 'Table % does not exist, skipping', table_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Disable triggers temporarily to avoid cascading issues
SET session_replication_role = replica;

-- Clear all data from tables in correct order (respecting foreign key constraints)
-- Only truncate tables that exist
SELECT safe_truncate_table('booking_assignments');
SELECT safe_truncate_table('provider_service_areas');
SELECT safe_truncate_table('provider_categories');
SELECT safe_truncate_table('service_bookings');
SELECT safe_truncate_table('earnings');
SELECT safe_truncate_table('payments');
SELECT safe_truncate_table('reviews');
SELECT safe_truncate_table('services');
SELECT safe_truncate_table('service_providers');
SELECT safe_truncate_table('support_tickets');
SELECT safe_truncate_table('user_roles');
SELECT safe_truncate_table('admin_management');
SELECT safe_truncate_table('contacts');
SELECT safe_truncate_table('bookings');
SELECT safe_truncate_table('users');
SELECT safe_truncate_table('service_categories');
SELECT safe_truncate_table('service_areas');

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Clean up the helper function
DROP FUNCTION IF EXISTS safe_truncate_table(text);

-- Note: auth.users data cannot be directly manipulated from SQL migrations
-- This will be handled by the application code when needed