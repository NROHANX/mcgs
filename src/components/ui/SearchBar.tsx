import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Clock, Star, Zap, Droplet, Settings, Wrench } from 'lucide-react';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Demo services for autocomplete
  const demoServices = [
    { name: 'RO Technician', icon: <Droplet className="h-5 w-5" />, description: 'Water purifier installation & repair', rating: 4.8, providers: 28 },
    { name: 'AC Technician', icon: <Zap className="h-5 w-5" />, description: 'Air conditioning service & repair', rating: 4.7, providers: 20 },
    { name: 'Electrician', icon: <Zap className="h-5 w-5" />, description: 'Electrical wiring & repairs', rating: 4.9, providers: 24 },
    { name: 'Plumber', icon: <Settings className="h-5 w-5" />, description: 'Plumbing repairs & installations', rating: 4.6, providers: 18 },
    { name: 'Mechanic', icon: <Wrench className="h-5 w-5" />, description: 'Vehicle repair & maintenance', rating: 4.7, providers: 32 }
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
    setShowLocationDropdown(false);
    onSearch(query, location);
  };

  const handleLocationChange = (value: string, placeDetails?: google.maps.places.PlaceResult) => {
    setLocation(value);
    setShowLocationDropdown(false);
    
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
    setShowLocationDropdown(false);
  };

  const handleLocationFocus = () => {
    if (!location) {
      setShowLocationDropdown(true);
    }
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
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-4 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-transparent text-gray-900 placeholder-gray-500 font-medium"
              />
              
              {/* Service Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20 z-[1000]">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['RO Service', 'AC Repair', 'Electrician', 'Plumber'].map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleServiceSelect(suggestion)}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredServices.map((service, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleServiceSelect(service.name)}
                        className="w-full flex items-center p-3 hover:bg-blue-50 rounded-lg transition-colors text-left"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          {service.icon}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.description}</div>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 mr-1" />
                          <span>{service.rating}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Location Input with Google Maps */}
            <div className="relative md:w-1/3 z-[1001]">
              <GoogleMapsAutocomplete
                value={location}
                onChange={handleLocationChange}
                placeholder="Your location"
                className="w-full py-4 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-transparent text-gray-900 placeholder-gray-500 font-medium"
              />
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