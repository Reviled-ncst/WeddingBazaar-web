import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { 
  searchPhilippineLocations, 
  getPopularWeddingDestinations,
  type PhilippineLocation 
} from '../../../utils/geolocation';

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: PhilippineLocation) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search for cities, municipalities...",
  className,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<PhilippineLocation[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showPopular, setShowPopular] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get popular destinations for initial display
  const popularDestinations = getPopularWeddingDestinations();

  // Search locations when value changes
  useEffect(() => {
    if (value.length >= 2) {
      const results = searchPhilippineLocations(value, 8);
      setSearchResults(results);
      setShowPopular(false);
    } else {
      setSearchResults([]);
      setShowPopular(value.length === 0);
    }
    setHighlightedIndex(-1);
  }, [value]);

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (value.length === 0) {
      setShowPopular(true);
      setSearchResults(popularDestinations);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      setIsOpen(false);
      setShowPopular(false);
    }, 200);
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (!isOpen) setIsOpen(true);
  };

  // Handle location selection
  const handleLocationSelect = (location: PhilippineLocation) => {
    onChange(location.fullName);
    onLocationSelect?.(location);
    setIsOpen(false);
    setShowPopular(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const resultsToShow = showPopular ? popularDestinations : searchResults;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < resultsToShow.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && resultsToShow[highlightedIndex]) {
        handleLocationSelect(resultsToShow[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Clear input
  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const resultsToShow = showPopular ? popularDestinations : searchResults;

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300",
            "bg-white/80 backdrop-blur-sm shadow-lg",
            error
              ? "border-red-500 focus:border-red-600 bg-red-50/80"
              : "border-gray-200 focus:border-rose-500 focus:shadow-xl focus:shadow-rose-500/20",
            className
          )}
          placeholder={placeholder}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (resultsToShow.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto"
        >
          {/* Header */}
          {showPopular && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-rose-500" />
                Popular Wedding Destinations
              </h4>
            </div>
          )}

          {/* Results */}
          <div className="py-2">
            {resultsToShow.map((location, index) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleLocationSelect(location)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3",
                  highlightedIndex === index && "bg-rose-50 text-rose-700"
                )}
              >
                <MapPin className={cn(
                  "w-4 h-4 flex-shrink-0",
                  location.type === 'city' ? "text-blue-500" : "text-green-500"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {location.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {location.province && location.region && (
                      `${location.province}, ${location.region}`
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    location.type === 'city' 
                      ? "bg-blue-100 text-blue-700" 
                      : location.type === 'municipality'
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  )}>
                    {location.type}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* No Results */}
          {!showPopular && searchResults.length === 0 && value.length >= 2 && (
            <div className="px-4 py-6 text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No locations found for "{value}"</p>
              <p className="text-xs mt-1">Try searching for a city or province name</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
