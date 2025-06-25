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
  CreditCard,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Bell,
  AlertTriangle,
  Award,
  Target,
  Activity
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
  thisMonthBookings: number;
  thisMonthEarnings: number;
  completionRate: number;
  responseTime: string;
}

interface BookingData {
  id: string;
  service_name: string;
  date: string;
  status: string;
  amount: number;
  customer_email: string;
  customer_phone?: string;
  created_at: string;
  notes?: string;
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
    customer_email: string;
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

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_email: string;
}

interface ProviderProfile {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  location: string;
  contact: string;
  available: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
}

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'earnings' | 'reviews' | 'support' | 'profile' | 'settings'>('overview');
  const [stats, setStats] = useState<ProviderStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    averageRating: 0,
    reviewCount: 0,
    thisMonthBookings: 0,
    thisMonthEarnings: 0,
    completionRate: 0,
    responseTime: 'N/A'
  });
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketData[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
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

      // Fetch bookings with customer details
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
        created_at: booking.created_at,
        notes: booking.notes || ''
      })) || [];

      setBookings(processedBookings);

      // Fetch earnings with booking details
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select(`
          *,
          bookings!inner(service_name, date, users!bookings_customer_id_fkey(email))
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
          date: earning.bookings.date,
          customer_email: earning.bookings.users?.email || 'Unknown'
        }
      })) || [];

      setEarnings(processedEarnings);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          users!reviews_user_id_fkey(email)
        `)
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const processedReviews = reviewsData?.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user_email: review.users?.email || 'Anonymous'
      })) || [];

      setReviews(processedReviews);

      // Fetch support tickets
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setSupportTickets(ticketsData || []);

      // Calculate enhanced stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const thisMonthBookings = processedBookings.filter(b => 
        new Date(b.created_at) >= thisMonth
      ).length;
      
      const thisMonthEarnings = processedEarnings
        .filter(e => new Date(e.created_at) >= thisMonth)
        .reduce((sum, e) => sum + e.net_amount, 0);

      const totalEarnings = processedEarnings.reduce((sum, e) => sum + e.net_amount, 0);
      const pendingEarnings = processedEarnings
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.net_amount, 0);
      const paidEarnings = processedEarnings
        .filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + e.net_amount, 0);

      const completionRate = processedBookings.length > 0 
        ? Math.round((processedBookings.filter(b => b.status === 'completed').length / processedBookings.length) * 100)
        : 0;

      setStats({
        totalBookings: processedBookings.length,
        pendingBookings: processedBookings.filter(b => b.status === 'pending').length,
        completedBookings: processedBookings.filter(b => b.status === 'completed').length,
        cancelledBookings: processedBookings.filter(b => b.status === 'cancelled').length,
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        averageRating: providerData.average_rating || 0,
        reviewCount: providerData.review_count || 0,
        thisMonthBookings,
        thisMonthEarnings,
        completionRate,
        responseTime: '< 2 hours' // This could be calculated based on actual response times
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

  const exportData = (type: 'bookings' | 'earnings') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'bookings':
        data = bookings;
        filename = 'my_bookings.csv';
        break;
      case 'earnings':
        data = earnings;
        filename = 'my_earnings.csv';
        break;
    }

    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`${type} data exported successfully`);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const bookingDate = new Date(booking.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = bookingDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = bookingDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = bookingDate >= monthAgo;
          break;
      }
    }
    
    return matchesStatus && matchesDate;
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
          {/* Enhanced Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {profile?.name}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  profile?.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    profile?.available ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {profile?.available ? 'Online' : 'Offline'}
                </div>
                <div className="text-sm text-gray-500">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={fetchProviderData}
                variant="outline"
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh
              </Button>
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
                +{stats.thisMonthBookings} this month
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
                +₹{stats.thisMonthEarnings.toLocaleString()} this month
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
                <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                <Target className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              <p className="text-sm text-gray-500 mt-1">Success rate</p>
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
                  { id: 'reviews', label: 'Reviews', icon: Star },
                  { id: 'support', label: 'Support', icon: MessageSquare },
                  { id: 'profile', label: 'Profile', icon: Settings },
                  { id: 'settings', label: 'Settings', icon: Bell }
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
                    {tab.id === 'bookings' && stats.pendingBookings > 0 && (
                      <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                        {stats.pendingBookings}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Completion Rate</p>
                          <p className="text-2xl font-bold">{stats.completionRate}%</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Avg Response</p>
                          <p className="text-2xl font-bold">{stats.responseTime}</p>
                        </div>
                        <Clock className="h-8 w-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">This Month</p>
                          <p className="text-2xl font-bold">₹{stats.thisMonthEarnings.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">Customer Rating</p>
                          <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}★</p>
                        </div>
                        <Award className="h-8 w-8 text-orange-200" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Recent Bookings
                      </h3>
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                              <p className="font-medium text-sm">{booking.service_name}</p>
                              <p className="text-xs text-gray-500">{booking.customer_email}</p>
                              <p className="text-xs text-gray-400">{new Date(booking.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">₹{booking.amount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Recent Reviews
                      </h3>
                      <div className="space-y-3">
                        {reviews.slice(0, 3).map(review => (
                          <div key={review.id} className="py-2 border-b border-gray-200 last:border-b-0">
                            <div className="flex items-center mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 ml-2">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                            <p className="text-xs text-gray-500 mt-1">- {review.user_email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => setActiveTab('bookings')}
                        variant="outline"
                        className="flex items-center justify-center p-4"
                        icon={<Calendar className="h-5 w-5" />}
                      >
                        View All Bookings
                      </Button>
                      <Button
                        onClick={() => setActiveTab('earnings')}
                        variant="outline"
                        className="flex items-center justify-center p-4"
                        icon={<DollarSign className="h-5 w-5" />}
                      >
                        Check Earnings
                      </Button>
                      <Button
                        onClick={() => setIsCreateTicketModalOpen(true)}
                        variant="outline"
                        className="flex items-center justify-center p-4"
                        icon={<MessageSquare className="h-5 w-5" />}
                      >
                        Get Support
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-xl font-semibold">My Bookings</h2>
                    <div className="flex space-x-3 mt-4 sm:mt-0">
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
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                      <Button
                        onClick={() => exportData('bookings')}
                        variant="outline"
                        icon={<Download className="h-4 w-4" />}
                      >
                        Export
                      </Button>
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
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.service_name}</div>
                              <div className="text-sm text-gray-500">#{booking.id.slice(0, 8)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.customer_email}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(booking.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(booking.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{booking.amount.toLocaleString()}
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
                              <div className="flex space-x-2">
                                {booking.status === 'pending' && (
                                  <>
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
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  icon={<Eye className="h-4 w-4" />}
                                >
                                  View
                                </Button>
                              </div>
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
                      <p className="text-gray-600">No bookings match your current filters.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'earnings' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Earnings Details</h2>
                    <Button
                      onClick={() => exportData('earnings')}
                      variant="outline"
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export Earnings
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Total Earnings</h3>
                      <p className="text-3xl font-bold text-green-600">₹{stats.totalEarnings.toLocaleString()}</p>
                      <p className="text-sm text-green-700 mt-1">All time</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-800 mb-2">Pending</h3>
                      <p className="text-3xl font-bold text-orange-600">₹{stats.pendingEarnings.toLocaleString()}</p>
                      <p className="text-sm text-orange-700 mt-1">Awaiting payment</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Paid Out</h3>
                      <p className="text-3xl font-bold text-blue-600">₹{stats.paidEarnings.toLocaleString()}</p>
                      <p className="text-sm text-blue-700 mt-1">Received</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-800 mb-2">This Month</h3>
                      <p className="text-3xl font-bold text-purple-600">₹{stats.thisMonthEarnings.toLocaleString()}</p>
                      <p className="text-sm text-purple-700 mt-1">Current month</p>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{earning.booking.service_name}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(earning.booking.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {earning.booking.customer_email}
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

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Customer Reviews</h2>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        Average: <span className="font-bold text-yellow-600">{stats.averageRating.toFixed(1)}★</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: <span className="font-bold">{stats.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">{review.rating}/5</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        <div className="text-sm text-gray-500">
                          - {review.user_email}
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviews.length === 0 && (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-600">Complete more bookings to start receiving customer reviews.</p>
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
                <div className="max-w-4xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Profile Information</h2>
                    <Button
                      onClick={() => navigate('/provider-registration')}
                      icon={<Edit className="h-4 w-4" />}
                    >
                      Edit Profile
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Business Name
                            </label>
                            <p className="text-gray-900 font-medium">{profile.name}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Category
                            </label>
                            <p className="text-gray-900">{profile.category}</p>
                          </div>

                          {profile.subcategory && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Specialization
                              </label>
                              <p className="text-gray-900">{profile.subcategory}</p>
                            </div>
                          )}
                          
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
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              profile.available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                profile.available ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              {profile.available ? 'Available' : 'Offline'}
                            </div>
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <p className="text-gray-900 leading-relaxed">{profile.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          onClick={() => navigate('/provider-registration')}
                          icon={<Edit className="h-4 w-4" />}
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

                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold mb-4">Performance Summary</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Bookings</span>
                            <span className="font-medium">{stats.totalBookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-medium">{stats.completionRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Average Rating</span>
                            <span className="font-medium">{stats.averageRating.toFixed(1)}★</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Earnings</span>
                            <span className="font-medium">₹{stats.totalEarnings.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold mb-4">Account Details</h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-gray-600">Member since:</span>
                            <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Profile ID:</span>
                            <p className="font-mono text-xs">{profile.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold mb-6">Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Booking Notifications</p>
                            <p className="text-sm text-gray-600">Get notified when you receive new bookings</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Payment Notifications</p>
                            <p className="text-sm text-gray-600">Get notified about payment updates</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Review Notifications</p>
                            <p className="text-sm text-gray-600">Get notified when customers leave reviews</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold mb-4">Availability Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Working Hours
                          </label>
                          <input
                            type="text"
                            defaultValue="Mon-Sat 9AM-6PM"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Radius (km)
                          </label>
                          <input
                            type="number"
                            defaultValue="25"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold mb-4">Account Actions</h3>
                      <div className="space-y-3">
                        <Button variant="outline" fullWidth>
                          Change Password
                        </Button>
                        <Button variant="outline" fullWidth>
                          Download My Data
                        </Button>
                        <Button variant="outline" fullWidth className="text-red-600 border-red-200 hover:bg-red-50">
                          Deactivate Account
                        </Button>
                      </div>
                    </div>
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