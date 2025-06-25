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

-- Enable RLS on new tables
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Support tickets policies
CREATE POLICY "Users can view their own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can create their own tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR assigned_to = auth.uid());

-- User roles policies
CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

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

-- Earnings policies
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

-- Payments policies
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

-- Create function to automatically create earnings record when booking is completed
CREATE OR REPLACE FUNCTION create_earnings_record()
RETURNS TRIGGER AS $$
DECLARE
  platform_fee_rate NUMERIC := 0.10; -- 10% platform fee
  gross_amt NUMERIC;
  platform_fee_amt NUMERIC;
  net_amt NUMERIC;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    gross_amt := NEW.amount;
    platform_fee_amt := gross_amt * platform_fee_rate;
    net_amt := gross_amt - platform_fee_amt;
    
    INSERT INTO earnings (provider_id, booking_id, gross_amount, platform_fee, net_amount)
    VALUES (NEW.provider_id, NEW.id, gross_amt, platform_fee_amt, net_amt);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for earnings
DROP TRIGGER IF EXISTS create_earnings_trigger ON bookings;
CREATE TRIGGER create_earnings_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION create_earnings_record();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Insert default super admin role (only if user exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'ashish15.nehamaiyah@gmail.com') THEN
    INSERT INTO user_roles (user_id, role, permissions)
    SELECT id, 'super_admin', '{"all": true}'::jsonb
    FROM auth.users
    WHERE email = 'ashish15.nehamaiyah@gmail.com'
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'super_admin',
      permissions = '{"all": true}'::jsonb;
  END IF;
END $$;