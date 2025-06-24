import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Wind, 
  Zap, 
  Wrench, 
  Hammer, 
  Palette, 
  Trash, 
  Flower,
  Search,
  Filter,
  Star,
  MapPin,
  Phone,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Award
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  averagePrice: string;
  providers: number;
  rating: number;
  color: string;
  bgPattern: string;
  hoverColor: string;
}

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const services: Service[] = [
    {
      id: '1',
      name: 'RO Technician',
      icon: <Droplet className="h-8 w-8" />,
      description: 'Professional water purifier installation, maintenance, and repair services for all major brands including Kent, Aquaguard, Pureit, and more.',
      features: ['Installation & Setup', 'Filter Replacement', 'Annual Maintenance', 'Emergency Repairs', 'Water Quality Testing'],
      averagePrice: '₹800 - ₹3,500',
      providers: 28,
      rating: 4.8,
      color: 'from-blue-500 to-cyan-500',
      bgPattern: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      hoverColor: 'group-hover:from-blue-600 group-hover:to-cyan-600'
    },
    {
      id: '2',
      name: 'AC Technician',
      icon: <Wind className="h-8 w-8" />,
      description: 'Expert air conditioning services including installation, repair, maintenance, and gas refilling for all AC types - split, window, and central systems.',
      features: ['AC Installation', 'Repair & Diagnostics', 'Gas Refilling', 'Deep Cleaning', 'Preventive Maintenance'],
      averagePrice: '₹600 - ₹4,500',
      providers: 20,
      rating: 4.7,
      color: 'from-cyan-500 to-blue-600',
      bgPattern: 'bg-gradient-to-br from-cyan-100 to-blue-100',
      hoverColor: 'group-hover:from-cyan-600 group-hover:to-blue-700'
    },
    {
      id: '3',
      name: 'Electrician',
      icon: <Zap className="h-8 w-8" />,
      description: 'Licensed electrical professionals for home wiring, repairs, installations, and electrical maintenance. Available for both residential and commercial needs.',
      features: ['Electrical Wiring', 'Fixture Installation', 'Circuit Repairs', 'Safety Inspections', 'Emergency Services'],
      averagePrice: '₹200 - ₹2,500',
      providers: 24,
      rating: 4.9,
      color: 'from-yellow-500 to-orange-500',
      bgPattern: 'bg-gradient-to-br from-yellow-100 to-orange-100',
      hoverColor: 'group-hover:from-yellow-600 group-hover:to-orange-600'
    },
    {
      id: '4',
      name: 'Plumber',
      icon: <Wrench className="h-8 w-8" />,
      description: 'Professional plumbing services for pipe repairs, bathroom fittings, drain cleaning, and emergency plumbing issues. Available 24/7 for urgent needs.',
      features: ['Pipe Repairs', 'Bathroom Fittings', 'Drain Cleaning', 'Water Tank Installation', '24/7 Emergency Service'],
      averagePrice: '₹500 - ₹3,000',
      providers: 18,
      rating: 4.6,
      color: 'from-blue-600 to-blue-800',
      bgPattern: 'bg-gradient-to-br from-blue-100 to-indigo-100',
      hoverColor: 'group-hover:from-blue-700 group-hover:to-blue-900'
    },
    {
      id: '5',
      name: 'Mechanic',
      icon: <Wrench className="h-8 w-8" />,
      description: 'Experienced auto mechanics for vehicle repair, maintenance, and diagnostics. Specializing in cars, bikes, and commercial vehicles.',
      features: ['Engine Diagnostics', 'Brake Service', 'Oil Changes', 'Transmission Repair', 'General Maintenance'],
      averagePrice: '₹500 - ₹5,000',
      providers: 32,
      rating: 4.7,
      color: 'from-gray-600 to-gray-800',
      bgPattern: 'bg-gradient-to-br from-gray-100 to-slate-100',
      hoverColor: 'group-hover:from-gray-700 group-hover:to-gray-900'
    },
    {
      id: '6',
      name: 'Carpenter',
      icon: <Hammer className="h-8 w-8" />,
      description: 'Skilled carpenters for custom furniture, home renovation, repairs, and woodwork. Quality craftsmanship with attention to detail.',
      features: ['Custom Furniture', 'Door Installation', 'Furniture Repair', 'Kitchen Cabinets', 'Home Renovation'],
      averagePrice: '₹1,000 - ₹25,000',
      providers: 15,
      rating: 4.8,
      color: 'from-amber-600 to-orange-700',
      bgPattern: 'bg-gradient-to-br from-amber-100 to-orange-100',
      hoverColor: 'group-hover:from-amber-700 group-hover:to-orange-800'
    },
    {
      id: '7',
      name: 'Painter',
      icon: <Palette className="h-8 w-8" />,
      description: 'Professional painting services for interior and exterior walls, texture painting, and decorative finishes using premium quality paints.',
      features: ['Interior Painting', 'Exterior Painting', 'Texture Work', 'Wall Preparation', 'Color Consultation'],
      averagePrice: '₹20 - ₹80 per sq ft',
      providers: 12,
      rating: 4.5,
      color: 'from-purple-500 to-pink-500',
      bgPattern: 'bg-gradient-to-br from-purple-100 to-pink-100',
      hoverColor: 'group-hover:from-purple-600 group-hover:to-pink-600'
    },
    {
      id: '8',
      name: 'Cleaner',
      icon: <Trash className="h-8 w-8" />,
      description: 'Professional cleaning services for homes, offices, and commercial spaces. Deep cleaning, regular maintenance, and post-construction cleanup.',
      features: ['Home Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Post-Construction', 'Regular Maintenance'],
      averagePrice: '₹500 - ₹2,500',
      providers: 28,
      rating: 4.6,
      color: 'from-green-500 to-emerald-500',
      bgPattern: 'bg-gradient-to-br from-green-100 to-emerald-100',
      hoverColor: 'group-hover:from-green-600 group-hover:to-emerald-600'
    },
    {
      id: '9',
      name: 'Gardener',
      icon: <Flower className="h-8 w-8" />,
      description: 'Expert gardening and landscaping services including plant care, garden design, maintenance, and seasonal gardening solutions.',
      features: ['Garden Design', 'Plant Care', 'Landscaping', 'Seasonal Maintenance', 'Pest Control'],
      averagePrice: '₹800 - ₹3,000',
      providers: 10,
      rating: 4.4,
      color: 'from-green-600 to-lime-600',
      bgPattern: 'bg-gradient-to-br from-green-100 to-lime-100',
      hoverColor: 'group-hover:from-green-700 group-hover:to-lime-700'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'home', name: 'Home Services' },
    { id: 'repair', name: 'Repair & Maintenance' },
    { id: 'installation', name: 'Installation' },
    { id: 'cleaning', name: 'Cleaning' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'home' && ['Cleaner', 'Gardener', 'Painter'].includes(service.name)) ||
      (selectedCategory === 'repair' && ['RO Technician', 'AC Technician', 'Electrician', 'Plumber', 'Mechanic'].includes(service.name)) ||
      (selectedCategory === 'installation' && ['RO Technician', 'AC Technician', 'Electrician', 'Carpenter'].includes(service.name)) ||
      (selectedCategory === 'cleaning' && ['Cleaner'].includes(service.name));
    
    return matchesSearch && matchesCategory;
  });

  const handleServiceClick = (serviceId: string) => {
    // Navigate to home page and trigger category filter
    navigate('/', { state: { categoryId: serviceId } });
  };

  const handleBookService = (serviceName: string) => {
    // Navigate to home page with search for this service
    navigate('/', { state: { searchQuery: serviceName } });
  };

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
                Our <span className="text-yellow-400">Services</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Comprehensive home and professional services delivered by verified experts. 
                Quality, reliability, and satisfaction guaranteed.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">9+</div>
                  <div className="text-blue-100">Service Categories</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                  <div className="text-blue-100">Verified Providers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">4.7★</div>
                  <div className="text-blue-100">Average Rating</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
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
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
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
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Professional Services at Your Doorstep
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Choose from our wide range of verified professional services
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service, index) => (
                  <div 
                    key={service.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden border border-gray-100"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Background Pattern */}
                    <div className={`absolute inset-0 ${service.bgPattern} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-8">
                      {/* Icon Container */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${service.color} ${service.hoverColor} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                        {service.icon}
                      </div>
                      
                      {/* Service Info */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {service.description}
                        </p>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {service.providers} providers
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {service.rating}
                          </div>
                        </div>
                        
                        {/* Price Range */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="text-sm text-gray-600 mb-1">Starting from</div>
                          <div className="text-lg font-bold text-blue-600">{service.averagePrice}</div>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                        <ul className="space-y-2">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {service.features.length > 3 && (
                            <li className="text-sm text-blue-600 font-medium">
                              +{service.features.length - 3} more services
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleServiceClick(service.id)}
                          variant="outline"
                          className="flex-1 text-sm"
                        >
                          View Providers
                        </Button>
                        <Button
                          onClick={() => handleBookService(service.name)}
                          className="flex-1 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          icon={<ArrowRight className="h-4 w-4" />}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>
                  </div>
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Professionals</h3>
                  <p className="text-gray-600">All our service providers are thoroughly verified and background checked for your safety and peace of mind.</p>
                </div>

                <div className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Response</h3>
                  <p className="text-gray-600">Fast booking and quick response times. Most services can be scheduled within 24 hours of your request.</p>
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
                Get connected with verified professionals in your area. Quality service is just a click away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  Browse All Providers
                </Button>
                <Button
                  onClick={() => navigate('/contact')}
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

      <Footer />
    </div>
  );
};

export default Services;