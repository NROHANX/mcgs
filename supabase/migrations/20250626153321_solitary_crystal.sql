/*
  # Create Admin and Support Tables

  1. New Tables
    - `support_tickets` - Customer support tickets
    - `user_roles` - User role management
    - `admin_management` - Admin user management

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Support Tickets table
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('technical', 'billing', 'general', 'booking', 'account')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) NOT NULL,
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can create their own tickets"
  ON support_tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets"
  ON support_tickets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR assigned_to = auth.uid());

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User Roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  role text DEFAULT 'customer' CHECK (role IN ('super_admin', 'admin', 'employee', 'support_staff', 'customer_care', 'booking_staff', 'service_provider', 'customer')) NOT NULL,
  permissions jsonb DEFAULT '{}',
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'admin')
    )
  );

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Admin Management table
CREATE TABLE admin_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  email text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_management ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin management"
  ON admin_management FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management am
      WHERE am.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_management FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_management am
      WHERE am.user_id = auth.uid() 
      AND am.role = 'super_admin'
    )
  );