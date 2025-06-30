import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Phone, Mail, User, FileText, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  serviceCategory?: string;
}

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  serviceName,
  serviceCategory 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: serviceName || '',
    description: '',
    customerName: '',
    customerPhone: '',
    customerEmail: user?.email || '',
    serviceAddress: '',
    preferredDate: '',
    preferredTimeSlot: 'morning',
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    estimatedPrice: 0,
    specialInstructions: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        serviceName: serviceName || '',
        customerEmail: user?.email || ''
      }));
    }
  }, [isOpen, serviceName, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to book a service');
      return;
    }

    setLoading(true);

    try {
      // Insert into service_bookings table
      const { error } = await supabase
        .from('service_bookings')
        .insert([
          {
            customer_id: user.id,
            service_name: formData.serviceName,
            description: formData.description,
            customer_name: formData.customerName,
            customer_phone: formData.customerPhone,
            customer_email: formData.customerEmail,
            service_address: formData.serviceAddress,
            preferred_date: formData.preferredDate || null,
            preferred_time_slot: formData.preferredTimeSlot,
            urgency: formData.urgency,
            estimated_price: formData.estimatedPrice,
            special_instructions: formData.specialInstructions,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast.success('Service booking request submitted successfully!');
      toast.success('Our team will assign a technician and contact you soon.');
      
      // Reset form
      setFormData({
        serviceName: '',
        description: '',
        customerName: '',
        customerPhone: '',
        customerEmail: user?.email || '',
        serviceAddress: '',
        preferredDate: '',
        preferredTimeSlot: 'morning',
        urgency: 'normal',
        estimatedPrice: 0,
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="normal">Normal - Within 1-2 days</option>
                  <option value="high">High - Same day preferred</option>
                  <option value="urgent">Urgent - Immediate attention needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Budget (₹)
                </label>
                <input
                  type="number"
                  value={formData.estimatedPrice}
                  onChange={(e) => setFormData({ ...formData, estimatedPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
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
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <textarea
                  required
                  value={formData.serviceAddress}
                  onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete address where service is needed"
                />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preferred Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Preferred Time Slot
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
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special instructions or requirements..."
            />
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
              disabled={loading || !formData.serviceName || !formData.customerName || !formData.customerPhone || !formData.serviceAddress}
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