import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Clock, Star } from 'lucide-react';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Demo services for autocomplete
  const demoServices = [
    { name: 'RO Technician', icon: '💧', description: 'Water purifier installation & repair', rating: 4.8, providers: 28 },
    { name: 'AC Technician', icon: '❄️', description: 'Air conditioning service & repair', rating: 4.7, providers: 20 },
    { name: 'Electrician', icon: '⚡', description: 'Electrical wiring & repairs', rating: 4.9, providers: 24 },
    { name: 'Plumber', icon: '🔧', description: 'Plumbing repairs & installations', rating: 4.6, providers: 18 },
    { name: 'Mechanic', icon: '🔩', description: 'Vehicle repair & maintenance', rating: 4.7, providers: 32 },
    { name: 'Carpenter', icon: '🪚', description: 'Furniture making & wood work', rating: 4.8, providers: 15 },
    { name: 'Painter', icon: '🎨', description: 'Interior & exterior painting', rating: 4.5, providers: 12 },
    { name: 'Cleaner', icon: '🧹', description: 'Home & office cleaning', rating: 4.6, providers: 28 }
  ];

  // Popular locations for demo
  const popularLocations = [
    'Sitabuldi, Nagpur',
    'Dharampeth, Nagpur', 
    'Sadar, Nagpur',
    'Itwari, Nagpur',
    'Civil Lines, Nagpur',
    'Wardha Road, Nagpur'
  ];

  const filteredServices = demoServices.filter(service =>
    service.name.toLowerCase().includes(query.toLowerCase()) ||
    service.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query, location);
  };

  const handleLocationChange = (value: string, placeDetails?: google.maps.places.PlaceResult) => {
    setLocation(value);
    
    if (placeDetails) {
      console.log('Selected location:', placeDetails);
    }
  };

  const handleServiceSelect = (serviceName: string) => {
    setQuery(serviceName);
    setShowSuggestions(false);
    onSearch(serviceName, location);
  };

  const handleLocationSelect = (locationName: string) => {
    setLocation(locationName);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/20 hover:bg-white transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Service Search Input */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="What service do you need?"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(query.length > 0)}
                className="w-full pl-12 pr-4 py-4 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-transparent text-gray-900 placeholder-gray-500 font-medium"
              />
              
              {/* Service Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-80 overflow-y-auto">
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                      {query ? 'Matching Services' : 'Popular Services'}
                    </div>
                    
                    {(query ? filteredServices : demoServices.slice(0, 6)).map((service, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleServiceSelect(service.name)}
                        className="w-full flex items-center p-3 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                      >
                        <div className="text-2xl mr-3">{service.icon}</div>
                        <div className="flex-grow">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500">{service.description}</div>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Star className="h-3 w-3 mr-1 text-yellow-400" />
                            {service.rating} • {service.providers} technicians
                          </div>
                        </div>
                        <div className="text-green-600 text-xs font-medium">
                          Available
                        </div>
                      </button>
                    ))}
                    
                    {query && filteredServices.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No services found for "{query}"</p>
                        <p className="text-xs">Try searching for: RO, AC, Electrician, Plumber</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Location Input with Google Maps */}
            <div className="relative md:w-1/3">
              <GoogleMapsAutocomplete
                value={location}
                onChange={handleLocationChange}
                placeholder="Your location"
                className="w-full py-4 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-transparent text-gray-900 placeholder-gray-500 font-medium"
              />
              
              {/* Popular Locations */}
              {!location && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-40">
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-green-500" />
                      Popular Locations
                    </div>
                    {popularLocations.map((loc, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(loc)}
                        className="w-full flex items-center p-2 hover:bg-green-50 rounded-lg transition-colors text-left text-sm"
                      >
                        <MapPin className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-gray-700">{loc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group min-w-[140px]"
            >
              <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
              Search
            </button>
          </div>
        </div>
      </form>
      
      {/* Quick Service Buttons */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <div className="text-blue-200 text-sm font-medium mr-2">Quick Search:</div>
        {['RO Service', 'AC Repair', 'Electrician', 'Plumber', 'Mechanic'].map((service, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleServiceSelect(service)}
            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm hover:bg-white/30 transition-all duration-300 border border-white/20 hover:border-white/40"
          >
            {service}
          </button>
        ))}
      </div>

      {/* Enhanced Features Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <MapPin className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <div className="text-white font-medium text-sm">Google Maps Enabled</div>
          <div className="text-blue-200 text-xs">Precise location matching</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <Clock className="h-6 w-6 text-orange-400 mx-auto mb-2" />
          <div className="text-white font-medium text-sm">Quick Response</div>
          <div className="text-blue-200 text-xs">Average 30 min response</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-white font-medium text-sm">Verified Technicians</div>
          <div className="text-blue-200 text-xs">4.7+ rated professionals</div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;