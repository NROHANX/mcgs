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
  RefreshCw
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

interface AdminStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'users' | 'settings'>('overview');
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalUsers: 0,
    totalProviders: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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
        .from('admin_users')
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

      // Calculate stats
      const totalRequests = requestsData?.length || 0;
      const pendingRequests = requestsData?.filter(r => r.status === 'pending').length || 0;
      const approvedRequests = requestsData?.filter(r => r.status === 'approved').length || 0;
      const rejectedRequests = requestsData?.filter(r => r.status === 'rejected').length || 0;

      // Fetch user counts (simplified - in production you'd have better user management)
      const { data: providersData } = await supabase
        .from('service_providers')
        .select('id');

      const totalProviders = providersData?.length || 0;

      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalUsers: approvedRequests, // Simplified
        totalProviders,
        totalCustomers: approvedRequests - totalProviders
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
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
              <p className="text-gray-600 mt-1">Manage user registrations and platform settings</p>
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

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Approved Users</h3>
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
              <p className="text-sm text-gray-500 mt-1">Active users</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Service Providers</h3>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
              <p className="text-sm text-gray-500 mt-1">Registered providers</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
                <BarChart className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              <p className="text-sm text-gray-500 mt-1">All time</p>
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
                    activeTab === 'users'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  <UserCheck className="h-4 w-4 inline mr-2" />
                  Manage Users
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
                      <h3 className="text-lg font-semibold mb-4">Platform Statistics</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approval Rate</span>
                          <span className="font-medium">
                            {stats.totalRequests > 0 
                              ? Math.round((stats.approvedRequests / stats.totalRequests) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Provider Ratio</span>
                          <span className="font-medium">
                            {stats.approvedRequests > 0 
                              ? Math.round((stats.totalProviders / stats.approvedRequests) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pending Review</span>
                          <span className="font-medium text-orange-600">
                            {stats.pendingRequests}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {stats.pendingRequests > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                        <p className="text-orange-800 font-medium">
                          You have {stats.pendingRequests} pending registration request{stats.pendingRequests !== 1 ? 's' : ''} awaiting approval.
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

              {activeTab === 'users' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">User Management</h2>
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">User management features coming soon</p>
                  </div>
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

      <Footer />
    </div>
  );
};

export default AdminDashboard;