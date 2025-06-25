import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  Calendar, 
  CreditCard, 
  Package, 
  MessageSquare, 
  Plus,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Filter,
  Search,
  TrendingUp,
  Award,
  Shield,
  Phone,
  Mail,
  MapPin,
  Heart,
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

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  completeAddress: string;
  bio: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsAlerts: boolean;
  };
}

interface ServiceTaken {
  id: string;
  service_name: string;
  provider_name: string;
  provider_contact: string;
  date: string;
  status: string;
  amount: number;
  rating?: number;
  review?: string;
  created_at: string;
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

interface CustomerStats {
  totalServices: number;
  completedServices: number;
  pendingServices: number;
  cancelledServices: number;
  totalSpent: number;
  averageRating: number;
  favoriteCategory: string;
  memberSince: string;
}

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'subscription' | 'support' | 'settings'>('profile');
  const [isProvider, setIsProvider] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    location: '',
    completeAddress: '',
    bio: '',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: false
    }
  });
  const [servicesTaken, setServicesTaken] = useState<ServiceTaken[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketData[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    totalServices: 0,
    completedServices: 0,
    pendingServices: 0,
    cancelledServices: 0,
    totalSpent: 0,
    averageRating: 0,
    favoriteCategory: '',
    memberSince: ''
  });
  const [loading, setLoading] = useState(true);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
          location: providerData.location || '',
          completeAddress: providerData.complete_address || '',
          bio: providerData.description || '',
          preferences: {
            notifications: true,
            emailUpdates: true,
            smsAlerts: false
          }
        });
      } else {
        setProfile({
          name: user?.email?.split('@')[0] || '',
          email: user?.email || '',
          phone: '',
          location: '',
          completeAddress: '',
          bio: '',
          preferences: {
            notifications: true,
            emailUpdates: true,
            smsAlerts: false
          }
        });
      }

      // Fetch services taken by user with provider details
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          service_providers!inner(name, contact)
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      const processedServices = bookingsData?.map(booking => ({
        id: booking.id,
        service_name: booking.service_name,
        provider_name: booking.service_providers?.name || 'Unknown',
        provider_contact: booking.service_providers?.contact || '',
        date: booking.date,
        status: booking.status,
        amount: parseFloat(booking.amount),
        created_at: booking.created_at
      })) || [];

      setServicesTaken(processedServices);

      // Fetch support tickets
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setSupportTickets(ticketsData || []);

      // Calculate customer statistics
      const totalSpent = processedServices
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + s.amount, 0);

      const completedServices = processedServices.filter(s => s.status === 'completed').length;
      const pendingServices = processedServices.filter(s => s.status === 'pending').length;
      const cancelledServices = processedServices.filter(s => s.status === 'cancelled').length;

      // Calculate favorite category (most booked service type)
      const categoryCount: { [key: string]: number } = {};
      processedServices.forEach(service => {
        const category = service.service_name.split(' ')[0]; // Simple category extraction
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, 'None'
      );

      setCustomerStats({
        totalServices: processedServices.length,
        completedServices,
        pendingServices,
        cancelledServices,
        totalSpent,
        averageRating: 4.5, // This would come from actual ratings given by customer
        favoriteCategory,
        memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (value: string, placeDetails?: google.maps.places.PlaceResult) => {
    setProfile({ ...profile, location: value });
    
    // If we have place details, we could store additional information
    if (placeDetails) {
      console.log('Selected place:', placeDetails);
      // You could store latitude/longitude or other details if needed
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
            location: profile.location,
            complete_address: profile.completeAddress,
            description: profile.bio
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleTicketCreated = () => {
    fetchUserData();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const exportServiceHistory = () => {
    if (servicesTaken.length === 0) {
      toast.error('No service history to export');
      return;
    }

    const csvContent = [
      'Service,Provider,Date,Status,Amount,Created',
      ...servicesTaken.map(service => 
        `"${service.service_name}","${service.provider_name}","${new Date(service.date).toLocaleDateString()}","${service.status}","₹${service.amount}","${new Date(service.created_at).toLocaleDateString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Service history exported successfully');
  };

  const filteredServices = servicesTaken.filter(service => {
    const matchesFilter = serviceFilter === 'all' || service.status === serviceFilter;
    const matchesSearch = service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Enhanced Header with Customer Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                <div className="flex items-center mb-6 lg:mb-0">
                  <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mr-6">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <p className="text-blue-100">{profile.email}</p>
                    <div className="flex items-center mt-2">
                      {isProvider && (
                        <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm mr-3">
                          Service Provider
                        </span>
                      )}
                      <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        Customer since {customerStats.memberSince}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-white">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{customerStats.totalServices}</div>
                    <div className="text-sm text-blue-100">Total Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">₹{customerStats.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-blue-100">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{customerStats.averageRating}★</div>
                    <div className="text-sm text-blue-100">Avg Rating Given</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{customerStats.favoriteCategory}</div>
                    <div className="text-sm text-blue-100">Favorite Service</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Enhanced Sidebar */}
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
                      activeTab === 'services'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('services')}
                  >
                    <Calendar className="h-5 w-5 mr-3" />
                    My Services
                    {customerStats.pendingServices > 0 && (
                      <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                        {customerStats.pendingServices}
                      </span>
                    )}
                  </button>
                  
                  <button
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'subscription'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('subscription')}
                  >
                    <Package className="h-5 w-5 mr-3" />
                    Subscription
                  </button>

                  <button
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'support'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('support')}
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    Support Tickets
                    {supportTickets.filter(t => t.status === 'open').length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {supportTickets.filter(t => t.status === 'open').length}
                      </span>
                    )}
                  </button>

                  <button
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </button>
                  
                  <button
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="h-5 w-5 mr-3" />
                    Notifications
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Profile Information</h2>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Verified Account</span>
                      </div>
                    </div>
                    
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
                          <GoogleMapsAutocomplete
                            value={profile.location}
                            onChange={handleLocationChange}
                            placeholder="Search for your location"
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            🗺️ Use Google Maps to select your precise location
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Complete Address
                          </label>
                          <div className="relative">
                            <Home className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                            <textarea
                              value={profile.completeAddress}
                              onChange={(e) => setProfile({ ...profile, completeAddress: e.target.value })}
                              rows={3}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter your complete address including house number, street, area, city, state, pincode"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Provide your full address for accurate service delivery
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                          </label>
                          <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <Button type="submit">
                        Save Changes
                      </Button>
                    </form>

                    {/* Customer Statistics */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-green-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                          <div>
                            <div className="text-2xl font-bold text-green-600">{customerStats.completedServices}</div>
                            <div className="text-sm text-green-700">Completed Services</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <div className="text-2xl font-bold text-blue-600">₹{customerStats.totalSpent.toLocaleString()}</div>
                            <div className="text-sm text-blue-700">Total Investment</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <Award className="h-8 w-8 text-yellow-600 mr-3" />
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">{customerStats.averageRating}★</div>
                            <div className="text-sm text-yellow-700">Average Rating</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold mb-4 sm:mb-0">My Services</h2>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={exportServiceHistory}
                          variant="outline"
                          icon={<Download className="h-4 w-4" />}
                        >
                          Export History
                        </Button>
                        <Button
                          onClick={() => navigate('/')}
                          icon={<Plus className="h-4 w-4" />}
                        >
                          Book New Service
                        </Button>
                      </div>
                    </div>

                    {/* Service Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">{customerStats.totalServices}</div>
                        <div className="text-sm text-gray-600">Total Services</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{customerStats.completedServices}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-600">{customerStats.pendingServices}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-600">{customerStats.cancelledServices}</div>
                        <div className="text-sm text-gray-600">Cancelled</div>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          placeholder="Search services..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                          value={serviceFilter}
                          onChange={(e) => setServiceFilter(e.target.value)}
                          className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          {servicesTaken.length === 0 ? 'No services taken yet' : 'No services match your filters'}
                        </p>
                        <Button onClick={() => navigate('/')}>
                          Browse Services
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredServices.map(service => (
                          <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  {getStatusIcon(service.status)}
                                  <h3 className="text-lg font-semibold ml-2">{service.service_name}</h3>
                                  <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                                    service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    service.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {service.status}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    <span className="font-medium">Provider:</span> {service.provider_name}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span className="font-medium">Date:</span> {new Date(service.date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    <span className="font-medium">Amount:</span> ₹{service.amount}
                                  </div>
                                </div>

                                {service.provider_contact && (
                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <Phone className="h-4 w-4 mr-2" />
                                    <span className="font-medium">Contact:</span> {service.provider_contact}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0">
                                {service.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    icon={<Star className="h-4 w-4" />}
                                  >
                                    Rate Service
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  icon={<Eye className="h-4 w-4" />}
                                >
                                  View Details
                                </Button>
                                {service.provider_contact && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    icon={<Phone className="h-4 w-4" />}
                                    onClick={() => window.open(`tel:${service.provider_contact}`)}
                                  >
                                    Call Provider
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'subscription' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Subscription & Membership</h2>
                    
                    <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
                      <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
                      <p className="text-gray-600 mb-6">
                        You're currently on our free plan. Upgrade to get premium features and priority support.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                          <h4 className="text-lg font-semibold mb-2">Basic Plan</h4>
                          <p className="text-3xl font-bold text-blue-600 mb-4">₹99<span className="text-sm text-gray-500">/month</span></p>
                          <ul className="text-sm text-gray-600 space-y-2 mb-6">
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Priority booking</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />24/7 customer support</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Exclusive discounts</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />No booking fees</li>
                          </ul>
                          <Button variant="outline" fullWidth>
                            Upgrade to Basic
                          </Button>
                        </div>
                        
                        <div className="bg-white rounded-lg p-6 border-2 border-blue-500">
                          <h4 className="text-lg font-semibold mb-2">Premium Plan</h4>
                          <p className="text-3xl font-bold text-blue-600 mb-4">₹199<span className="text-sm text-gray-500">/month</span></p>
                          <ul className="text-sm text-gray-600 space-y-2 mb-6">
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />All Basic features</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Instant booking confirmation</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Premium providers only</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Service guarantee</li>
                          </ul>
                          <Button fullWidth>
                            Upgrade to Premium
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Membership Benefits */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Membership Benefits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 text-red-500 mr-3" />
                          <span>Loyalty rewards program</span>
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 text-green-500 mr-3" />
                          <span>Service quality guarantee</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-500 mr-3" />
                          <span>Priority customer support</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-purple-500 mr-3" />
                          <span>Exclusive member discounts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'support' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Support Tickets</h2>
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

                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                    
                    <div className="space-y-8">
                      {/* Notification Preferences */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Email Notifications</h4>
                              <p className="text-sm text-gray-600">Receive booking updates and service reminders</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={profile.preferences.emailUpdates}
                              onChange={(e) => setProfile({
                                ...profile,
                                preferences: { ...profile.preferences, emailUpdates: e.target.checked }
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">SMS Alerts</h4>
                              <p className="text-sm text-gray-600">Get SMS notifications for urgent updates</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={profile.preferences.smsAlerts}
                              onChange={(e) => setProfile({
                                ...profile,
                                preferences: { ...profile.preferences, smsAlerts: e.target.checked }
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Push Notifications</h4>
                              <p className="text-sm text-gray-600">Browser notifications for real-time updates</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={profile.preferences.notifications}
                              onChange={(e) => setProfile({
                                ...profile,
                                preferences: { ...profile.preferences, notifications: e.target.checked }
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Account Security */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Account Security</h3>
                        <div className="space-y-4">
                          <Button variant="outline" className="w-full sm:w-auto">
                            Change Password
                          </Button>
                          <Button variant="outline" className="w-full sm:w-auto">
                            Enable Two-Factor Authentication
                          </Button>
                          <Button variant="outline" className="w-full sm:w-auto">
                            Download Account Data
                          </Button>
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Profile Visibility</h4>
                              <p className="text-sm text-gray-600">Allow service providers to see your profile</p>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Service History</h4>
                              <p className="text-sm text-gray-600">Show service history to providers for better recommendations</p>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                        <div className="space-y-4">
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            Deactivate Account
                          </Button>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

export default Profile;