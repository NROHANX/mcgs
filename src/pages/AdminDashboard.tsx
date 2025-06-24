import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Activity,
  UserCheck,
  Settings,
  Search,
  Filter,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Star,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AdminStats {
  totalProviders: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  activeUsers: number;
  totalContacts: number;
  avgRating: number;
}

interface BookingData {
  id: string;
  service_name: string;
  date: string;
  status: string;
  amount: number;
  provider_name: string;
  customer_email: string;
  created_at: string;
}

interface ProviderData {
  id: string;
  name: string;
  category: string;
  location: string;
  contact: string;
  available: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
}

interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  service_type: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'bookings' | 'contacts' | 'analytics'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalProviders: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalContacts: 0,
    avgRating: 0
  });
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user is admin
    if (user.email !== 'ashish15.nehamaiyah@gmail.com') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch providers
      const { data: providersData, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (providersError) throw providersError;

      // Fetch bookings with provider and customer info
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          service_providers!inner(name),
          users!bookings_customer_id_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;

      // Process data
      const processedBookings = bookingsData?.map(booking => ({
        id: booking.id,
        service_name: booking.service_name,
        date: booking.date,
        status: booking.status,
        amount: parseFloat(booking.amount),
        provider_name: booking.service_providers?.name || 'Unknown',
        customer_email: booking.users?.email || 'Unknown',
        created_at: booking.created_at
      })) || [];

      setProviders(providersData || []);
      setBookings(processedBookings);
      setContacts(contactsData || []);

      // Calculate stats
      const totalRevenue = processedBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.amount, 0);

      const avgRating = providersData?.length > 0 
        ? providersData.reduce((sum, p) => sum + (p.average_rating || 0), 0) / providersData.length 
        : 0;

      setStats({
        totalProviders: providersData?.length || 0,
        totalBookings: processedBookings.length,
        pendingBookings: processedBookings.filter(b => b.status === 'pending').length,
        completedBookings: processedBookings.filter(b => b.status === 'completed').length,
        cancelledBookings: processedBookings.filter(b => b.status === 'cancelled').length,
        totalRevenue,
        activeUsers: providersData?.filter(p => p.available).length || 0,
        totalContacts: contactsData?.length || 0,
        avgRating
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
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
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const toggleProviderStatus = async (providerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .update({ available: !currentStatus })
        .eq('id', providerId);

      if (error) throw error;

      toast.success('Provider status updated');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update provider status');
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast.success('Contact deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const exportData = (type: 'bookings' | 'providers' | 'contacts') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'bookings':
        data = bookings;
        filename = 'bookings_export.csv';
        break;
      case 'providers':
        data = providers;
        filename = 'providers_export.csv';
        break;
      case 'contacts':
        data = contacts;
        filename = 'contacts_export.csv';
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
    const matchesSearch = booking.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || provider.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.service_type && contact.service_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [...new Set(providers.map(p => p.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Comprehensive platform management and analytics</p>
              </div>
              <div className="ml-auto">
                <Button
                  onClick={fetchAdminData}
                  variant="outline"
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Refresh Data
                </Button>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">
                  Admin Access - Logged in as: {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Providers</h3>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeUsers} active
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-orange-600 mt-1">
                {stats.pendingBookings} pending
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.completedBookings} completed
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Avg Rating</h3>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Platform average
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Contact Forms</h3>
                <Mail className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
              <p className="text-sm text-gray-500 mt-1">
                Total inquiries
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'providers', label: 'Service Providers', icon: Users },
                  { id: 'bookings', label: 'Bookings', icon: Calendar },
                  { id: 'contacts', label: 'Contact Forms', icon: Mail },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Search and Filter */}
              {(activeTab === 'providers' || activeTab === 'bookings' || activeTab === 'contacts') && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {activeTab === 'bookings' && (
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
                  )}

                  {activeTab === 'providers' && (
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    onClick={() => exportData(activeTab as any)}
                    variant="outline"
                    icon={<Download className="h-4 w-4" />}
                  >
                    Export
                  </Button>
                </div>
              )}

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Quick Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Completion Rate</p>
                          <p className="text-2xl font-bold">
                            {stats.totalBookings > 0 
                              ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                              : 0}%
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Active Providers</p>
                          <p className="text-2xl font-bold">
                            {stats.totalProviders > 0 
                              ? Math.round((stats.activeUsers / stats.totalProviders) * 100)
                              : 0}%
                          </p>
                        </div>
                        <UserCheck className="h-8 w-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Avg Revenue/Booking</p>
                          <p className="text-2xl font-bold">
                            ₹{stats.completedBookings > 0 
                              ? Math.round(stats.totalRevenue / stats.completedBookings)
                              : 0}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">Pending Actions</p>
                          <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-200" />
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
                              <p className="text-xs text-gray-500">{booking.provider_name}</p>
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
                        Top Performing Providers
                      </h3>
                      <div className="space-y-3">
                        {providers
                          .sort((a, b) => b.average_rating - a.average_rating)
                          .slice(0, 5)
                          .map(provider => (
                            <div key={provider.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                              <div>
                                <p className="font-medium text-sm">{provider.name}</p>
                                <p className="text-xs text-gray-500">{provider.category}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">★ {provider.average_rating.toFixed(1)}</p>
                                <p className="text-xs text-gray-500">{provider.review_count} reviews</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'providers' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
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
                      {filteredProviders.map(provider => (
                        <tr key={provider.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                              <div className="text-sm text-gray-500">
                                Joined {new Date(provider.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {provider.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {provider.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {provider.contact}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              {provider.average_rating.toFixed(1)} ({provider.review_count})
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              provider.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {provider.available ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={provider.available ? 'outline' : 'primary'}
                                onClick={() => toggleProviderStatus(provider.id, provider.available)}
                              >
                                {provider.available ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.provider_name}
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
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {filteredContacts.map(contact => (
                      <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 mr-3">{contact.name}</h3>
                              {contact.service_type && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                  {contact.service_type}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {contact.email}
                              </div>
                              {contact.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {contact.phone}
                                </div>
                              )}
                              <div className="text-gray-500">
                                {new Date(contact.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{contact.subject}</h4>
                            <p className="text-gray-700 leading-relaxed">{contact.message}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`mailto:${contact.email}?subject=Re: ${contact.subject}`)}
                              icon={<Mail className="h-4 w-4" />}
                            >
                              Reply
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteContact(contact.id)}
                              icon={<Trash2 className="h-4 w-4" />}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredContacts.length === 0 && (
                    <div className="text-center py-12">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No contact forms found</h3>
                      <p className="text-gray-600">No contact submissions match your search criteria.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Service Category Distribution */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <PieChart className="h-5 w-5 mr-2" />
                        Provider Categories
                      </h3>
                      <div className="space-y-3">
                        {categories.map(category => {
                          const count = providers.filter(p => p.category === category).length;
                          const percentage = providers.length > 0 ? (count / providers.length) * 100 : 0;
                          return (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{category}</span>
                              <div className="flex items-center">
                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Booking Status Distribution */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
                      <div className="space-y-3">
                        {[
                          { status: 'completed', count: stats.completedBookings, color: 'bg-green-600' },
                          { status: 'pending', count: stats.pendingBookings, color: 'bg-orange-600' },
                          { status: 'cancelled', count: stats.cancelledBookings, color: 'bg-red-600' }
                        ].map(item => {
                          const percentage = stats.totalBookings > 0 ? (item.count / stats.totalBookings) * 100 : 0;
                          return (
                            <div key={item.status} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                              <div className="flex items-center">
                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`${item.color} h-2 rounded-full`} 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{item.count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Revenue Insights */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-4">Revenue Insights</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Revenue</span>
                          <span className="font-medium">₹{stats.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg per Booking</span>
                          <span className="font-medium">
                            ₹{stats.completedBookings > 0 
                              ? Math.round(stats.totalRevenue / stats.completedBookings).toLocaleString()
                              : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="font-medium">
                            {stats.totalBookings > 0 
                              ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Trends */}
                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                        <div className="text-sm text-gray-600">Active Providers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.avgRating.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Platform Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalContacts}</div>
                        <div className="text-sm text-gray-600">Total Inquiries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {stats.totalBookings > 0 
                            ? Math.round((stats.pendingBookings / stats.totalBookings) * 100)
                            : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Pending Rate</div>
                      </div>
                    </div>
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

export default AdminDashboard;