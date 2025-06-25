import React from 'react';
import { Shield, Users, CheckCircle, Star, Clock, Award, ShieldCheck, Headphones } from 'lucide-react';

const TrustBanner: React.FC = () => {
  const stats = [
    { number: '10,000+', label: 'Happy Customers', icon: <Users className="h-6 w-6" /> },
    { number: '500+', label: 'Service Providers', icon: <CheckCircle className="h-6 w-6" /> },
    { number: '4.8/5', label: 'Average Rating', icon: <Star className="h-6 w-6" /> },
    { number: 'Always', label: 'Support Available', icon: <Headphones className="h-6 w-6" /> }
  ];

  const features = [
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Verified Technicians',
      description: 'All service providers go through thorough verification',
      color: 'from-green-400 to-emerald-400'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Quick Response',
      description: 'Fast connection to available service providers',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality Service',
      description: 'Rated by real customers for your confidence',
      color: 'from-purple-400 to-pink-400'
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: 'Secure Booking',
      description: 'Safe and secure platform with satisfaction guarantee',
      color: 'from-orange-400 to-red-400'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-32 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute bottom-32 right-1/4 w-6 h-6 bg-white/10 rounded-full animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <Shield className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-white font-medium">Trusted by Thousands</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose 
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MCGS Services?
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We're committed to providing you with the best service experience through our trusted network of professionals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 hover:-translate-y-3 cursor-pointer border border-white/20"
            >
              {/* Icon Container */}
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                <div className="relative">
                  {feature.icon}
                  {/* Sparkle Effect */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 text-center group-hover:text-blue-300 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-blue-200 text-center leading-relaxed group-hover:text-white transition-colors duration-300">
                {feature.description}
              </p>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className={`${
                    stat.label === 'Support Available' 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-400' 
                      : 'bg-gradient-to-br from-blue-400 to-purple-400'
                  } rounded-full p-4 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <div className={`text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300 ${
                  stat.label === 'Support Available' ? 'group-hover:text-green-300' : ''
                }`}>
                  {stat.number}
                </div>
                <div className={`text-blue-200 font-medium group-hover:text-white transition-colors duration-300 ${
                  stat.label === 'Support Available' ? 'text-green-200' : ''
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;