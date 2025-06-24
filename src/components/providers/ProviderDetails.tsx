import React, { useState } from 'react';
import { ChevronLeft, Star, User, Calendar, MessageSquare } from 'lucide-react';
import { Provider, Service } from '../../types';
import Button from '../ui/Button';
import Rating from '../ui/Rating';

interface ProviderDetailsProps {
  provider: Provider;
  onBack: () => void;
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ provider, onBack }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'reviews'>('services');

  const ServiceItem: React.FC<{ service: Service }> = ({ service }) => (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <p className="text-gray-600 mt-1">{service.description}</p>
        </div>
        <div className="text-right">
          <p className="text-blue-600 font-semibold">{service.price}</p>
          {service.estimatedTime && (
            <p className="text-sm text-gray-500">Est. time: {service.estimatedTime}</p>
          )}
        </div>
      </div>
      <Button variant="outline" className="mt-4" fullWidth>Request Quote</Button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with back button */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <button 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to results</span>
        </button>
      </div>

      {/* Provider hero section */}
      <div className="relative h-64 md:h-80">
        <img 
          src={provider.image} 
          alt={provider.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
          <div className="flex items-center mb-2">
            <Rating value={provider.rating} className="mr-2" />
            <span>({provider.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center text-white/90">
            <span className="mr-4">{provider.category}</span>
            <span>{provider.location}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 p-6 border-b border-gray-200">
        <Button icon={<Calendar className="h-4 w-4" />}>Book Appointment</Button>
        <Button variant="outline" icon={<MessageSquare className="h-4 w-4" />}>Send Message</Button>
        <Button variant="outline" icon={<User className="h-4 w-4" />}>View Profile</Button>
      </div>

      {/* Description */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-3">About</h2>
        <p className="text-gray-700">{provider.description}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            className={`px-6 py-3 font-medium text-sm focus:outline-none ${
              activeTab === 'services' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm focus:outline-none ${
              activeTab === 'reviews' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({provider.reviews.length})
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'services' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
            {provider.services.map(service => (
              <ServiceItem key={service.id} service={service} />
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
            {provider.reviews.map(review => (
              <div key={review.id} className="border-b border-gray-200 py-4 last:border-b-0">
                <div className="flex items-start">
                  <img 
                    src={review.avatar} 
                    alt={review.user} 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{review.user}</h3>
                    <div className="flex items-center my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={`${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} mr-0.5`} 
                        />
                      ))}
                      <span className="text-gray-500 text-sm ml-2">{review.date}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDetails;