import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  Settings,
  BarChart,
  Shield,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  MapPin,
  FileText,
  User,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface RegistrationRequest {
  id: string;
  email: string;
  user_type: 'customer' | 'provider';
  provider_details?: {
    name: string;
    category: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ServiceBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  service_address: string;
  preferred_date: string;
  preferred_time_slot: string;
  urgency: string;
  status: string;
  description: string;
  estimated_price: number;
  created_at: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  location: string;
  contact: string;
  available: boolean;
  average_rating: number;
  created_at: string;
}

interface AdminStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalBookings: number;
  pendingBookings: number;
  assignedBookings: number;
  completedBookings: number;
  totalProviders: number;
  availableProviders: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'bookings' | 'providers' | 'settings'>('overview');
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalBookings: 0,
    pendingBookings: 0,
    assignedBookings: 0,
    completedBookings: 0,
    totalProviders: 0,
    availableProviders: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    availableProviders: ServiceProvider[];
  }>({
    isOpen: false,
    bookingId: '',
    availableProviders: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    checkAdminAccess();
  }, [user, navigate]);

  const checkAdminAccess = async () => {
    try {
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_management')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (adminError || !adminData) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      // User is admin, fetch dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error('Failed to verify admin access');
      navigate('/');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch registration requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('user_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setRegistrationRequests(requestsData || []);

      // Fetch service bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setServiceBookings(bookingsData || []);

      // Fetch service providers
      const { data: providersData, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (providersError) throw providersError;
      setServiceProviders(providersData || []);

      // Calculate stats
      const totalRequests = requestsData?.length || 0;
      const pendingRequests = requestsData?.filter(r => r.status === 'pending').length || 0;
      const approvedRequests = requestsData?.filter(r => r.status === 'approved').length || 0;
      const rejectedRequests = requestsData?.filter(r => r.status === 'rejected').length || 0;

      const totalBookings = bookingsData?.length || 0;
      const pendingBookings = bookingsData?.filter(b => b.status === 'pending').length || 0;
      const assignedBookings = bookingsData?.filter(b => b.status === 'assigned').length || 0;
      const completedBookings = bookingsData?.filter(b => b.status === 'completed').length || 0;

      const totalProviders = providersData?.length || 0;
      const availableProviders = providersData?.filter(p => p.available).length || 0;

      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalBookings,
        pendingBookings,
        assignedBookings,
        completedBookings,
        totalProviders,
        availableProviders
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setLoading(true);

      const request = registrationRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Create user account via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: 'TempPassword123!', // User will need to reset password
        email_confirm: true
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create approval status record
        const { error: approvalError } = await supabase
          .from('user_approval_status')
          .insert([
            {
              user_id: authData.user.id,
              email: request.email,
              user_type: request.user_type,
              status: 'approved',
              approved_by: user?.id,
              approved_at: new Date().toISOString()
            }
          ]);

        if (approvalError) throw approvalError;

        // If provider, create service provider record
        if (request.user_type === 'provider' && request.provider_details) {
          const { error: providerError } = await supabase
            .from('service_providers')
            .insert([
              {
                user_id: authData.user.id,
                name: request.provider_details.name,
                category: request.provider_details.category,
                available: false // Initially offline until profile is completed
              }
            ]);

          if (providerError) throw providerError;
        }

        // Update request status
        const { error: updateError } = await supabase
          .from('user_registration_requests')
          .update({
            status: 'approved',
            approved_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId);

        if (updateError) throw updateError;

        toast.success('User registration approved successfully!');
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_registration_requests')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          admin_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('User registration rejected');
      setSelectedRequest(null);
      setRejectionReason('');
      await fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProvider = async (bookingId: string) => {
    try {
      // Get booking details
      const booking = serviceBookings.find(b => b.id === bookingId);
      if (!booking) {
        toast.error('Booking not found');
        return;
      }

      // Find available providers for this service
      const { data: availableProviders, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('available', true)
        .ilike('category', `%${booking.service_name.split(' ')[0]}%`);

      if (error) throw error;

      setAssignmentModal({
        isOpen: true,
        bookingId,
        availableProviders: availableProviders || []
      });
    } catch (error) {
      console.error('Error fetching available providers:', error);
      toast.error('Failed to fetch available providers');
    }
  };

  const handleManualAssign = async (bookingId: string, providerId: string) => {
    try {
      setLoading(true);

      // Call the manual assignment function
      const { error } = await supabase.rpc('manual_assign_provider', {
        booking_id_param: bookingId,
        provider_id_param: providerId,
        admin_id_param: user?.id,
        notes_param: 'Manually assigned by admin'
      });

      if (error) throw error;

      toast.success('Provider assigned successfully!');
      setAssignmentModal({ isOpen: false, bookingId: '', availableProviders: [] });
      await fetchDashboardData();
    } catch (error) {
      console.error('Error assigning provider:', error);
      toast.error('Failed to assign provider');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = registrationRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.user_type === typeFilter;
    const matchesSearch = request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.provider_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'approved':
      case 'assigned':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
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
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && registrationRequests.length === 0) {
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
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage user registrations, service bookings, and platform settings</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={fetchDashboardData}
                variant="outline"
                icon={<RefreshCw className="h-4 w-4" />}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500 mt-1">User registrations</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Bookings</h3>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Need assignment</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Active Providers</h3>
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.availableProviders}</p>
              <p className="text-sm text-gray-500 mt-1">Available now</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <BarChart className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Services done</p>
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
                    activeTab === 'requests'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('requests')}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Registration Requests
                  {stats.pendingRequests > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingRequests}
                    </span>
                  )}
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
                  Service Bookings
                  {stats.pendingBookings > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingBookings}
                    </span>
                  )}
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'providers'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('providers')}
                >
                  <Wrench className="h-4 w-4 inline mr-2" />
                  Service Providers
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'settings'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Settings
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Registration Requests</h3>
                      <div className="space-y-3">
                        {registrationRequests.slice(0, 5).map(request => (
                          <div key={request.id} className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium">{request.email}</p>
                              <p className="text-sm text-gray-500">
                                {request.user_type} • {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {getStatusIcon(request.status)}
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {registrationRequests.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No registration requests yet</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Service Bookings</h3>
                      <div className="space-y-3">
                        {serviceBookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium">{booking.service_name}</p>
                              <p className="text-sm text-gray-500">
                                {booking.customer_name} • {new Date(booking.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {getStatusIcon(booking.status)}
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {serviceBookings.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No service bookings yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {(stats.pendingRequests > 0 || stats.pendingBookings > 0) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                        <p className="text-orange-800 font-medium">
                          You have {stats.pendingRequests} pending registration request{stats.pendingRequests !== 1 ? 's' : ''} 
                          {stats.pendingBookings > 0 && ` and ${stats.pendingBookings} unassigned booking${stats.pendingBookings !== 1 ? 's' : ''}`} 
                          awaiting your attention.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">Registration Requests</h2>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search by email or name..."
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
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="relative">
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="customer">Customer</option>
                        <option value="provider">Provider</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map(request => (
                          <tr key={request.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{request.email}</div>
                                {request.provider_details && (
                                  <div className="text-sm text-gray-500">
                                    {request.provider_details.name} • {request.provider_details.category}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.user_type === 'provider' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {request.user_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(request.status)}
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {request.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(request.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveRequest(request.id)}
                                    disabled={loading}
                                    icon={<CheckCircle className="h-4 w-4" />}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedRequest(request)}
                                    icon={<XCircle className="h-4 w-4" />}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<Eye className="h-4 w-4" />}
                                className="ml-2"
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                      <p className="text-gray-600">
                        {registrationRequests.length === 0 
                          ? 'No registration requests have been submitted yet.' 
                          : 'No requests match your current filters.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">Service Bookings</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Urgency
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {serviceBookings.map(booking => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                                <div className="text-sm text-gray-500">{booking.customer_email}</div>
                                <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.service_name}</div>
                                <div className="text-sm text-gray-500">₹{booking.estimated_price}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(booking.urgency)}`}>
                                {booking.urgency}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(booking.status)}
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                  booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {booking.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAssignProvider(booking.id)}
                                    icon={<ArrowRight className="h-4 w-4" />}
                                  >
                                    Assign Provider
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedBooking(booking)}
                                  icon={<Eye className="h-4 w-4" />}
                                >
                                  View Details
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {serviceBookings.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                      <p className="text-gray-600">No service bookings have been submitted yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'providers' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Service Providers</h2>
                  
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
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {serviceProviders.map(provider => (
                          <tr key={provider.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                                <div className="text-sm text-gray-500">{provider.contact}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {provider.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {provider.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                provider.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {provider.available ? 'Available' : 'Offline'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span>{provider.average_rating || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<Eye className="h-4 w-4" />}
                              >
                                View Profile
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {serviceProviders.length === 0 && (
                    <div className="text-center py-12">
                      <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
                      <p className="text-gray-600">No service providers have been registered yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Admin Settings</h2>
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Admin settings coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reject Registration Request</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to reject the registration request for <strong>{selectedRequest.email}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide a reason for rejection..."
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRejectRequest(selectedRequest.id, rejectionReason)}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Rejecting...' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-blue-900">{selectedBooking.service_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedBooking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedBooking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      selectedBooking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">{selectedBooking.description}</p>
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm text-blue-700">Estimated Price: ₹{selectedBooking.estimated_price}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getUrgencyColor(selectedBooking.urgency)}`}>
                      {selectedBooking.urgency} priority
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{selectedBooking.customer_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p>{selectedBooking.customer_email}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p>{selectedBooking.customer_phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm">{selectedBooking.service_address}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p>
                            {selectedBooking.preferred_date 
                              ? new Date(selectedBooking.preferred_date).toLocaleDateString() 
                              : 'Flexible date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="capitalize">{selectedBooking.preferred_time_slot} time slot</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.special_instructions && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Special Instructions</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <p className="text-sm text-gray-700">{selectedBooking.special_instructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedBooking.status === 'pending' && (
                    <Button
                      onClick={() => {
                        setSelectedBooking(null);
                        handleAssignProvider(selectedBooking.id);
                      }}
                      className="flex-1"
                      icon={<ArrowRight className="h-4 w-4" />}
                    >
                      Assign Provider
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Assignment Modal */}
      {assignmentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold">Assign Service Provider</h3>
                <button
                  onClick={() => setAssignmentModal({ isOpen: false, bookingId: '', availableProviders: [] })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {assignmentModal.availableProviders.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Available Providers</h4>
                  <p className="text-gray-600 mb-6">
                    There are no available service providers for this category at the moment.
                  </p>
                  <Button
                    onClick={() => setAssignmentModal({ isOpen: false, bookingId: '', availableProviders: [] })}
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Select a service provider to assign to this booking:
                  </p>

                  <div className="space-y-3 mb-6">
                    {assignmentModal.availableProviders.map(provider => (
                      <div 
                        key={provider.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleManualAssign(assignmentModal.bookingId, provider.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                            <p className="text-sm text-gray-600">{provider.category}</p>
                            <div className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm text-gray-600">{provider.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium">{provider.average_rating || 'N/A'}</span>
                            </div>
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleManualAssign(assignmentModal.bookingId, provider.id);
                              }}
                            >
                              Assign
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setAssignmentModal({ isOpen: false, bookingId: '', availableProviders: [] })}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;