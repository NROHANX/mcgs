import React, { useState } from 'react';
import { 
  Search,
  Filter,
  Star,
  Users,
  Clock,
  Calendar,
  Phone,
  CheckCircle,
  Award
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import ServiceCategoryList from '../components/providers/ServiceCategoryList';
import ServiceBookingModal from '../components/ui/ServiceBookingModal';
import { serviceCategories, searchServiceCategories } from '../data/serviceCategories';

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const availabilityFilters = [
    { id: 'all', name: 'All Services' },
    { id: 'Available Now', name: 'Available Now' },
    { id: 'Limited Availability', name: 'Limited Availability' },
    { id: 'Busy', name: 'Busy' }
  ];

  const filteredCategories = serviceCategories.filter(category => {
    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAvailability = selectedAvailability === 'all' || 
      category.availability === selectedAvailability;
    
    return matchesSearch && matchesAvailability;
  });

  const handleCategoryClick = (categoryId: string) => {
    const category = serviceCategories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedService(category.name);
      setIsBookingModalOpen(true);
    }
  };

  const totalProviders = serviceCategories.reduce((sum, cat) => sum + cat.totalProviders, 0);
  const averageRating = serviceCategories.reduce((sum, cat) => sum + cat.averageRating, 0) / serviceCategories.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCategoryClick={() => {}} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Professional <span className="text-yellow-400">Services</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Book any service and we'll assign the best available technician for your needs. 
                Quality, reliability, and satisfaction guaranteed.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{serviceCategories.length}</div>
                  <div className="text-blue-100">Service Categories</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{totalProviders}+</div>
                  <div className="text-blue-100">Verified Technicians</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{averageRating.toFixed(1)}★</div>
                  <div className="text-blue-100">Average Rating</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">Always</div>
                  <div className="text-blue-100">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                  >
                    {availabilityFilters.map((filter) => (
                      <option key={filter.id} value={filter.id}>
                        {filter.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <ServiceCategoryList
                categories={filteredCategories}
                onCategoryClick={handleCategoryClick}
                title="Professional Service Categories"
                emptyMessage="No services match your search criteria"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Our Services */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Our Services?</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We ensure quality, reliability, and customer satisfaction in every service
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Technicians</h3>
                  <p className="text-gray-600">All our technicians are thoroughly verified and background checked for your safety and peace of mind.</p>
                </div>

                <div className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Assignment</h3>
                  <p className="text-gray-600">Our system assigns the best available technician based on location, expertise, and availability.</p>
                </div>

                <div className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Guarantee</h3>
                  <p className="text-gray-600">We stand behind our services with a satisfaction guarantee. If you're not happy, we'll make it right.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Book a Service?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Get connected with verified technicians in your area. Quality service is just a click away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    setSelectedService('');
                    setIsBookingModalOpen(true);
                  }}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  icon={<Calendar className="h-5 w-5" />}
                >
                  Book Any Service
                </Button>
                <Button
                  onClick={() => window.open('/contact')}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-800"
                  icon={<Phone className="h-5 w-5" />}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ServiceBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={selectedService}
        serviceCategory={selectedService}
      />

      <Footer />
    </div>
  );
};

export default Services;