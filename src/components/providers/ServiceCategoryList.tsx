import React from 'react';
import { ServiceCategory } from '../../data/serviceCategories';
import ServiceCategoryCard from './ServiceCategoryCard';
import { Search, Star, Users } from 'lucide-react';

interface ServiceCategoryListProps {
  categories: ServiceCategory[];
  onCategoryClick: (categoryId: string) => void;
  title?: string;
  emptyMessage?: string;
}

const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  onCategoryClick,
  title = 'Available Services',
  emptyMessage = 'No services found'
}) => {
  if (categories.length === 0) {
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

  const totalProviders = categories.reduce((sum, cat) => sum + cat.totalProviders, 0);
  const averageRating = categories.reduce((sum, cat) => sum + cat.averageRating, 0) / categories.length;

  return (
    <section className="py-16">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full px-6 py-3 mb-6">
          <Star className="h-5 w-5 mr-2" />
          <span className="font-medium">{categories.length} Service Categories Available</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Choose from our verified service categories with {totalProviders} professional technicians
        </p>

        {/* Quick Stats */}
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {totalProviders} Technicians
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            {averageRating.toFixed(1)} Avg Rating
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Always Support Available
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((category, index) => (
          <div 
            key={category.id}
            className="transform transition-all duration-300 hover:scale-105"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <ServiceCategoryCard
              category={category}
              onClick={() => onCategoryClick(category.id)}
            />
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      {categories.length > 0 && (
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-white rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-blue-200">
            <span className="text-gray-700 font-medium mr-2 group-hover:text-blue-600 transition-colors">
              All services backed by verified technicians
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServiceCategoryList;