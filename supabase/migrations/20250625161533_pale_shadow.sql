/*
  # Complete platform schema with support tickets, user roles, earnings, and payments

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, required)
      - `description` (text, required)
      - `category` (text, required with constraints)
      - `priority` (text, default 'medium' with constraints)
      - `status` (text, default 'open' with constraints)
      - `assigned_to` (uuid, references auth.users, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `resolved_at` (timestamp, optional)

    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `role` (text, default 'customer' with constraints)
      - `permissions` (jsonb, default '{}')
      - `assigned_by` (uuid, references auth.users, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `earnings`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, references service_providers)
      - `booking_id` (uuid, references bookings)
      - `gross_amount` (numeric, required)
      - `platform_fee` (numeric, default 0)
      - `net_amount` (numeric, required)
      - `status` (text, default 'pending' with constraints)
      - `payment_date` (timestamp, optional)
      - `created_at` (timestamp)

    - `payments`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, references service_providers)
      - `amount` (numeric, required)
      - `payment_method` (text, required)
      - `transaction_id` (text, optional)
      - `status` (text, default 'pending' with constraints)
      - `processed_by` (uuid, references auth.users, optional)
      - `created_at` (timestamp)
      - `processed_at` (timestamp, optional)

  2. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for each table
    - Ensure proper access control for different user roles

  3. Functions and Triggers
    - Auto-create earnings records when bookings are completed
    - Auto-update timestamps on record changes
    - Proper error handling and data integrity

  4. Default Data
    - Create super admin role for authorized user
*/

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('technical', 'billing', 'general', 'booking', 'account')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('super_admin', 'admin', 'employee', 'support_staff', 'customer_care', 'booking_staff', 'service_provider', 'customer')),
  permissions jsonb DEFAULT '{}',
  assigned_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create earnings table for detailed tracking
CREATE TABLE IF NOT EXISTS earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers NOT NULL,
  booking_id uuid REFERENCES bookings NOT NULL,
  gross_amount numeric NOT NULL,
  platform_fee numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'on_hold')),
  payment_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create payments table for tracking payments to providers
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  transaction_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  processed_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS on new tables (only if not already enabled)
DO $$
BEGIN
  -- Enable RLS for support_tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'support_tickets' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS for user_roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'user_roles' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS for earnings
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'earnings' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS for payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'payments' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Support tickets policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'support_tickets' 
    AND policyname = 'Users can view their own tickets'
  ) THEN
    CREATE POLICY "Users can view their own tickets"
      ON support_tickets
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR assigned_to = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'support_tickets' 
    AND policyname = 'Users can create their own tickets'
  ) THEN
    CREATE POLICY "Users can create their own tickets"
      ON support_tickets
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'support_tickets' 
    AND policyname = 'Users can update their own tickets'
  ) THEN
    CREATE POLICY "Users can update their own tickets"
      ON support_tickets
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid() OR assigned_to = auth.uid());
  END IF;

  -- User roles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' 
    AND policyname = 'Users can view their own role'
  ) THEN
    CREATE POLICY "Users can view their own role"
      ON user_roles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' 
    AND policyname = 'Admins can manage all roles'
  ) THEN
    CREATE POLICY "Admins can manage all roles"
      ON user_roles
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('super_admin', 'admin')
        )
      );
  END IF;

  -- Earnings policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'earnings' 
    AND policyname = 'Providers can view their own earnings'
  ) THEN
    CREATE POLICY "Providers can view their own earnings"
      ON earnings
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM service_providers sp
          WHERE sp.id = provider_id
          AND sp.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'earnings' 
    AND policyname = 'Admins can view all earnings'
  ) THEN
    CREATE POLICY "Admins can view all earnings"
      ON earnings
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('super_admin', 'admin', 'employee')
        )
      );
  END IF;

  -- Payments policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Providers can view their own payments'
  ) THEN
    CREATE POLICY "Providers can view their own payments"
      ON payments
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM service_providers sp
          WHERE sp.id = provider_id
          AND sp.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Admins can manage all payments'
  ) THEN
    CREATE POLICY "Admins can manage all payments"
      ON payments
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('super_admin', 'admin', 'employee')
        )
      );
  END IF;
END $$;

-- Create or replace function to automatically create earnings record when booking is completed
CREATE OR REPLACE FUNCTION create_earnings_record()
RETURNS TRIGGER AS $$
DECLARE
  platform_fee_rate NUMERIC := 0.10; -- 10% platform fee
  gross_amt NUMERIC;
  platform_fee_amt NUMERIC;
  net_amt NUMERIC;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    gross_amt := NEW.amount;
    platform_fee_amt := gross_amt * platform_fee_rate;
    net_amt := gross_amt - platform_fee_amt;
    
    -- Check if earnings record already exists for this booking
    IF NOT EXISTS (SELECT 1 FROM earnings WHERE booking_id = NEW.id) THEN
      INSERT INTO earnings (provider_id, booking_id, gross_amount, platform_fee, net_amount)
      VALUES (NEW.provider_id, NEW.id, gross_amt, platform_fee_amt, net_amt);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and create new ones
DROP TRIGGER IF EXISTS create_earnings_trigger ON bookings;
CREATE TRIGGER create_earnings_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION create_earnings_record();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default super admin role (only if user exists and role doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'ashish15.nehamaiyah@gmail.com') THEN
    INSERT INTO user_roles (user_id, role, permissions)
    SELECT id, 'super_admin', '{"all": true}'::jsonb
    FROM auth.users
    WHERE email = 'ashish15.nehamaiyah@gmail.com'
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'super_admin',
      permissions = '{"all": true}'::jsonb,
      updated_at = now();
  END IF;
END $$;