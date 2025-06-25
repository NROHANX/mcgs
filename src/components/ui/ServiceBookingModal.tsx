import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Phone, Mail, User, FileText, AlertTriangle } from 'lucide-react';
import Button from './Button';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  serviceCategory?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  base_price: number;
  estimated_duration: string;
}

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  serviceName,
  serviceCategory 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [formData, setFormData] = useState({
    serviceCategory: '',
    serviceName: serviceName || '',
    description: '',
    customerName: '',
    customerPhone: '',
    customerEmail: user?.email || '',
    serviceAddress: '',
    preferredDate: '',
    preferredTimeSlot: 'morning',
    urgency: 'normal',
    specialInstructions: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchServiceCategories();
      // Pre-fill form with user data if available
      setFormData(prev => ({
        ...prev,
        serviceName: serviceName || '',
        customerEmail: user?.email || '',
        serviceCategory: serviceCategory || ''
      }));
    }
  }, [isOpen, serviceName, serviceCategory, user]);

  const fetchServiceCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);

      // Auto-select category if provided
      if (serviceCategory && data) {
        const matchingCategory = data.find(cat => 
          cat.name.toLowerCase().includes(serviceCategory.toLowerCase())
        );
        if (matchingCategory) {
          setFormData(prev => ({ ...prev, serviceCategory: matchingCategory.id }));
        }
      }
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  };

  const handleLocationChange = (value: string) => {
    setFormData({ ...formData, serviceAddress: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to book a service');
      return;
    }

    setLoading(true);

    try {
      // Get selected category details
      const selectedCategory = categories.find(cat => cat.id === formData.serviceCategory);
      
      const bookingData = {
        customer_id: user.id,
        service_category_id: formData.serviceCategory,
        service_name: formData.serviceName,
        description: formData.description,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail,
        service_address: formData.serviceAddress,
        preferred_date: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : null,
        preferred_time_slot: formData.preferredTimeSlot,
        urgency: formData.urgency,
        estimated_price: selectedCategory?.base_price || 0,
        special_instructions: formData.specialInstructions,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('service_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Service booking request submitted successfully!');
      toast.success('Our team will assign a technician and contact you soon.');
      
      // Reset form
      setFormData({
        serviceCategory: '',
        serviceName: '',
        description: '',
        customerName: '',
        customerPhone: '',
        customerEmail: user?.email || '',
        serviceAddress: '',
        preferredDate: '',
        preferredTimeSlot: 'morning',
        urgency: 'normal',
        specialInstructions: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find(cat => cat.id === formData.serviceCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book a Service</h2>
            <p className="text-gray-600 mt-1">Fill out the details and we'll assign the best technician for you</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Category *
                </label>
                <select
                  required
                  value={formData.serviceCategory}
                  onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a service category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Service *
                </label>
                <input
                  type="text"
                  required
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., RO Installation, AC Repair, etc."
                />
              </div>
            </div>

            {selectedCategory && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">{selectedCategory.name}</h4>
                    <p className="text-sm text-blue-700">{selectedCategory.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-900">₹{selectedCategory.base_price}+</div>
                    <div className="text-sm text-blue-700">{selectedCategory.estimated_duration}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the issue or service needed in detail..."
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Location</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete Address *
              </label>
              <GoogleMapsAutocomplete
                value={formData.serviceAddress}
                onChange={handleLocationChange}
                placeholder="Enter complete address where service is needed"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                📍 Provide complete address including house/flat number, street, area, city, pincode
              </p>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preferred Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 7 PM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low - Within a week</option>
                  <option value="normal">Normal - Within 2-3 days</option>
                  <option value="high">High - Within 24 hours</option>
                  <option value="urgent">Urgent - ASAP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any specific requirements, access instructions, or additional details..."
              />
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Our team will review your request and assign the best available technician</li>
                  <li>You will receive a confirmation call within 2 hours</li>
                  <li>The assigned technician will contact you before arriving</li>
                  <li>Pricing may vary based on actual work required</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.serviceCategory || !formData.customerName || !formData.customerPhone || !formData.serviceAddress}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceBookingModal;