import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { X, User, Wrench, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

type UserRole = 'customer' | 'provider' | 'admin';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const roleOptions = [
    {
      id: 'customer' as UserRole,
      title: 'Customer',
      description: 'Book services from providers',
      icon: <User className="h-6 w-6" />,
      color: 'blue'
    },
    {
      id: 'provider' as UserRole,
      title: 'Service Provider',
      description: 'Offer your services to customers',
      icon: <Wrench className="h-6 w-6" />,
      color: 'green'
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      description: 'Manage platform and users',
      icon: <Shield className="h-6 w-6" />,
      color: 'red'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        // For admin signup, check if email is admin email
        if (selectedRole === 'admin' && email !== 'ashish15.nehamaiyah@gmail.com') {
          throw new Error('Admin access is restricted to authorized personnel only');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create service provider profile if role is provider
          if (selectedRole === 'provider') {
            const { error: providerError } = await supabase
              .from('service_providers')
              .insert([
                {
                  user_id: authData.user.id,
                  name: email.split('@')[0],
                  category: 'New Provider',
                  available: false // Set to false initially until profile is completed
                }
              ]);

            if (providerError) throw providerError;
          }

          toast.success('Account created successfully!');
          
          if (selectedRole === 'provider') {
            toast.success('Please complete your provider profile');
            navigate('/provider-registration');
          } else if (selectedRole === 'admin') {
            navigate('/admin');
          } else {
            navigate('/profile');
          }
        }
      } else {
        // Sign in logic
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check user role and redirect accordingly
        if (selectedRole === 'admin') {
          if (email !== 'ashish15.nehamaiyah@gmail.com') {
            await supabase.auth.signOut();
            throw new Error('Admin access denied');
          }
          toast.success('Admin login successful');
          navigate('/admin');
        } else if (selectedRole === 'provider') {
          // Check if user is a service provider
          const { data: providerData, error: providerError } = await supabase
            .from('service_providers')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

          if (providerError || !providerData) {
            await supabase.auth.signOut();
            throw new Error('This account is not registered as a service provider');
          }

          toast.success('Provider login successful');
          navigate('/provider-dashboard');
        } else {
          // Customer login
          toast.success('Login successful');
          navigate('/profile');
        }
      }

      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSelectedRole('customer');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>

          {/* Role Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Select your role:</h3>
            <div className="grid grid-cols-1 gap-3">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    selectedRole === role.id
                      ? `border-${role.color}-500 bg-${role.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 ${
                      selectedRole === role.id 
                        ? `text-${role.color}-600` 
                        : 'text-gray-400'
                    }`}>
                      {role.icon}
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        selectedRole === role.id 
                          ? `text-${role.color}-900` 
                          : 'text-gray-900'
                      }`}>
                        {role.title}
                      </h4>
                      <p className={`text-sm ${
                        selectedRole === role.id 
                          ? `text-${role.color}-700` 
                          : 'text-gray-500'
                      }`}>
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder={selectedRole === 'admin' ? 'ashish15.nehamaiyah@gmail.com' : 'Enter your email'}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Role-specific notices */}
            {selectedRole === 'admin' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">
                    Admin access is restricted to authorized personnel only.
                  </p>
                </div>
              </div>
            )}

            {selectedRole === 'provider' && mode === 'signup' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center">
                  <Wrench className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">
                    After signup, you'll be redirected to complete your provider profile.
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-6"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;