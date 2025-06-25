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
  Mail, 
  Phone, 
  Calendar,
  Filter,
  Search,
  Download,
  AlertTriangle,
  Shield,
  Settings,
  BarChart,
  MessageSquare,
  FileText,
  TrendingUp,
  Award,
  Star,
  MapPin
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
    name?: string;
    category?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ApprovalStatus {
  id: string;
  user_id: string;
  email: string;
  user_type: 'customer' | 'provider';
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
}

interface ServiceBooking {
  id: string;
  customer_email: string;
  service_name: string;
  customer_name: string;
  customer_phone: string;
  service_address: string;
  preferred_date?: string;
  urgency: string;
  status: string;
  estimated_price?: number;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  pendingRequests: number;
  approvedUsers: number;
  rejectedUsers: number;
  totalBookings: number;
  pendingBookings: number;
  totalContacts: number;
  totalProviders: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'users' | 'bookings' | 'contacts'>('overview');
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [approvalStatuses, setApprovalStatuses] = useState<ApprovalStatus[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingRequests: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalContacts: 0,
    totalProviders: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

      // Fetch registration requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('user_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching registration requests:', requestsError);
        setRegistrationRequests([]);
      } else {
        setRegistrationRequests(requestsData || []);
      }

      // Fetch approval statuses
      const { data: statusData, error: statusError } = await supabase
        .from('user_approval_status')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusError) {
        console.error('Error fetching approval statuses:', statusError);
        setApprovalStatuses([]);
      } else {
        setApprovalStatuses(statusData || []);
      }

      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        setContacts([]);
      } else {
        setContacts(contactsData || []);
      }

      // Fetch service bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        setBookings([]);
      } else {
        setBookings(bookingsData || []);
      }

      // Calculate stats
      const pendingRequests = (requestsData || []).filter(r => r.status === 'pending').length;
      const approvedUsers = (statusData || []).filter(s => s.status === 'approved').length;
      const rejectedUsers = (statusData || []).filter(s => s.status === 'rejected').length;
      const pendingBookings = (bookingsData || []).filter(b => b.status === 'pending').length;
      const totalProviders = (statusData || []).filter(s => s.user_type === 'provider' && s.status === 'approved').length;

      setStats({
        totalUsers: (statusData || []).length,
        pendingRequests,
        approvedUsers,
        rejectedUsers,
        totalBookings: (bookingsData || []).length,
        pendingBookings,
        totalContacts: (contactsData || []).length,
        totalProviders
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const request = registrationRequests.find(r => r.id === requestId);
      if (!request) return;

      // Create user via Supabase Auth Admin API would be needed here
      // For now, we'll simulate the approval process
      
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

      toast.success(`${request.user_type} registration approved successfully!`);
      toast.success('User will receive an email with login instructions.');
      
      fetchAdminData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string, reason?: string) => {
    try {
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

      toast.success('Registration request rejected');
      fetchAdminData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const exportData = (type: 'requests' | 'users' | 'contacts' | 'bookings') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'requests':
        data = registrationRequests;
        filename = 'registration_requests.csv';
        break;
      case 'users':
        data = approvalStatuses;
        filename = 'user_statuses.csv';
        break;
      case 'contacts':
        data = contacts;
        filename = 'contacts.csv';
        break;
      case 'bookings':
        data = bookings;
        filename = 'service_bookings.csv';
        break;
    }

    if (data.length === 0) {
      toast.error(`No ${type} data to export`);
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const csvContent = [
      headers,
      ...data.map(item => Object.values(item).map(val => `"${val}"`).join(','))
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

  const filteredRequests = registrationRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.user_type === typeFilter;
    const matchesSearch = request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.provider_details?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const filteredUsers = approvalStatuses.filter(user => {
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesType = typeFilter === 'all' || user.user_type === typeFilter;
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

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
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-red-600 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage users, registrations, and platform operations</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium">
                Super Admin Access
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Providers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
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
                  <Clock className="h-4 w-4 inline mr-2" />
                  Registration Requests
                  {stats.pendingRequests > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingRequests}
                    </span>
                  )}
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'users'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  All Users
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
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingBookings}
                    </span>
                  )}
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'contacts'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('contacts')}
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Contact Messages
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
                              <p className="text-sm text-gray-500 capitalize">{request.user_type}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        ))}
                        {registrationRequests.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No registration requests</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Platform Statistics</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Users</span>
                          <span className="font-medium">{stats.totalUsers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Providers</span>
                          <span className="font-medium">{stats.totalProviders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Bookings</span>
                          <span className="font-medium">{stats.totalBookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact Messages</span>
                          <span className="font-medium">{stats.totalContacts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approval Rate</span>
                          <span className="font-medium">
                            {stats.totalUsers > 0 
                              ? Math.round((stats.approvedUsers / stats.totalUsers) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Button
                        onClick={() => setActiveTab('requests')}
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Review Requests ({stats.pendingRequests})
                      </Button>
                      <Button
                        onClick={() => exportData('requests')}
                        variant="outline"
                        icon={<Download className="h-4 w-4" />}
                      >
                        Export Requests
                      </Button>
                      <Button
                        onClick={() => exportData('users')}
                        variant="outline"
                        icon={<Download className="h-4 w-4" />}
                      >
                        Export Users
                      </Button>
                      <Button
                        onClick={() => exportData('bookings')}
                        variant="outline"
                        icon={<Download className="h-4 w-4" />}
                      >
                        Export Bookings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">Registration Requests</h2>
                    <Button
                      onClick={() => exportData('requests')}
                      variant="outline"
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export
                    </Button>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
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

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map(request => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{request.email}</div>
                                {request.provider_details?.name && (
                                  <div className="text-sm text-gray-500">
                                    Business: {request.provider_details.name}
                                  </div>
                                )}
                                {request.provider_details?.category && (
                                  <div className="text-sm text-gray-500">
                                    Category: {request.provider_details.category}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.user_type === 'provider' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {request.user_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(request.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveRequest(request.id)}
                                    icon={<CheckCircle className="h-4 w-4" />}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectRequest(request.id)}
                                    icon={<XCircle className="h-4 w-4" />}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {request.status !== 'pending' && (
                                <span className="text-gray-500">
                                  {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No registration requests found</h3>
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

              {activeTab === 'users' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">All Users</h2>
                    <Button
                      onClick={() => exportData('users')}
                      variant="outline"
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export
                    </Button>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{stats.approvedUsers}</div>
                      <div className="text-sm text-gray-600">Approved</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">{stats.rejectedUsers}</div>
                      <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Approved Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.user_type === 'provider' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.user_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'approved' ? 'bg-green-100 text-green-800' :
                                user.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.approved_at ? new Date(user.approved_at).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">Service Bookings</h2>
                    <Button
                      onClick={() => exportData('bookings')}
                      variant="outline"
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export
                    </Button>
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
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map(booking => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                                <div className="text-sm text-gray-500">{booking.customer_email}</div>
                                <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.service_name}</div>
                              <div className="text-sm text-gray-500">{booking.service_address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString() : 'Flexible'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{booking.estimated_price || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {bookings.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                      <p className="text-gray-600">No service bookings have been submitted yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contacts' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">Contact Messages</h2>
                    <Button
                      onClick={() => exportData('contacts')}
                      variant="outline"
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {contacts.map(contact => (
                      <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{contact.subject}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {contact.email}
                              </span>
                              {contact.phone && (
                                <span className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {contact.phone}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(contact.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-700 mb-4">
                          <strong>From:</strong> {contact.name}
                        </div>
                        <div className="text-gray-700">
                          <strong>Message:</strong>
                          <p className="mt-2 whitespace-pre-wrap">{contact.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {contacts.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No contact messages</h3>
                      <p className="text-gray-600">No contact form submissions have been received yet.</p>
                    </div>
                  )}
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