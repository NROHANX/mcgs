import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, LogOut, Calendar, CreditCard, Package, MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import SupportTicket from '../components/ui/SupportTicket';
import CreateTicketModal from '../components/ui/CreateTicketModal';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface ServiceTaken {
  id: string;
  service_name: string;
  provider_name: string;
  date: string;
  status: string;
  amount: number;
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

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'subscription' | 'support'>('profile');
  const [isProvider, setIsProvider] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [servicesTaken, setServicesTaken] = useState<ServiceTaken[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);

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
          bio: providerData.description || ''
        });
      } else {
        setProfile({
          name: user?.email?.split('@')[0] || '',
          email: user?.email || '',
          phone: '',
          location: '',
          bio: ''
        });
      }

      // Fetch services taken by user
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          service_providers!inner(name)
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      const processedServices = bookingsData?.map(booking => ({
        id: booking.id,
        service_name: booking.service_name,
        provider_name: booking.service_providers?.name || 'Unknown',
        date: booking.date,
        status: booking.status,
        amount: parseFloat(booking.amount)
      })) || [];

      setServicesTaken(processedServices);

      // Fetch support tickets
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setSupportTickets(ticketsData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleTicketCreated = () => {
    fetchUserData();
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mr-6">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <p className="text-blue-100">{profile.email}</p>
                  {isProvider && (
                    <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm mt-2">
                      Service Provider
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Sidebar */}
              <div className="w-full md:w-1/4 bg-gray-50 p-6">
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
                    Services Taken
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
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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
                    <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                    
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
                          <input
                            type="text"
                            value={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
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
                  </div>
                )}

                {activeTab === 'services' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Services Taken</h2>
                    
                    {servicesTaken.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No services taken yet</p>
                        <Button className="mt-4" onClick={() => navigate('/')}>
                          Browse Services
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {servicesTaken.map(service => (
                          <div key={service.id} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold">{service.service_name}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                service.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {service.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Provider:</span> {service.provider_name}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {new Date(service.date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Amount:</span> ₹{service.amount}
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
                    <h2 className="text-2xl font-bold mb-6">Subscription</h2>
                    
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
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
                            <li>• Priority booking</li>
                            <li>• 24/7 customer support</li>
                            <li>• Exclusive discounts</li>
                            <li>• No booking fees</li>
                          </ul>
                          <Button variant="outline" fullWidth>
                            Upgrade to Basic
                          </Button>
                        </div>
                        
                        <div className="bg-white rounded-lg p-6 border-2 border-blue-500">
                          <h4 className="text-lg font-semibold mb-2">Premium Plan</h4>
                          <p className="text-3xl font-bold text-blue-600 mb-4">₹199<span className="text-sm text-gray-500">/month</span></p>
                          <ul className="text-sm text-gray-600 space-y-2 mb-6">
                            <li>• All Basic features</li>
                            <li>• Instant booking confirmation</li>
                            <li>• Premium providers only</li>
                            <li>• Service guarantee</li>
                          </ul>
                          <Button fullWidth>
                            Upgrade to Premium
                          </Button>
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