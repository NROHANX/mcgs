import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, User, Mail, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import { createAdminUser } from '../utils/createAdminUser';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);
  const [loginData, setLoginData] = useState({
    email: 'worldecare@gmail.com',
    password: 'admin123456'
  });

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const result = await createAdminUser();
      
      if (result.success) {
        setAdminCreated(true);
        toast.success('Admin user created successfully!');
      } else {
        toast.error(result.error || 'Failed to create admin user');
      }
    } catch (error) {
      toast.error('Error creating admin user');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError) throw authError;

      // Check user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error('User profile not found');
      }

      if (userProfile.user_type !== 'admin' || userProfile.status !== 'approved') {
        throw new Error('User is not an approved admin');
      }

      toast.success('Admin login successful!');
      window.location.href = '/admin';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Setup</h2>
            <p className="text-gray-600 mt-2">Set up the admin user for MCGS platform</p>
          </div>

          {!adminCreated ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Admin Credentials</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Email: worldecare@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Password: admin123456</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <p className="text-orange-800 text-sm">
                    This will create an admin user with full platform access. Make sure to change the password after first login.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreateAdmin}
                disabled={loading}
                fullWidth
                className="py-3"
                icon={<User className="h-5 w-5" />}
              >
                {loading ? 'Creating Admin User...' : 'Create Admin User'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800 font-medium">Admin user created successfully!</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <Button
                  onClick={handleTestLogin}
                  disabled={loading}
                  fullWidth
                  className="py-3"
                  icon={<Shield className="h-5 w-5" />}
                >
                  {loading ? 'Testing Login...' : 'Test Admin Login'}
                </Button>
              </div>

              <div className="text-center">
                <a 
                  href="/admin" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Go to Admin Dashboard →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;