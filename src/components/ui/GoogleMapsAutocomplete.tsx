import React, { useCallback, useState, useEffect } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { MapPin, Loader, Navigation, Star, Clock } from 'lucide-react';

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const libraries: ("places")[] = ["places"];

const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter your location",
  className = "",
  required = false
}) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Popular locations for demo
  const popularLocations = [
    { name: 'Sitabuldi, Nagpur', type: 'Commercial Area', distance: '2.5 km' },
    { name: 'Dharampeth, Nagpur', type: 'Residential Area', distance: '3.2 km' },
    { name: 'Sadar, Nagpur', type: 'Central Area', distance: '1.8 km' },
    { name: 'Itwari, Nagpur', type: 'Market Area', distance: '4.1 km' },
    { name: 'Civil Lines, Nagpur', type: 'Government Area', distance: '2.9 km' },
    { name: 'Wardha Road, Nagpur', type: 'Highway Area', distance: '5.2 km' }
  ];

  const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.formatted_address) {
        const newValue = place.formatted_address;
        setInputValue(newValue);
        setShowSuggestions(false);
        setIsFocused(false);
        onChange(newValue, place);
      }
    }
  }, [autocomplete, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length === 0 && isFocused);
    onChange(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(inputValue.length === 0);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleLocationSelect = (locationName: string) => {
    setInputValue(locationName);
    setShowSuggestions(false);
    setIsFocused(false);
    onChange(locationName);
  };

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  if (loadError) {
    console.error('Google Maps API failed to load:', loadError);
    // Fallback to regular input if Google Maps fails to load
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-xs text-red-500">Maps unavailable</span>
        </div>
        
        {/* Popular Locations Fallback */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-80 overflow-y-auto">
            <div className="p-4">
              <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                Popular Locations
              </div>
              {popularLocations.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationSelect(location.name)}
                  className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {location.name}
                      </div>
                      <div className="text-sm text-gray-500">{location.type}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{location.distance}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
        <input
          type="text"
          disabled
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${className}`}
          placeholder="Loading maps..."
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader className="h-4 w-4 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          types: ['geocode'],
          componentRestrictions: { country: 'IN' },
          fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${className}`}
          placeholder={placeholder}
        />
      </Autocomplete>
      
      {/* Enhanced Status Indicator */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
        <div className="flex items-center bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
          Maps
        </div>
      </div>
      
      {/* Enhanced Popular Locations Dropdown */}
      {showSuggestions && !inputValue && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 mr-3">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Popular Locations</h3>
                  <p className="text-xs text-gray-500">Select from frequently used locations</p>
                </div>
              </div>
              <div className="text-xs text-blue-600 font-medium">
                Nagpur Area
              </div>
            </div>
            
            {/* Location List */}
            <div className="space-y-2">
              {popularLocations.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationSelect(location.name)}
                  className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {location.name}
                      </div>
                      <div className="text-sm text-gray-500">{location.type}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-400">{location.distance}</div>
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>30 min response</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <div className="text-xs text-gray-500">
                Powered by Google Maps • Precise location matching
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsAutocomplete;