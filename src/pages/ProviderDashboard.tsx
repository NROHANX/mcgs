import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Users, 
  Calendar, 
  Settings, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Star,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { supabase, ServiceProvider, Booking } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ProviderStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
}

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile'>('overview');
  const [stats, setStats] = useState<ProviderStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/provider-login');
      return;
    }

    fetchProviderData();
  }, [user, navigate]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);

      // Fetch provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (providerError || !providerData) {
        console.error('Provider not found, redirecting to registration:', providerError);
        navigate('/provider-registration');
        return;
      }

      setProfile(providerData);

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      const processedBookings = bookingsData || [];
      setBookings(processedBookings);

      // Calculate stats
      const totalEarnings = processedBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.amount, 0);

      setStats({
        totalBookings: processedBookings.length,
        pendingBookings: processedBookings.filter(b => b.status === 'pending').length,
        completedBookings: processedBookings.filter(b => b.status === 'completed').length,
        totalEarnings
      });

    } catch (error) {
      console.error('Error fetching provider data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Booking status updated');
      fetchProviderData();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const toggleAvailability = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('service_providers')
        .update({ available: !profile.available })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success(`You are now ${!profile.available ? 'available' : 'unavailable'} for bookings`);
      fetchProviderData();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {profile?.name}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={toggleAvailability}
                variant={profile?.available ? 'outline' : 'primary'}
                icon={profile?.available ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              >
                {profile?.available ? 'Go Offline' : 'Go Online'}
              </Button>
              <Button
                onClick={() => navigate('/provider-registration')}
                variant="outline"
                icon={<Settings className="h-4 w-4" />}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'overview'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  <BarChart className="h-4 w-4 inline mr-2" />
                  Overview
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'bookings'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Bookings
                  {stats.pendingBookings > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingBookings}
                    </span>
                  )}
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'profile'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Profile
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium">{booking.service_name}</p>
                              <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                              <p className="text-sm text-gray-500 mt-1">₹{booking.amount}</p>
                            </div>
                          </div>
                        ))}
                        {bookings.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No bookings yet</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-medium ${profile?.available ? 'text-green-600' : 'text-red-600'}`}>
                            {profile?.available ? 'Available' : 'Offline'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category</span>
                          <span className="font-medium">{profile?.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Member Since</span>
                          <span className="font-medium">
                            {profile ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">My Bookings</h2>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map(booking => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.service_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(booking.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{booking.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {booking.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  >
                                    Complete
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {bookings.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                      <p className="text-gray-600">You haven't received any bookings yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && profile && (
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <p className="text-gray-900">{profile.name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <p className="text-gray-900">{profile.category}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <p className="text-gray-900">{profile.location}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact
                        </label>
                        <p className="text-gray-900">{profile.contact}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {profile.available ? 'Available' : 'Offline'}
                        </span>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <p className="text-gray-900">{profile.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={() => navigate('/provider-registration')}
                      icon={<Settings className="h-4 w-4" />}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={toggleAvailability}
                      icon={profile.available ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    >
                      {profile.available ? 'Go Offline' : 'Go Online'}
                    </Button>
                  </div>
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

export default ProviderDashboard;