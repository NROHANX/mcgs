import React from 'react';
import { Zap, Droplet, Wrench, Scissors, Palette, Trash, Flower, Monitor, Calendar, Settings, Hammer, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServicesBanner: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    { 
      icon: <Droplet className="h-8 w-8" />, 
      name: 'RO Services', 
      color: 'from-blue-500 to-cyan-500',
      bgPattern: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      hoverColor: 'group-hover:from-blue-600 group-hover:to-cyan-600',
      availability: 'Available Now',
      technicians: 28
    },
    { 
      icon: <Wind className="h-8 w-8" />, 
      name: 'AC Services', 
      color: 'from-cyan-500 to-blue-600',
      bgPattern: 'bg-gradient-to-br from-cyan-100 to-blue-100',
      hoverColor: 'group-hover:from-cyan-600 group-hover:to-blue-700',
      availability: 'Available Now',
      technicians: 20
    },
    { 
      icon: <Zap className="h-8 w-8" />, 
      name: 'Electrical Services', 
      color: 'from-yellow-500 to-orange-500',
      bgPattern: 'bg-gradient-to-br from-yellow-100 to-orange-100',
      hoverColor: 'group-hover:from-yellow-600 group-hover:to-orange-600',
      availability: 'Available Now',
      technicians: 24
    },
    { 
      icon: <Settings className="h-8 w-8" />, 
      name: 'Plumbing Services', 
      color: 'from-blue-600 to-blue-800',
      bgPattern: 'bg-gradient-to-br from-blue-100 to-indigo-100',
      hoverColor: 'group-hover:from-blue-700 group-hover:to-blue-900',
      availability: 'Limited Availability',
      technicians: 18
    },
    { 
      icon: <Wrench className="h-8 w-8" />, 
      name: 'Mechanical Services', 
      color: 'from-gray-600 to-gray-800',
      bgPattern: 'bg-gradient-to-br from-gray-100 to-slate-100',
      hoverColor: 'group-hover:from-gray-700 group-hover:to-gray-900',
      availability: 'Available Now',
      technicians: 32
    },
    { 
      icon: <Hammer className="h-8 w-8" />, 
      name: 'Carpenting Services', 
      color: 'from-amber-600 to-orange-700',
      bgPattern: 'bg-gradient-to-br from-amber-100 to-orange-100',
      hoverColor: 'group-hover:from-amber-700 group-hover:to-orange-800',
      availability: 'Busy',
      technicians: 15
    },
    { 
      icon: <Palette className="h-8 w-8" />, 
      name: 'Painting Services', 
      color: 'from-purple-500 to-pink-500',
      bgPattern: 'bg-gradient-to-br from-purple-100 to-pink-100',
      hoverColor: 'group-hover:from-purple-600 group-hover:to-pink-600',
      availability: 'Limited Availability',
      technicians: 12
    },
    { 
      icon: <Trash className="h-8 w-8" />, 
      name: 'Cleaning Services', 
      color: 'from-green-500 to-emerald-500',
      bgPattern: 'bg-gradient-to-br from-green-100 to-emerald-100',
      hoverColor: 'group-hover:from-green-600 group-hover:to-emerald-600',
      availability: 'Available Now',
      technicians: 28
    },
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available Now':
        return 'text-green-600';
      case 'Limited Availability':
        return 'text-orange-600';
      case 'Busy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleServiceClick = (serviceName: string) => {
    navigate('/services', { state: { serviceName } });
  };

  const handleViewAllClick = () => {
    navigate('/services');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200 to-pink-200 rounded-full opacity-20 transform -translate-x-24 translate-y-24"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-2 mb-4">
            <Monitor className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">All Services Available</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Service Category
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From repairs to regular maintenance, we've got all your service needs covered
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden"
              onClick={() => handleServiceClick(service.name)}
            >
              {/* Background Pattern */}
              <div className={`absolute inset-0 ${service.bgPattern} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              
              {/* Icon Container with Dynamic Logo */}
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} ${service.hoverColor} rounded-xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                  <div className="relative">
                    {service.icon}
                    {/* Sparkle Effect */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-100"></div>
                  </div>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-800 text-center group-hover:text-blue-600 transition-colors duration-300 relative z-10 mb-2">
                  {service.name}
                </h3>

                {/* Availability Status */}
                <div className="text-center">
                  <div className={`text-xs font-medium ${getAvailabilityColor(service.availability)} mb-1`}>
                    {service.availability}
                  </div>
                  <div className="text-xs text-gray-500">
                    {service.technicians} technicians
                  </div>
                </div>
                
                {/* Hover Text Effect */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Book now
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300 delay-200"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300 delay-300"></div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div 
            className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-blue-200"
            onClick={handleViewAllClick}
          >
            <span className="text-gray-700 font-medium mr-2 group-hover:text-blue-600 transition-colors">View All Services</span>
            <div className="relative">
              <Calendar className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesBanner;