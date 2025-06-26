/*
  # Reset Database - Drop All Tables

  1. Drop all existing tables and policies
  2. Clean slate for fresh start
*/

-- Drop all existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS booking_assignments CASCADE;
DROP TABLE IF EXISTS provider_service_areas CASCADE;
DROP TABLE IF EXISTS provider_categories CASCADE;
DROP TABLE IF EXISTS service_bookings CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS service_areas CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_approval_status CASCADE;
DROP TABLE IF EXISTS user_registration_requests CASCADE;
DROP TABLE IF EXISTS admin_management CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_earnings_record() CASCADE;
DROP FUNCTION IF EXISTS update_provider_rating() CASCADE;

-- Drop all views
DROP VIEW IF EXISTS admin_users CASCADE;