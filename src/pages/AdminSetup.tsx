import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, User, Mail, Lock, Trash2, Users, Wrench, Database, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import { setupAllUsers, createAdminUser, createProviderUser, createCustomerUser, clearDatabase } from '../utils/setupUsers';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [testingLogin, setTestingLogin] = useState<string | null>(null);

  const credentials = {
    admin: {
      email: 'worldecare@gmail.com',
      password: 'Rohan@123',
      role: 'Admin'
    },
    provider: {
      email: 'nexterplus.com@gmail.com',
      password: 'Rohan@123',
      role: 'Service Provider'
    },
    customer: {
      email: 'customer@mcgs.com',
      password: 'Rohan@123',
      role: 'Customer'
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    try {
      const result = await clearDatabase();
      
      if (result.success) {
        toast.success('Database cleared successfully!');
        setSetupComplete(false);
      } else {
        toast.error(result.error || 'Failed to clear database');
      }
    } catch (error) {
      toast.error('Error clearing database');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupUsers = async () => {
    setLoading(true);
    try {
      const result = await setupAllUsers();
      
      if (result.success) {
        setSetupComplete(true);
        toast.success('All users created successfully!');
        toast.success('You can now test login with any of the accounts');
      } else {
        toast.error(result.error || 'Failed to setup users');
      }
    } catch (error) {
      toast.error('Error setting up users');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (email: string, password: string, userType: string) => {
    setTestingLogin(userType);
    try {
      // First sign out any existing session
      await supabase.auth.signOut();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
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

      if (userProfile.status !== 'approved') {
        throw new Error('User is not approved');
      }

      toast.success(`${userType} login successful!`);
      
      // Redirect based on user type
      setTimeout(() => {
        if (userProfile.user_type === 'admin') {
          window.location.href = '/admin';
        } else if (userProfile.user_type === 'provider') {
          window.location.href = '/provider-dashboard';
        } else {
          window.location.href = '/profile';
        }
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setTestingLogin(null);
    }
  };

  const handleCreateSingleUser = async (userType: 'admin' | 'provider' | 'customer') => {
    setLoading(true);
    try {
      let result;
      switch (userType) {
        case 'admin':
          result = await createAdminUser();
          break;
        case 'provider':
          result = await createProviderUser();
          break;
        case 'customer':
          result = await createCustomerUser();
          break;
      }
      
      if (result.success) {
        toast.success(`${userType} user created successfully!`);
      } else {
        toast.error(result.error || `Failed to create ${userType} user`);
      }
    } catch (error) {
      toast.error(`Error creating ${userType} user`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">MCGS Database Setup</h2>
            <p className="text-gray-600 mt-2">Clear database and create test users with your specified credentials</p>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button
              onClick={handleClearData}
              disabled={loading}
              variant="outline"
              className="py-4 border-red-300 text-red-600 hover:bg-red-50"
              icon={<Trash2 className="h-5 w-5" />}
            >
              {loading ? 'Clearing...' : 'Clear Database'}
            </Button>

            <Button
              onClick={handleSetupUsers}
              disabled={loading}
              className="py-4"
              icon={<Users className="h-5 w-5" />}
            >
              {loading ? 'Setting up...' : 'Setup All Users'}
            </Button>
          </div>

          {/* Individual User Creation */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Or Create Individual Users</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleCreateSingleUser('admin')}
                disabled={loading}
                variant="outline"
                className="py-3 border-red-300 text-red-600 hover:bg-red-50"
                icon={<Shield className="h-4 w-4" />}
              >
                Create Admin Only
              </Button>
              
              <Button
                onClick={() => handleCreateSingleUser('provider')}
                disabled={loading}
                variant="outline"
                className="py-3 border-blue-300 text-blue-600 hover:bg-blue-50"
                icon={<Wrench className="h-4 w-4" />}
              >
                Create Provider Only
              </Button>
              
              <Button
                onClick={() => handleCreateSingleUser('customer')}
                disabled={loading}
                variant="outline"
                className="py-3 border-green-300 text-green-600 hover:bg-green-50"
                icon={<User className="h-4 w-4" />}
              >
                Create Customer Only
              </Button>
            </div>
          </div>

          {/* Credentials Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Admin Credentials */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="font-bold text-red-900">Admin User</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-red-600" />
                  <span className="font-mono text-xs break-all">{credentials.admin.email}</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-red-600" />
                  <span className="font-mono">{credentials.admin.password}</span>
                </div>
              </div>
              <Button
                onClick={() => handleTestLogin(credentials.admin.email, credentials.admin.password, 'Admin')}
                disabled={loading || testingLogin !== null}
                size="sm"
                className="mt-4 w-full bg-red-600 hover:bg-red-700"
                icon={testingLogin === 'Admin' ? <RefreshCw className="h-4 w-4 animate-spin" /> : undefined}
              >
                {testingLogin === 'Admin' ? 'Testing...' : 'Test Admin Login'}
              </Button>
            </div>

            {/* Provider Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Wrench className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="font-bold text-blue-900">Provider User</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-mono text-xs break-all">{credentials.provider.email}</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-mono">{credentials.provider.password}</span>
                </div>
              </div>
              <Button
                onClick={() => handleTestLogin(credentials.provider.email, credentials.provider.password, 'Provider')}
                disabled={loading || testingLogin !== null}
                size="sm"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                icon={testingLogin === 'Provider' ? <RefreshCw className="h-4 w-4 animate-spin" /> : undefined}
              >
                {testingLogin === 'Provider' ? 'Testing...' : 'Test Provider Login'}
              </Button>
            </div>

            {/* Customer Credentials */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="font-bold text-green-900">Customer User</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-mono text-xs break-all">{credentials.customer.email}</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-mono">{credentials.customer.password}</span>
                </div>
              </div>
              <Button
                onClick={() => handleTestLogin(credentials.customer.email, credentials.customer.password, 'Customer')}
                disabled={loading || testingLogin !== null}
                size="sm"
                className="mt-4 w-full bg-green-600 hover:bg-green-700"
                icon={testingLogin === 'Customer' ? <RefreshCw className="h-4 w-4 animate-spin" /> : undefined}
              >
                {testingLogin === 'Customer' ? 'Testing...' : 'Test Customer Login'}
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {setupComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  ✅ All users created successfully! You can now test login with any of the accounts above.
                </p>
              </div>
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <div className="text-orange-800 text-sm">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Clear Database</strong> - Removes all existing users and data from your Supabase tables</li>
                  <li><strong>Setup All Users</strong> - Creates all three test accounts with approved status</li>
                  <li><strong>Individual Creation</strong> - Create specific user types one at a time</li>
                  <li><strong>Test Login</strong> - Verify each account works and redirects correctly</li>
                  <li>All users are created with "approved" status for immediate access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-blue-600 mr-2" />
              <div className="text-blue-800 text-sm">
                <p className="font-medium mb-1">Database Status:</p>
                <p>Connected to Supabase. Tables will be created automatically when you run setup.</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 text-center space-x-4">
            <a 
              href="/admin" 
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Admin Dashboard →
            </a>
            <a 
              href="/provider-dashboard" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Provider Dashboard →
            </a>
            <a 
              href="/" 
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Home Page →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;