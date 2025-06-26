import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield,
  Calendar,
  MessageSquare,
  BarChart,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  User,
  Wrench,
  AlertTriangle,
  Star,
  Eye,
  UserPlus,
  Settings,
  Bell,
  Activity,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { supabase, User as UserType, Contact, ServiceProvider, ServiceBooking, BookingAssignment } from '../lib/supabase';
import toast from 'react-hot-toast';

interface BookingWithDetails extends ServiceBooking {
  assigned_provider?: ServiceProvider;
  assignment?: BookingAssignment;
}

const AdminDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'providers' | 'contacts'>('users');
  const [users, setUsers] = useState<UserType[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    assignedBookings: 0,
    completedBookings: 0,
    totalProviders: 0,
    availableProviders: 0,
    totalContacts: 0
  });

  useEffect(() => {
    if (!user || !userProfile) {
      navigate('/');
      return;
    }

    if (userProfile.user_type !== 'admin' || userProfile.status !== 'approved') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchAdminData();
  }, [user, userProfile, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch service providers
      const { data: providersData, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (providersError) throw providersError;
      setProviders(providersData || []);

      // Fetch service bookings (main booking table)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_bookings')
        .select(`
          *,
          assignment:booking_assignments(
            *,
            provider:service_providers(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // Calculate stats
      const pendingUsers = (usersData || []).filter(u => u.status === 'pending').length;
      const approvedUsers = (usersData || []).filter(u => u.status === 'approved').length;
      const rejectedUsers = (usersData || []).filter(u => u.status === 'rejected').length;
      const pendingBookings = (bookingsData || []).filter(b => b.status === 'pending').length;
      const assignedBookings = (bookingsData || []).filter(b => b.status === 'assigned').length;
      const completedBookings = (bookingsData || []).filter(b => b.status === 'completed').length;
      const availableProviders = (providersData || []).filter(p => p.available).length;

      setStats({
        totalUsers: (usersData || []).length,
        pendingUsers,
        approvedUsers,
        rejectedUsers,
        totalBookings: (bookingsData || []).length,
        pendingBookings,
        assignedBookings,
        completedBookings,
        totalProviders: (providersData || []).length,
        availableProviders,
        totalContacts: (contactsData || []).length
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${action}d successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleAssignProvider = async (bookingId: string, providerId: string) => {
    try {
      // Create booking assignment
      const { error: assignmentError } = await supabase
        .from('booking_assignments')
        .insert([
          {
            booking_id: bookingId,
            provider_id: providerId,
            assigned_by: user?.id,
            assignment_type: 'manual',
            provider_accepted: false
          }
        ]);

      if (assignmentError) throw assignmentError;

      // Update booking status
      const { error: bookingError } = await supabase
        .from('service_bookings')
        .update({ status: 'assigned' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      toast.success('Technician assigned successfully!');
      setShowAssignModal(false);
      setSelectedBooking(null);
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to assign technician');
    }
  };

  const openAssignModal = async (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    
    // Fetch available providers
    const { data: providers, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('available', true)
      .order('average_rating', { ascending: false });

    if (error) {
      toast.error('Failed to load available technicians');
      return;
    }

    setAvailableProviders(providers || []);
    setShowAssignModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesType = userTypeFilter === 'all' || user.user_type === userTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage users, bookings, technicians, and platform operations</p>
          </div>

          {/* Critical Alerts */}
          {stats.pendingUsers > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-red-600 mr-2 animate-pulse" />
                <div>
                  <p className="text-red-800 font-medium">
                    🚨 {stats.pendingUsers} user{stats.pendingUsers > 1 ? 's' : ''} waiting for approval!
                  </p>
                  <p className="text-red-700 text-sm">
                    New registrations need your immediate attention. Click "User Management" to approve or reject accounts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                  <p className="text-3xl font-bold text-red-600">{stats.pendingUsers}</p>
                  <p className="text-xs text-red-600 mt-1">Need Immediate Action</p>
                </div>
                <div className="relative">
                  <UserCheck className="h-8 w-8 text-red-500" />
                  {stats.pendingUsers > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                  <p className="text-xs text-orange-600 mt-1">Need Assignment</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedUsers}</p>
                  <p className="text-xs text-green-600 mt-1">Active Users</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Platform Activity</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  <p className="text-xs text-blue-600 mt-1">Total Bookings</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'users'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  User Management
                  {stats.pendingUsers > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-pulse">
                      {stats.pendingUsers}
                    </span>
                  )}
                </button>
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
                  Booking Management
                  {stats.pendingBookings > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
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
                  Technicians
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
                  Contacts
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'users' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">User Management & Approvals</h2>
                    <div className="text-sm text-gray-600">
                      Total: {stats.totalUsers} | Pending: {stats.pendingUsers} | Approved: {stats.approvedUsers} | Rejected: {stats.rejectedUsers}
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search users..."
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
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="relative">
                      <select
                        value={userTypeFilter}
                        onChange={(e) => setUserTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="customer">Customers</option>
                        <option value="provider">Providers</option>
                        <option value="admin">Admins</option>
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
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                          <tr key={user.id} className={`hover:bg-gray-50 ${user.status === 'pending' ? 'bg-orange-50' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                  user.user_type === 'admin' ? 'bg-red-100' :
                                  user.user_type === 'provider' ? 'bg-blue-100' : 'bg-green-100'
                                }`}>
                                  {user.user_type === 'admin' ? <Shield className="h-5 w-5 text-red-600" /> :
                                   user.user_type === 'provider' ? <Wrench className="h-5 w-5 text-blue-600" /> :
                                   <User className="h-5 w-5 text-green-600" />}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.user_type === 'provider' 
                                  ? 'bg-green-100 text-green-800' 
                                  : user.user_type === 'admin'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.user_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status}
                                {user.status === 'pending' && (
                                  <span className="ml-1 animate-pulse">⏳</span>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {user.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUserAction(user.id, 'approve')}
                                    icon={<CheckCircle className="h-4 w-4" />}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUserAction(user.id, 'reject')}
                                    icon={<XCircle className="h-4 w-4" />}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {user.status === 'approved' && (
                                <span className="text-green-600 text-sm">✓ Active</span>
                              )}
                              {user.status === 'rejected' && (
                                <span className="text-red-600 text-sm">✗ Rejected</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600">
                        {users.length === 0 
                          ? 'No users have registered yet.' 
                          : 'No users match your current filters.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Recent User Registrations</h3>
                      <div className="space-y-3">
                        {users.filter(u => u.status === 'pending').slice(0, 5).map(user => (
                          <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name}</p>
                              <p className="text-sm text-gray-500">{user.email} • {user.user_type}</p>
                              <p className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-xs"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'reject')}
                                className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                        {users.filter(u => u.status === 'pending').length === 0 && (
                          <p className="text-gray-500 text-center py-4">No pending approvals</p>
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
                          <span className="text-gray-600">Pending Approvals</span>
                          <span className="font-medium text-orange-600">{stats.pendingUsers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Providers</span>
                          <span className="font-medium">{stats.availableProviders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Bookings</span>
                          <span className="font-medium">{stats.totalBookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed Jobs</span>
                          <span className="font-medium text-green-600">{stats.completedBookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Success Rate</span>
                          <span className="font-medium">
                            {stats.totalBookings > 0 
                              ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                              : 0}%
                          </span>
                
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">Booking Management</h2>
                    <div className="text-sm text-gray-600">
                      Total: {stats.totalBookings} | Pending: {stats.pendingBookings} | Assigned: {stats.assignedBookings}
                    </div>
                  </div>

                  {/* Search and Filter */}
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
                        <option value="pending">Pending Assignment</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
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
                            Service & Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact & Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status & Priority
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
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.service_name}</div>
                                <div className="text-sm text-gray-500">{booking.customer_name}</div>
                                {booking.description && (
                                  <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                    {booking.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="flex items-center mb-1">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {booking.customer_phone}
                                </div>
                                <div className="flex items-center mb-1">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {booking.customer_email}
                                </div>
                                <div className="flex items-start">
                                  <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs text-gray-500 max-w-xs">
                                    {booking.service_address}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {booking.status.replace('_', ' ')}
                                </span>
                                <span className={`block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(booking.urgency)}`}>
                                  {booking.urgency} priority
                                </span>
                                <div className="text-xs text-gray-500">
                                  {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString() : 'Flexible'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Created: {new Date(booking.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {booking.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => openAssignModal(booking)}
                                    icon={<UserPlus className="h-4 w-4" />}
                                    className="bg-orange-500 hover:bg-orange-600"
                                  >
                                    Assign
                                  </Button>
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
                      <p className="text-gray-600">
                        {bookings.length === 0 
                          ? 'No bookings have been submitted yet.' 
                          : 'No bookings match your current filters.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'providers' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Technician Management</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalProviders}</div>
                      <div className="text-sm text-gray-600">Total Technicians</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{stats.availableProviders}</div>
                      <div className="text-sm text-gray-600">Available Now</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{stats.assignedBookings}</div>
                      <div className="text-sm text-gray-600">Currently Assigned</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">{stats.completedBookings}</div>
                      <div className="text-sm text-gray-600">Jobs Completed</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Technician
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {providers.map(provider => (
                          <tr key={provider.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-blue-100 rounded-full p-2 mr-3">
                                  <Wrench className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                                  <div className="text-sm text-gray-500">{provider.contact}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {provider.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                provider.available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {provider.available ? 'Available' : 'Busy'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-sm text-gray-900">{provider.average_rating || 0}</span>
                                <span className="text-sm text-gray-500 ml-2">({provider.review_count || 0} reviews)</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<Settings className="h-4 w-4" />}
                              >
                                Manage
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Contact Messages</h2>
                  
                  <div className="space-y-4">
                    {contacts.map(contact => (
                      <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{contact.subject}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>{contact.name}</span>
                              <span>{contact.email}</span>
                              {contact.phone && <span>{contact.phone}</span>}
                              {contact.service_type && <span>Service: {contact.service_type}</span>}
                              <span>{new Date(contact.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-700">
                          <p className="whitespace-pre-wrap">{contact.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Technician Assignment Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold">Assign Technician</h2>
                <p className="text-gray-600 mt-1">
                  Service: {selectedBooking.service_name} for {selectedBooking.customer_name}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedBooking.urgency)}`}>
                    {selectedBooking.urgency} priority
                  </span>
                  {selectedBooking.estimated_price && selectedBooking.estimated_price > 0 && (
                    <span className="text-sm text-gray-600">Budget: ₹{selectedBooking.estimated_price}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Available Technicians</h3>
                <div className="space-y-3">
                  {availableProviders.map(provider => (
                    <div 
                      key={provider.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleAssignProvider(selectedBooking.id, provider.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full p-3 mr-4">
                            <Wrench className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                            <p className="text-sm text-gray-500">{provider.category}</p>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <Star className="h-4 w-4 mr-1 text-yellow-400" />
                              {provider.average_rating || 0} ({provider.review_count || 0} reviews)
                            </div>
                            {provider.location && (
                              <p className="text-xs text-gray-400 mt-1">{provider.location}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {availableProviders.length === 0 && (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Technicians</h3>
                    <p className="text-gray-600">
                      All technicians are currently busy or offline.
                    </p>
                  </div>
                )}
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