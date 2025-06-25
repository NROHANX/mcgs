import React, { useCallback, useState } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { MapPin, Loader } from 'lucide-react';

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

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.formatted_address) {
        const newValue = place.formatted_address;
        setInputValue(newValue);
        onChange(newValue, place);
      }
    }
  }, [autocomplete, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Also call onChange for manual typing
    onChange(newValue);
  };

  // Update input value when prop value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  if (loadError) {
    console.error('Google Maps API failed to load:', loadError);
    // Fallback to regular input if Google Maps fails to load
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          required={required}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-xs text-red-500">Maps unavailable</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
          componentRestrictions: { country: 'IN' }, // Restrict to India
          fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          required={required}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          placeholder={placeholder}
        />
      </Autocomplete>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <span className="text-xs text-green-600">📍 Maps enabled</span>
      </div>
    </div>
  );
};

export default GoogleMapsAutocomplete;