import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { supabase, ServiceBooking } from '../lib/supabase';

const Profile: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userProfile) {
      navigate('/');
      return;
    }

    if (userProfile.user_type !== 'customer') {
      navigate('/');
      return;
    }

    fetchBookings();
  }, [user, userProfile, navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'assigned':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-4 mr-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userProfile?.full_name}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {userProfile?.email}
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {new Date(userProfile?.created_at || '').toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">My Service Bookings</h2>
            </div>
            
            <div className="p-6">
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No bookings found</p>
                  <p className="text-sm">Book a service to see your bookings here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {getStatusIcon(booking.status)}
                          <div className="flex-grow">
                            <h3 className="font-medium text-gray-900">{booking.service_name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{booking.service_address}</p>
                            
                            {booking.description && (
                              <p className="text-sm text-gray-600 mt-2">{booking.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span>
                                {booking.preferred_date 
                                  ? `Scheduled: ${new Date(booking.preferred_date).toLocaleDateString()}`
                                  : 'Flexible timing'
                                }
                              </span>
                              {booking.preferred_time_slot && (
                                <span>• {booking.preferred_time_slot}</span>
                              )}
                            </div>

                            {booking.special_instructions && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  <strong>Special Instructions:</strong> {booking.special_instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="space-y-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                            
                            <span className={`block px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(booking.urgency)}`}>
                              {booking.urgency} priority
                            </span>
                            
                            {booking.estimated_price && booking.estimated_price > 0 && (
                              <p className="text-sm text-gray-500 mt-2">Budget: ₹{booking.estimated_price}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Booking ID: {booking.id.slice(0, 8)}</span>
                          <span>Created: {new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;