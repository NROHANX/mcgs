-- Insert admin user (this will be created via auth, but we prepare the user record)
-- The actual auth user will be created through the application
INSERT INTO users (email, full_name, user_type, status) 
VALUES ('admin@mcgs.com', 'MCGS Admin', 'admin', 'approved')
ON CONFLICT (email) DO NOTHING;