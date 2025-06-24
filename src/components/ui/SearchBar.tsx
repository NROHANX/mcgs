import React, { useState } from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative ${className}`}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/20 hover:bg-white transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="What service do you need?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-transparent text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>
          
          <div className="relative md:w-1/3">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-transparent text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>
          
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group min-w-[140px]"
          >
            <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
            Search
          </button>
        </div>
      </div>
      
      {/* Floating Search Suggestions */}
      <div className="absolute top-full left-0 right-0 mt-2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20">
          <div className="flex flex-wrap gap-2">
            {['RO Service', 'Electrician', 'Plumber', 'AC Repair'].map((suggestion, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;