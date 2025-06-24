import React from 'react';
import { CheckCircle, Clock, Award, ShieldCheck } from 'lucide-react';

const FeatureSection: React.FC = () => {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-10 transform -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-orange-200 to-pink-200 rounded-full opacity-10 transform translate-x-24 translate-y-24"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <span className="font-semibold mr-2">Find Your Perfect Service Provider</span>
            <div className="relative">
              <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;