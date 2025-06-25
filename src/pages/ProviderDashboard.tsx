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
  DollarSign,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
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
  pendingEarnings: number;
  paidEarnings: number;
  averageRating: number;
  reviewCount: number;
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

interface EarningsData {
  id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  payment_date: string;
  created_at: string;
  booking: {
    service_name: string;
    date: string;
  };
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

interface ProviderProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  contact: string;
  available: boolean;
  average_rating: number;
  review_count: number;
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
    pendingEarnings: 0,
    paidEarnings: 0,
    averageRating: 0,
    reviewCount: 0
  });
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketData[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
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
        navigate('/provider-registration');
        return;
      }

      setProfile(providerData);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          users!bookings_customer_id_fkey(email)
        `)
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const processedBookings = bookingsData?.map(booking => ({
        id: booking.id,
        service_name: booking.service_name,
        date: booking.date,
        status: booking.status,
        amount: parseFloat(booking.amount),
        customer_email: booking.users?.email || 'Unknown',
        created_at: booking.created_at
      })) || [];

      setBookings(processedBookings);

      // Fetch earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select(`
          *,
          bookings!inner(service_name, date)
        `)
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      if (earningsError) throw earningsError;

      const processedEarnings = earningsData?.map(earning => ({
        id: earning.id,
        gross_amount: parseFloat(earning.gross_amount),
        platform_fee: parseFloat(earning.platform_fee),
        net_amount: parseFloat(earning.net_amount),
        status: earning.status,
        payment_date: earning.payment_date,
        created_at: earning.created_at,
        booking: {
          service_name: earning.bookings.service_name,
          date: earning.bookings.date
        }
      })) || [];

      setEarnings(processedEarnings);

      // Fetch support tickets
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setSupportTickets(ticketsData || []);

      // Calculate stats
      const totalEarnings = processedEarnings.reduce((sum, e) => sum + e.net_amount, 0);
      const pendingEarnings = processedEarnings
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.net_amount, 0);
      const paidEarnings = processedEarnings
        .filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + e.net_amount, 0);

      setStats({
        totalBookings: processedBookings.length,
        pendingBookings: processedBookings.filter(b => b.status === 'pending').length,
        completedBookings: processedBookings.filter(b => b.status === 'completed').length,
        cancelledBookings: processedBookings.filter(b => b.status === 'cancelled').length,
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        averageRating: providerData.average_rating || 0,
        reviewCount: providerData.review_count || 0
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

  const handleTicketCreated = () => {
    fetchProviderData();
  };

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );

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
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={toggleAvailability}
                variant={profile?.available ? 'outline' : 'primary'}
                icon={profile?.available ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              >
                {profile?.available ? 'Go Offline' : 'Go Online'}
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
              <p className="text-sm text-green-600 mt-1">
                {stats.pendingBookings} pending
              </p>
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
              <p className="text-sm text-green-600 mt-1">
                ₹{stats.paidEarnings.toLocaleString()} paid
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Earnings</h3>
                <CreditCard className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{stats.pendingEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">To be paid</p>
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

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Support Tickets</h3>
                <MessageSquare className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{supportTickets.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                {supportTickets.filter(t => t.status === 'open').length} open
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart },
                  { id: 'bookings', label: 'Bookings', icon: Calendar },
                  { id: 'earnings', label: 'Earnings', icon: DollarSign },
                  { id: 'support', label: 'Support', icon: MessageSquare },
                  { id: 'profile', label: 'Profile', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-6 py-3 font-medium text-sm focus:outline-none whitespace-nowrap flex items-center ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                    {tab.id === 'support' && supportTickets.filter(t => t.status === 'open').length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {supportTickets.filter(t => t.status === 'open').length}
                      </span>
                    )}
                  </button>
                ))}
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
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Earned</span>
                          <span className="font-medium">₹{stats.totalEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid Out</span>
                          <span className="font-medium text-green-600">₹{stats.paidEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pending</span>
                          <span className="font-medium text-orange-600">₹{stats.pendingEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium">
                            {stats.totalBookings > 0 
                              ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-medium ${profile?.available ? 'text-green-600' : 'text-red-600'}`}>
                            {profile?.available ? 'Available' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">My Bookings</h2>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'earnings' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Earnings Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Total Earnings</h3>
                      <p className="text-3xl font-bold text-green-600">₹{stats.totalEarnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-800 mb-2">Pending</h3>
                      <p className="text-3xl font-bold text-orange-600">₹{stats.pendingEarnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Paid Out</h3>
                      <p className="text-3xl font-bold text-blue-600">₹{stats.paidEarnings.toLocaleString()}</p>
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
                          <tr key={earning.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {earning.booking.service_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{earning.gross_amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              -₹{earning.platform_fee.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              ₹{earning.net_amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                earning.status === 'paid' ? 'bg-green-100 text-green-800' :
                                earning.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
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