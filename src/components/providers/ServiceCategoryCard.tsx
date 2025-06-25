import React from 'react';
import { Star, Users, Clock, CheckCircle, Zap, AlertTriangle } from 'lucide-react';
import { ServiceCategory } from '../../data/serviceCategories';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  onClick: () => void;
}

const ServiceCategoryCard: React.FC<ServiceCategoryCardProps> = ({ category, onClick }) => {
  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'Available Now':
        return <Zap className="w-4 h-4 text-green-600" />;
      case 'Limited Availability':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'Busy':
        return <Clock className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available Now':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Limited Availability':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Busy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card 
      hoverable 
      onClick={onClick} 
      className="h-full flex flex-col group overflow-hidden bg-white border-2 border-transparent hover:border-blue-200 transition-all duration-500 hover:shadow-2xl"
    >
      <div className="p-6 flex-grow flex flex-col">
        {/* Header with Icon and Category */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="text-4xl mr-3">{category.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {category.totalProviders} technicians
              </div>
            </div>
          </div>
          
          {/* Availability Badge */}
          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(category.availability)}`}>
            {getAvailabilityIcon(category.availability)}
            <span className="ml-1">{category.availability}</span>
          </div>
        </div>
        
        {/* Rating Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(category.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-600">
              {category.averageRating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center text-blue-600 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {category.responseTime}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {category.description}
        </p>
        
        {/* Price Range */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-500 mb-1">Starting from</div>
          <div className="text-lg font-bold text-blue-600">{category.priceRange}</div>
        </div>

        {/* Services Preview */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-2">Popular Services:</div>
          <div className="flex flex-wrap gap-1">
            {category.services.slice(0, 3).map((service, index) => (
              <span 
                key={index}
                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium"
              >
                {service}
              </span>
            ))}
            {category.services.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                +{category.services.length - 3} more
              </span>
            )}
          </div>
        </div>
        
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
            Book {category.name}
          </Button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-500 pointer-events-none rounded-lg"></div>
    </Card>
  );
};

export default ServiceCategoryCard;