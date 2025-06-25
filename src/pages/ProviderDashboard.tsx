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
  MessageSquare,
  Plus,
  Filter,
  Search,
  Download,
  Eye,
  DollarSign,
  Award,
  AlertTriangle,
  Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import GoogleMapsAutocomplete from '../components/ui/GoogleMapsAutocomplete';
import SupportTicket from '../components/ui/SupportTicket';
import CreateTicketModal from '../components/ui/CreateTicketModal';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ProviderStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  thisMonthBookings: number;
  thisMonthEarnings: number;
}

interface BookingData {
  id: string;
  service_name: string;
  date: string;
  status: string;
  amount: number;
  customer_email: string;
  created_at: string;
}

interface ProviderProfile {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  location: string;
  complete_address: string;
  contact: string;
  available: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
}

interface EarningData {
  id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  created_at: string;
  booking_id: string;
}

interface SupportTicketData {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'earnings' | 'support' | 'profile'>('overview');
  const [stats, setStats] = useState<ProviderStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    reviewCount: 0,
    thisMonthBookings: 0,
    thisMonthEarnings: 0
  });
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [earnings, setEarnings] = useState<EarningData[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketData[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);

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

      // Fetch bookings - simplified query without user join to avoid schema issues
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        setBookings([]);
      } else {
        // For each booking, fetch customer email separately from auth.users
        const processedBookings: BookingData[] = [];
        
        if (bookingsData && bookingsData.length > 0) {
          for (const booking of bookingsData) {
            let customerEmail = 'Unknown';
            
            // Try to fetch customer email from auth.users
            try {
              const { data: userData, error: userError } = await supabase
                .from('admin_users')
                .select('email')
                .eq('id', booking.customer_id)
                .single();
              
              if (!userError && userData) {
                customerEmail = userData.email;
              }
            } catch (error) {
              console.log('Could not fetch customer email for booking:', booking.id);
            }

            processedBookings.push({
              id: booking.id,
              service_name: booking.service_name,
              date: booking.date,
              status: booking.status,
              amount: parseFloat(booking.amount),
              customer_email: customerEmail,
              created_at: booking.created_at
            });
          }
        }
        
        setBookings(processedBookings);
      }

      // Fetch earnings - use a simpler approach to avoid RLS policy issues
      try {
        const { data: earningsData, error: earningsError } = await supabase
          .from('earnings')
          .select('*')
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (earningsError) {
          console.error('Error fetching earnings:', earningsError);
          // If earnings fetch fails due to RLS issues, calculate from bookings
          const completedBookings = bookings.filter(b => b.status === 'completed');
          const estimatedEarnings = completedBookings.map((booking, index) => ({
            id: `estimated-${index}`,
            gross_amount: booking.amount,
            platform_fee: booking.amount * 0.1, // Assume 10% platform fee
            net_amount: booking.amount * 0.9,
            status: 'paid' as const,
            created_at: booking.created_at,
            booking_id: booking.id
          }));
          setEarnings(estimatedEarnings);
        } else {
          const processedEarnings = earningsData?.map(earning => ({
            id: earning.id,
            gross_amount: parseFloat(earning.gross_amount),
            platform_fee: parseFloat(earning.platform_fee),
            net_amount: parseFloat(earning.net_amount),
            status: earning.status,
            created_at: earning.created_at,
            booking_id: earning.booking_id
          })) || [];
          setEarnings(processedEarnings);
        }
      } catch (error) {
        console.error('Earnings fetch failed, using estimated values:', error);
        // Fallback: estimate earnings from completed bookings
        const completedBookings = bookings.filter(b => b.status === 'completed');
        const estimatedEarnings = completedBookings.map((booking, index) => ({
          id: `estimated-${index}`,
          gross_amount: booking.amount,
          platform_fee: booking.amount * 0.1,
          net_amount: booking.amount * 0.9,
          status: 'paid' as const,
          created_at: booking.created_at,
          booking_id: booking.id
        }));
        setEarnings(estimatedEarnings);
      }

      // Fetch support tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('Error fetching support tickets:', ticketsError);
        setSupportTickets([]);
      } else {
        setSupportTickets(ticketsData || []);
      }

      // Calculate stats after all data is fetched
      setTimeout(() => {
        calculateStats(bookings, earnings, providerData);
      }, 100);

    } catch (error) {
      console.error('Error fetching provider data:', error);
      toast.error('Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: BookingData[], earningsData: EarningData[], providerData: ProviderProfile) => {
    const totalEarnings = earningsData
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.net_amount, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthBookings = bookingsData.filter(b => {
      const bookingDate = new Date(b.created_at);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    }).length;

    const thisMonthEarnings = earningsData.filter(e => {
      const earningDate = new Date(e.created_at);
      return earningDate.getMonth() === currentMonth && 
             earningDate.getFullYear() === currentYear &&
             e.status === 'paid';
    }).reduce((sum, e) => sum + e.net_amount, 0);

    setStats({
      totalBookings: bookingsData.length,
      pendingBookings: bookingsData.filter(b => b.status === 'pending').length,
      completedBookings: bookingsData.filter(b => b.status === 'completed').length,
      cancelledBookings: bookingsData.filter(b => b.status === 'cancelled').length,
      totalEarnings,
      averageRating: providerData.average_rating || 0,
      reviewCount: providerData.review_count || 0,
      thisMonthBookings,
      thisMonthEarnings
    });
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

  const handleLocationChange = (value: string, placeDetails?: google.maps.places.PlaceResult) => {
    if (profile) {
      setProfile({ ...profile, location: value });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('service_providers')
        .update({
          name: profile.name,
          contact: profile.contact,
          location: profile.location,
          complete_address: profile.complete_address,
          description: profile.description
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      fetchProviderData();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const exportBookings = () => {
    if (bookings.length === 0) {
      toast.error('No bookings to export');
      return;
    }

    const csvContent = [
      'Service,Customer,Date,Status,Amount,Created',
      ...bookings.map(booking => 
        `"${booking.service_name}","${booking.customer_email}","${new Date(booking.date).toLocaleDateString()}","${booking.status}","₹${booking.amount}","${new Date(booking.created_at).toLocaleDateString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Bookings exported successfully');
  };

  const handleTicketCreated = () => {
    fetchProviderData();
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = booking.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
              <h1 className="text-3xl font-bold text-gray-900">Welcome {profile?.name || 'Provider'}</h1>
              <p className="text-gray-600 mt-1">Service Provider Dashboard</p>
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

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Awaiting action</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Net amount</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stats.reviewCount} reviews</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">This Month</h3>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonthBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Bookings</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Month Earnings</h3>
                <Award className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{stats.thisMonthEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
          </div>

          {/* Status Alert */}
          {!profile?.available && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <p className="text-orange-800 font-medium">
                  You are currently offline. Customers cannot book your services. Click "Go Online" to start receiving bookings.
                </p>
              </div>
            </div>
          )}

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
                  My Bookings
                  {stats.pendingBookings > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingBookings}
                    </span>
                  )}
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'earnings'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('earnings')}
                >
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Earnings
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'support'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('support')}
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Support Tickets
                  {supportTickets.filter(t => t.status === 'open').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {supportTickets.filter(t => t.status === 'open').length}
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
                              <p className="text-sm text-gray-500">{booking.customer_email}</p>
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
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium">
                            {stats.totalBookings > 0 
                              ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average per Job</span>
                          <span className="font-medium">
                            ₹{stats.completedBookings > 0 
                              ? Math.round(stats.totalEarnings / stats.completedBookings)
                              : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-medium ${profile?.available ? 'text-green-600' : 'text-red-600'}`}>
                            {profile?.available ? 'Available' : 'Offline'}
                          </span>
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

                  {/* Performance Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart className="h-12 w-12 mx-auto mb-4" />
                        <p>Performance charts coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">My Bookings</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={exportBookings}
                        variant="outline"
                        icon={<Download className="h-4 w-4" />}
                      >
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
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
                        {filteredBookings.map(booking => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.service_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {booking.customer_email}
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
                              {booking.customer_email !== 'Unknown' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  icon={<Mail className="h-4 w-4" />}
                                  onClick={() => window.open(`mailto:${booking.customer_email}`)}
                                >
                                  Contact
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredBookings.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                      <p className="text-gray-600">
                        {bookings.length === 0 
                          ? 'You haven\'t received any bookings yet.' 
                          : 'No bookings match your current filters.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'earnings' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Earnings Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Earnings</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">₹{stats.thisMonthEarnings.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">This Month</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {earnings.filter(e => e.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600">Pending Payments</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{stats.completedBookings > 0 
                          ? Math.round(stats.totalEarnings / stats.completedBookings)
                          : 0}
                      </div>
                      <div className="text-sm text-gray-600">Avg per Job</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gross Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Platform Fee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {earnings.map(earning => (
                          <tr key={earning.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{earning.booking_id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{earning.gross_amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{earning.platform_fee.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{earning.net_amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                earning.status === 'paid' ? 'bg-green-100 text-green-800' :
                                earning.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {earning.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(earning.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {earnings.length === 0 && (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
                      <p className="text-gray-600">Complete your first booking to start earning!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'support' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Support Tickets</h2>
                    <Button
                      onClick={() => setIsCreateTicketModalOpen(true)}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Create Ticket
                    </Button>
                  </div>
                  
                  {supportTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No support tickets yet</p>
                      <Button
                        onClick={() => setIsCreateTicketModalOpen(true)}
                        icon={<Plus className="h-4 w-4" />}
                      >
                        Create Your First Ticket
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {supportTickets.map(ticket => (
                        <SupportTicket
                          key={ticket.id}
                          ticket={ticket}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && profile && (
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
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
                          Category
                        </label>
                        <input
                          type="text"
                          value={profile.category}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <GoogleMapsAutocomplete
                          value={profile.location}
                          onChange={handleLocationChange}
                          placeholder="Search for your service location"
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          🗺️ Use Google Maps to select your precise service location
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact
                        </label>
                        <input
                          type="text"
                          value={profile.contact}
                          onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Complete Address
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                          <textarea
                            value={profile.complete_address || ''}
                            onChange={(e) => setProfile({ ...profile, complete_address: e.target.value })}
                            rows={3}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your complete business address including house/shop number, street, area, city, state, pincode"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Provide your full business address for accurate customer navigation
                        </p>
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
                        <textarea
                          value={profile.description}
                          onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit" icon={<Settings className="h-4 w-4" />}>
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={toggleAvailability}
                        icon={profile.available ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      >
                        {profile.available ? 'Go Offline' : 'Go Online'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      <Footer />
    </div>
  );
};

export default ProviderDashboard;