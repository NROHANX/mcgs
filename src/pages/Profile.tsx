import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Calendar, 
  Package, 
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { supabase, ServiceProvider, Booking } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
}

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
  const [isProvider, setIsProvider] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Check if user is a provider
      const { data: providerData } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (providerData) {
        setIsProvider(true);
        setProfile({
          name: providerData.name,
          email: user?.email || '',
          phone: providerData.contact || '',
          location: providerData.location || ''
        });
      } else {
        setProfile({
          name: user?.email?.split('@')[0] || '',
          email: user?.email || '',
          phone: '',
          location: ''
        });
      }

      // Fetch bookings for customers
      if (!providerData) {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', user?.id)
          .order('created_at', { ascending: false });

        setBookings(bookingsData || []);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isProvider) {
        const { error } = await supabase
          .from('service_providers')
          .update({
            name: profile.name,
            contact: profile.phone,
            location: profile.location
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
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

  // Redirect providers to their dashboard
  if (isProvider) {
    navigate('/provider-dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
              <div className="flex items-center">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-blue-100">{profile.email}</p>
                  <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm mt-2">
                    Customer
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Sidebar */}
              <div className="w-full lg:w-1/4 bg-gray-50 p-6">
                <nav className="space-y-2">
                  <button
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="h-5 w-5 mr-3" />
                    My Profile
                  </button>
                  
                  <button
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'bookings'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('bookings')}
                  >
                    <Calendar className="h-5 w-5 mr-3" />
                    My Bookings
                    {bookings.filter(b => b.status === 'pending').length > 0 && (
                      <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                        {bookings.filter(b => b.status === 'pending').length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                    
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <Button type="submit">
                        Save Changes
                      </Button>
                    </form>
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
                    
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No bookings yet</p>
                        <Button onClick={() => navigate('/')}>
                          Browse Services
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map(booking => (
                          <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getStatusIcon(booking.status)}
                                <div className="ml-3">
                                  <h3 className="text-lg font-semibold">{booking.service_name}</h3>
                                  <p className="text-sm text-gray-500">
                                    Date: {new Date(booking.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{booking.amount}</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;