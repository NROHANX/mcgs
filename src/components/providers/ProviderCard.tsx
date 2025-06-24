import React from 'react';
import { MapPin, Phone, Clock, Star, CheckCircle, Zap } from 'lucide-react';
import { Provider } from '../../types';
import Card from '../ui/Card';
import Rating from '../ui/Rating';
import Button from '../ui/Button';

interface ProviderCardProps {
  provider: Provider;
  onClick: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onClick }) => {
  return (
    <Card 
      hoverable 
      onClick={onClick} 
      className="h-full flex flex-col group overflow-hidden bg-white border-2 border-transparent hover:border-blue-200 transition-all duration-500 hover:shadow-2xl"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={provider.image} 
          alt={provider.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {provider.category}
          </div>
        </div>

        {/* Availability Status */}
        <div className="absolute bottom-3 left-3">
          {provider.available ? (
            <div className="flex items-center bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              Available Now
            </div>
          ) : (
            <div className="flex items-center bg-gray-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              Currently Busy
            </div>
          )}
        </div>

        {/* Verified Badge */}
        <div className="absolute top-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        {/* Provider Name */}
        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {provider.name}
        </h3>
        
        {/* Rating Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Rating value={provider.rating} size="sm" />
            <span className="ml-2 text-sm font-medium text-gray-600">
              ({provider.reviewCount})
            </span>
          </div>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm font-bold text-gray-900">
              {provider.rating.toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {provider.description}
        </p>
        
        {/* Contact Info */}
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">{provider.location}</span>
          </div>
          
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
            <span>{provider.contact}</span>
          </div>
        </div>

        {/* Services Preview */}
        {provider.services && provider.services.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Services:</div>
            <div className="flex flex-wrap gap-1">
              {provider.services.slice(0, 2).map((service, index) => (
                <span 
                  key={index}
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium"
                >
                  {service.name}
                </span>
              ))}
              {provider.services.length > 2 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  +{provider.services.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <div className="mt-auto">
          <Button 
            variant="primary" 
            fullWidth
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-500 pointer-events-none rounded-lg"></div>
    </Card>
  );
};

export default ProviderCard;