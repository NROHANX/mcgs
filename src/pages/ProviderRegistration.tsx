import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Star, Users, Zap, ArrowLeft, CheckCircle, User, Mail, Lock, Eye, EyeOff, Phone, Briefcase } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import GoogleMapsAutocomplete from '../components/ui/GoogleMapsAutocomplete';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProviderRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    location: '',
    contact: '',
    experience: '',
    certifications: '',
    workingHours: '',
    serviceArea: '',
    businessLicense: '',
    insuranceDetails: ''
  });

  const categories = [
    { 
      value: 'RO Technician', 
      label: 'RO Technician', 
      icon: '💧'
    },
    { 
      value: 'AC Technician', 
      label: 'AC Technician', 
      icon: '❄️'
    },
    { 
      value: 'Electrician', 
      label: 'Electrician', 
      icon: '⚡'
    },
    { 
      value: 'Plumber', 
      label: 'Plumber', 
      icon: '🔧'
    },
    { 
      value: 'Mechanic', 
      label: 'Mechanic', 
      icon: '🔩'
    },
    { 
      value: 'Carpenter', 
      label: 'Carpenter', 
      icon: '🪚'
    },
    { 
      value: 'Painter', 
      label: 'Painter', 
      icon: '🎨'
    },
    { 
      value: 'Cleaner', 
      label: 'Cleaner', 
      icon: '🧹'
    },
    { 
      value: 'Gardener', 
      label: 'Gardener', 
      icon: '🌱'
    }
  ];

  // Check if user is already logged in and has a provider profile
  useEffect(() => {
    const checkExistingProvider = async () => {
      if (user) {
        try {
          const { data: providerData } = await supabase
            .from('service_providers')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (providerData) {
            setIsEditMode(true);
            setCurrentStep(2); // Skip account creation
            setFormData({
              name: providerData.name || '',
              category: providerData.category || '',
              description: providerData.description || '',
              location: providerData.location || '',
              contact: providerData.contact || '',
              experience: '',
              certifications: '',
              workingHours: '',
              serviceArea: '',
              businessLicense: '',
              insuranceDetails: ''
            });
            setAccountData({
              email: user.email || '',
              password: '',
              confirmPassword: ''
            });
          }
        } catch (error) {
          console.error('Error checking existing provider:', error);
        }
      }
    };

    checkExistingProvider();
  }, [user]);

  const handleLocationChange = (value: string, placeDetails?: google.maps.places.PlaceResult) => {
    setFormData({ ...formData, location: value });
    
    // If we have place details, we could store additional information
    if (placeDetails) {
      console.log('Selected place:', placeDetails);
      // You could store latitude/longitude or other details if needed
      // const lat = placeDetails.geometry?.location?.lat();
      // const lng = placeDetails.geometry?.location?.lng();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditMode) {
      if (accountData.password !== accountData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (accountData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }

    setLoading(true);
    try {
      let userId = user?.id;

      if (!isEditMode) {
        // Create user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: accountData.email,
          password: accountData.password,
        });

        if (authError) throw authError;
        userId = authData.user?.id;
      }

      if (userId) {
        // Create or update service provider profile
        const providerData = {
          user_id: userId,
          name: formData.name,
          category: formData.category,
          subcategory: null, // Remove subcategory
          description: formData.description,
          location: formData.location,
          contact: formData.contact,
          available: true
        };

        if (isEditMode) {
          const { error: updateError } = await supabase
            .from('service_providers')
            .update(providerData)
            .eq('user_id', userId);

          if (updateError) throw updateError;
          toast.success('Profile updated successfully!');
        } else {
          const { error: insertError } = await supabase
            .from('service_providers')
            .insert([providerData]);

          if (insertError) throw insertError;
          toast.success('Successfully registered as a service provider!');
          toast.success('Please check your email to verify your account');
        }

        navigate('/provider-dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register as a provider');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !isEditMode) {
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
    } else if (currentStep === 3) {
      // Validate professional details
      if (!formData.experience) {
        toast.error('Please select your experience level');
        return;
      }
    }
    
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > (isEditMode ? 2 : 1)) setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => {
    const steps = isEditMode ? [2, 3, 4] : [1, 2, 3, 4];
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
        <p className="text-gray-600">Set up your login credentials</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              required
              value={accountData.email}
              onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={accountData.password}
              onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a password (min. 6 characters)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={accountData.confirmPassword}
              onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Business Information</h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business/Service Name *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your business name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="tel"
              required
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Location *
          </label>
          <GoogleMapsAutocomplete
            value={formData.location}
            onChange={handleLocationChange}
            placeholder="Search for your exact service location (e.g., Sitabuldi, Nagpur, Maharashtra)"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            🗺️ Use Google Maps to select your precise service location for better customer matching
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Professional Details</h2>
        <p className="text-gray-600">Share your experience and qualifications</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <select
            required
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select experience</option>
            <option value="0-1">0-1 years (Beginner)</option>
            <option value="1-3">1-3 years (Basic)</option>
            <option value="3-5">3-5 years (Intermediate)</option>
            <option value="5-10">5-10 years (Experienced)</option>
            <option value="10+">10+ years (Expert)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certifications & Licenses
          </label>
          <textarea
            value={formData.certifications}
            onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List any relevant certifications, licenses, or training (e.g., ITI Certificate, Trade License, etc.)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Working Hours
          </label>
          <input
            type="text"
            value={formData.workingHours}
            onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Mon-Sat 9AM-6PM, Sunday Off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Area Coverage
          </label>
          <input
            type="text"
            value={formData.serviceArea}
            onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Areas you provide services to (e.g., Nagpur City, Kamptee, Katol)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business License Number (Optional)
          </label>
          <input
            type="text"
            value={formData.businessLicense}
            onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your business license or registration number"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">About Your Services</h2>
        <p className="text-gray-600">Describe what makes you unique</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your services, expertise, and what sets you apart from others. Include your specialties, quality of work, customer service approach, etc."
        />
        <p className="text-sm text-gray-500 mt-1">
          This will be displayed to potential customers. Be detailed and highlight your strengths.
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">Review Your Information</h3>
        <div className="space-y-2 text-sm">
          {!isEditMode && <p><span className="font-medium">Email:</span> {accountData.email}</p>}
          <p><span className="font-medium">Business Name:</span> {formData.name}</p>
          <p><span className="font-medium">Category:</span> {formData.category}</p>
          <p><span className="font-medium">Location:</span> {formData.location}</p>
          <p><span className="font-medium">Contact:</span> {formData.contact}</p>
          <p><span className="font-medium">Experience:</span> {formData.experience}</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800 text-sm">
            By completing registration, you agree to our terms of service and will be able to receive bookings from customers.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12">
          <div className="container mx-auto px-4">
            <Link 
              to="/become-provider" 
              className="inline-flex items-center text-white hover:text-blue-200 transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Provider Info
            </Link>
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">
                {isEditMode ? 'Update Your Profile' : 'Service Provider Registration'}
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                {isEditMode 
                  ? 'Update your service provider information'
                  : 'Join MCGS and start growing your business today'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {renderStepIndicator()}
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && !isEditMode && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  {currentStep > (isEditMode ? 2 : 1) ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      Previous
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading || !formData.description}
                    >
                      {loading 
                        ? (isEditMode ? 'Updating...' : 'Creating Account...') 
                        : (isEditMode ? 'Update Profile' : 'Complete Registration')
                      }
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have a provider account?{' '}
                <Link to="/provider-login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProviderRegistration;