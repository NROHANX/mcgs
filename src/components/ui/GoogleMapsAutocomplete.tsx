import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Loader, Navigation, Star, Clock, X } from 'lucide-react';

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string, placeDetails?: any) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter your location",
  className = "",
  required = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Popular locations for demo (fallback when Google Maps is not available)
  const popularLocations = [
    { name: 'Sitabuldi, Nagpur', type: 'Commercial Area', distance: '2.5 km' },
    { name: 'Dharampeth, Nagpur', type: 'Residential Area', distance: '3.2 km' },
    { name: 'Sadar, Nagpur', type: 'Central Area', distance: '1.8 km' },
    { name: 'Itwari, Nagpur', type: 'Market Area', distance: '4.1 km' },
    { name: 'Civil Lines, Nagpur', type: 'Government Area', distance: '2.9 km' },
    { name: 'Wardha Road, Nagpur', type: 'Highway Area', distance: '5.2 km' }
  ];

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
    // Don't hide suggestions immediately to allow for clicking on them
    setTimeout(() => {
      if (!showSuggestions) {
        setIsFocused(false);
      }
    }, 200);
  };

  const handleLocationSelect = (locationName: string) => {
    setInputValue(locationName);
    setShowSuggestions(false);
    setIsFocused(false);
    onChange(locationName);
  };

  const handleCloseModal = () => {
    setShowSuggestions(false);
  };

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Portal Modal Component
  const LocationModal = () => {
    if (!showSuggestions) return null;

    return createPortal(
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
        style={{ zIndex: 9999999 }}
        onClick={handleCloseModal}
      >
        {/* Modal content */}
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 mr-3">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Select Your Location</h3>
                  <p className="text-xs text-gray-500">Choose from popular locations</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Location List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
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
                Location selection • Quick service matching
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

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
        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${className}`}
        placeholder={placeholder}
      />
      
      {/* Status Indicator */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
        <div className="flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
          Location
        </div>
      </div>
      
      {/* Portal Modal - Renders outside component hierarchy */}
      <LocationModal />
    </div>
  );
};

export default GoogleMapsAutocomplete;