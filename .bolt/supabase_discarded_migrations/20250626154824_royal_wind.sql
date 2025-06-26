/*
  # Reset Database - Clear All Data

  1. Clear all existing data from tables
  2. Reset sequences and constraints
  3. Prepare for fresh data insertion

  This migration will completely clear all existing data while preserving the table structure.
*/

-- Disable triggers temporarily to avoid cascading issues
SET session_replication_role = replica;

-- Clear all data from tables in correct order (respecting foreign key constraints)
TRUNCATE TABLE booking_assignments CASCADE;
TRUNCATE TABLE provider_service_areas CASCADE;
TRUNCATE TABLE provider_categories CASCADE;
TRUNCATE TABLE service_bookings CASCADE;
TRUNCATE TABLE earnings CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE services CASCADE;
TRUNCATE TABLE service_providers CASCADE;
TRUNCATE TABLE support_tickets CASCADE;
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE admin_management CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE service_categories CASCADE;
TRUNCATE TABLE service_areas CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Clear any auth.users data (this will be handled by the application)
-- Note: We cannot directly manipulate auth.users from SQL migrations
-- This will be handled by the application code