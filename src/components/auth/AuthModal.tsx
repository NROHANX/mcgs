import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, UserPlus, AlertTriangle, Wrench, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [userType, setUserType] = useState<'customer' | 'provider' | 'admin'>('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        // First check if user already exists in our users table
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('email, user_type, status')
          .eq('email', formData.email)
          .single();

        if (existingUser) {
          if (existingUser.user_type !== userType) {
            throw new Error(`An account with this email already exists as a ${existingUser.user_type}. Please select the correct role or use a different email.`);
          }
          
          if (existingUser.status === 'pending') {
            throw new Error('An account with this email is already registered and pending approval. Please wait for admin approval or contact support.');
          } else if (existingUser.status === 'approved') {
            throw new Error('An account with this email already exists and is approved. Please sign in instead.');
          } else if (existingUser.status === 'rejected') {
            throw new Error('An account with this email was previously rejected. Please contact support.');
          }
        }

        // Try to create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) {
          // Handle specific auth errors more gracefully
          if (authError.message.includes('already registered') || 
              authError.message.includes('already exists') ||
              authError.message.includes('User already registered')) {
            
            // The user exists in auth but maybe not in our users table
            // Try to sign them in to get their auth ID
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });

            if (signInData.user) {
              // User exists in auth and password is correct
              // Check if they have a profile in our users table
              const { data: userProfile, error: profileCheckError } = await supabase
                .from('users')
                .select('*')
                .eq('id', signInData.user.id)
                .single();

              // Sign them out immediately
              await supabase.auth.signOut();

              if (userProfile) {
                // User has a complete profile
                if (userProfile.user_type !== userType) {
                  throw new Error(`This email is already registered as a ${userProfile.user_type}. Please select the correct role or use a different email.`);
                }
                throw new Error(`Account already exists with this email. Please sign in instead.`);
              } else {
                // User exists in auth but no profile - create the missing profile
                const { error: profileError } = await supabase
                  .from('users')
                  .insert([
                    {
                      id: signInData.user.id,
                      email: formData.email,
                      full_name: formData.fullName,
                      user_type: userType,
                      status: 'pending'
                    }
                  ]);

                if (profileError) {
                  console.error('Profile creation failed:', profileError);
                  throw new Error('Failed to complete registration. Please contact support.');
                }

                toast.success('Registration completed! Your account is pending admin approval.');
                toast.info('You will receive an email once your account is approved.');
                
                onClose();
                resetForm();
                return;
              }
            } else {
              // User exists in auth but password is wrong
              throw new Error('An account with this email already exists. Please sign in with the correct password or use a different email.');
            }
          }
          
          // Other auth errors
          throw authError;
        }

        if (authData.user) {
          // Create user profile (pending approval)
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                email: formData.email,
                full_name: formData.fullName,
                user_type: userType,
                status: 'pending'
              }
            ]);

          if (profileError) {
            console.error('Profile creation failed:', profileError);
            throw new Error('Registration failed. Please contact support.');
          }

          toast.success('Registration successful! Your account is pending admin approval.');
          toast.info('You will receive an email once your account is approved.');
          
          // Sign out the user since they need approval
          await supabase.auth.signOut();
        }
      } else {
        // Sign in
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        // Check if user exists and get their profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError || !userProfile) {
          await supabase.auth.signOut();
          throw new Error('User profile not found. Please contact support.');
        }

        // Check if user type matches selected role
        if (userProfile.user_type !== userType) {
          await supabase.auth.signOut();
          throw new Error(`This account is registered as a ${userProfile.user_type}. Please select the correct role.`);
        }

        if (userProfile.status !== 'approved') {
          await supabase.auth.signOut();
          if (userProfile.status === 'rejected') {
            throw new Error('Your account has been rejected. Please contact support.');
          } else {
            throw new Error('Your account is pending approval. Please wait for admin approval.');
          }
        }

        toast.success('Login successful!');
      }

      onClose();
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setUserType('customer');
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer':
        return <User className="h-5 w-5" />;
      case 'provider':
        return <Wrench className="h-5 w-5" />;
      case 'admin':
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'customer':
        return 'Book services from providers';
      case 'provider':
        return 'Offer your services to customers';
      case 'admin':
        return 'Manage platform and users';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your role:
            </label>
            <div className="space-y-3">
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  userType === 'customer'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    userType === 'customer' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`font-medium ${
                      userType === 'customer' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Customer
                    </div>
                    <div className={`text-sm ${
                      userType === 'customer' ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      Book services from providers
                    </div>
                  </div>
                </div>
              </button>

              {/* Service Provider Option */}
              <button
                type="button"
                onClick={() => setUserType('provider')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  userType === 'provider'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    userType === 'provider' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`font-medium ${
                      userType === 'provider' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Service Provider
                    </div>
                    <div className={`text-sm ${
                      userType === 'provider' ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      Offer your services to customers
                    </div>
                  </div>
                </div>
              </button>

              {/* Admin Option */}
              <button
                type="button"
                onClick={() => setUserType('admin')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  userType === 'admin'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    userType === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`font-medium ${
                      userType === 'admin' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Admin
                    </div>
                    <div className={`text-sm ${
                      userType === 'admin' ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      Manage platform and users
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Important Notice for Registration */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  <p className="text-sm text-orange-800">
                    <strong>Important:</strong> Your registration will be submitted for admin approval. You will NOT be able to login until an administrator approves your account.
                  </p>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="mt-6"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="px-6 pb-6">
          <div className="text-center">
            <button
              onClick={switchMode}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>
          </div>
          
          {/* Quick Setup Link */}
          <div className="text-center mt-3">
            <a 
              href="/admin-setup" 
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              Admin Setup & Test Accounts →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;