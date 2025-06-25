import React, { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import { Star, Users, CheckCircle, Zap, Sparkles, TrendingUp, MapPin, Clock, Award } from 'lucide-react';
import ServiceBookingModal from '../ui/ServiceBookingModal';

interface HeroSectionProps {
  onSearch: (query: string, location: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsBookingModalOpen(true);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white overflow-hidden min-h-screen flex items-center">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-35 animate-ping"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-gradient-to-r from-green-400 to-teal-500 rounded-full opacity-25 animate-pulse"></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-1/4 left-1/3 w-16 h-16 border-4 border-white/20 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-white/10 transform rotate-12 animate-float"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Floating Service Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-1/4 animate-float">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <Zap className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
        <div className="absolute top-48 right-1/4 animate-float-delayed">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <Users className="h-8 w-8 text-green-300" />
          </div>
        </div>
        <div className="absolute bottom-48 left-1/3 animate-float">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <CheckCircle className="h-8 w-8 text-blue-300" />
          </div>
        </div>
        <div className="absolute top-64 right-1/3 animate-float-delayed">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <Sparkles className="h-8 w-8 text-purple-300" />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-20">
        <div className="max-w-5xl mx-auto text-center mb-10">
          {/* Premium Trust Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
            <Star className="h-5 w-5 text-yellow-300 mr-2 animate-pulse" />
            <span className="text-sm font-semibold">Trusted by 10,000+ customers across India</span>
            <TrendingUp className="h-4 w-4 text-green-300 ml-2" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Find Professional Services
            </span>
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
              Near You
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Book any service and we'll assign the best technician for your needs
          </p>
          
          {/* Enhanced Search Bar with Google Maps and Demo Services */}
          <SearchBar onSearch={onSearch} className="max-w-4xl mx-auto mb-12" />
          
          {/* Enhanced Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="text-3xl md:text-4xl font-black text-yellow-300 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-sm text-blue-200 font-medium">Verified Technicians</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="text-3xl md:text-4xl font-black text-purple-300 group-hover:scale-110 transition-transform">4.8★</div>
              <div className="text-sm text-blue-200 font-medium">Average Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="text-3xl md:text-4xl font-black text-cyan-300 group-hover:scale-110 transition-transform">10K+</div>
              <div className="text-sm text-blue-200 font-medium">Happy Customers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="text-3xl md:text-4xl font-black text-green-300 group-hover:scale-110 transition-transform">Always</div>
              <div className="text-sm text-blue-200 font-medium">Support Available</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320" 
          className="absolute bottom-0 w-full h-auto"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="1"/>
              <stop offset="50%" stopColor="rgba(255,255,255,0.8)" stopOpacity="1"/>
              <stop offset="100%" stopColor="white" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <path 
            fill="url(#waveGradient)"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              values="0 0; 20 0; 0 0"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      <ServiceBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={selectedService}
        serviceCategory={selectedService}
      />
    </section>
  );
};

export default HeroSection;