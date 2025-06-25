import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, MapPin, Phone, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import Button from './Button';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ProviderRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ProviderRegistrationModal: React.FC<ProviderRegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    location: '',
    contact: '',
    experience: ''
  });

  const categories = [
    { 
      value: 'RO Technician', 
      label: 'RO Technician', 
      subcategories: ['Installation', 'Maintenance', 'Repair', 'Filter Replacement'],
      icon: '💧'
    },
    { 
      value: 'AC Technician', 
      label: 'AC Technician', 
      subcategories: ['Installation & Repair', 'Maintenance', 'Gas Refilling', 'Emergency Service'],
      icon: '❄️'
    },
    { 
      value: 'Electrician', 
      label: 'Electrician', 
      subcategories: ['Residential', 'Commercial', 'Industrial', 'Emergency Services'],
      icon: '⚡'
    },
    { 
      value: 'Plumber', 
      label: 'Plumber', 
      subcategories: ['Residential', 'Commercial', 'Emergency Services', 'Pipe Installation'],
      icon: '🔧'
    },
    { 
      value: 'Mechanic', 
      label: 'Mechanic', 
      subcategories: ['Auto Repair', 'Bike Repair', 'Heavy Vehicles', 'Diagnostics'],
      icon: '🔩'
    },
    { 
      value: 'Carpenter', 
      label: 'Carpenter', 
      subcategories: ['Furniture Making', 'Home Renovation', 'Custom Work', 'Repair'],
      icon: '🪚'
    },
    { 
      value: 'Painter', 
      label: 'Painter', 
      subcategories: ['Interior', 'Exterior', 'Commercial', 'Decorative'],
      icon: '🎨'
    },
    { 
      value: 'Cleaner', 
      label: 'Cleaner', 
      subcategories: ['Home Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Post Construction'],
      icon: '🧹'
    }
  ];

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountData.password !== accountData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (accountData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: accountData.email,
        password: accountData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create service provider profile
        const { error: providerError } = await supabase
          .from('service_providers')
          .insert([
            {
              user_id: authData.user.id,
              name: formData.name,
              category: formData.category,
              subcategory: formData.subcategory || null,
              description: formData.description,
              location: formData.location,
              contact: formData.contact,
              available: true
            }
          ]);

        if (providerError) throw providerError;

        toast.success('Successfully registered as a service provider!');
        toast.success('Please check your email to verify your account');
        
        // Reset form
        setAccountData({ email: '', password: '', confirmPassword: '' });
        setFormData({ name: '', category: '', subcategory: '', description: '', location: '', contact: '', experience: '' });
        setCurrentStep(1);
        
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register as a provider');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate account information
      if (!accountData.email || !accountData.password || !accountData.confirmPassword) {
        toast.error('Please fill in all account fields');
        return;
      }
      if (accountData.password !== accountData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (accountData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    } else if (currentStep === 2) {
      // Validate basic information
      if (!formData.name || !formData.category || !formData.contact || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    setAccountData({ email: '', password: '', confirmPassword: '' });
    setFormData({ name: '', category: '', subcategory: '', description: '', location: '', contact: '', experience: '' });
    setCurrentStep(1);
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
          </div>
          {index < 2 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Create Your Account</h3>
        <p className="text-gray-600 text-sm">Set up your login credentials</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="email"
            required
            value={accountData.email}
            onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Enter your email address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={accountData.password}
            onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
            className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Create a password (min. 6 characters)"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={accountData.confirmPassword}
            onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
            className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Business Information</h3>
        <p className="text-gray-600 text-sm">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business/Service Name *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your business name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <select
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select specialization</option>
              {selectedCategory.subcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="tel"
              required
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="City, State"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">About Your Services</h3>
        <p className="text-gray-600 text-sm">Describe what makes you unique</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          placeholder="Describe your services, expertise, and what sets you apart from others..."
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be displayed to potential customers. Be detailed and highlight your strengths.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 text-sm">Review Your Information</h4>
        <div className="space-y-1 text-xs text-blue-800">
          <p><span className="font-medium">Email:</span> {accountData.email}</p>
          <p><span className="font-medium">Business Name:</span> {formData.name}</p>
          <p><span className="font-medium">Category:</span> {formData.category}</p>
          {formData.subcategory && <p><span className="font-medium">Specialization:</span> {formData.subcategory}</p>}
          <p><span className="font-medium">Location:</span> {formData.location}</p>
          <p><span className="font-medium">Contact:</span> {formData.contact}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">Become a Service Provider</h2>
            <p className="text-sm text-gray-600">Join MCGS and grow your business</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  size="sm"
                >
                  Previous
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  size="sm"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !formData.description}
                  size="sm"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegistrationModal;