import React from 'react';
import { Provider } from '../../types';
import ProviderCard from './ProviderCard';
import { Search, MapPin, Filter, Star } from 'lucide-react';

interface ProviderListProps {
  providers: Provider[];
  onProviderClick: (providerId: string) => void;
  title?: string;
  emptyMessage?: string;
}

const ProviderList: React.FC<ProviderListProps> = ({
  providers,
  onProviderClick,
  title = 'Service Providers',
  emptyMessage = 'No service providers found'
}) => {
  if (providers.length === 0) {
    return (
      <div className="py-16 text-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl my-8">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{emptyMessage}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Try different keywords', 'Check spelling', 'Browse categories'].map((tip, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {tip}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full px-6 py-3 mb-6">
          <Star className="h-5 w-5 mr-2" />
          <span className="font-medium">{providers.length} Providers Found</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose from our verified professionals in your area
        </p>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {providers.map((provider, index) => (
          <div 
            key={provider.id}
            className="transform transition-all duration-300 hover:scale-105"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <ProviderCard
              provider={provider}
              onClick={() => onProviderClick(provider.id)}
            />
          </div>
        ))}
      </div>

      {/* Load More Section */}
      {providers.length > 0 && (
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-white rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-blue-200">
            <span className="text-gray-700 font-medium mr-2 group-hover:text-blue-600 transition-colors">
              Showing {providers.length} providers
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProviderList;