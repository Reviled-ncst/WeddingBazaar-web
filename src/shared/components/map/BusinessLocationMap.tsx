import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Navigation, X } from 'lucide-react';
import { reverseGeocode, isWithinPhilippines } from '../../../utils/geolocation-enhanced';
import { useGeolocation } from '../../../hooks/useGeolocation';

// Configure Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Search Philippines locations using Nominatim
const searchPhilippinesLocations = async (query: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5&accept-language=en`
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.log('Location search failed:', error);
    return [];
  }
};

interface BusinessLocationMapProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  initialLocation?: { lat: number; lng: number };
  title?: string;
}

const BusinessLocationMap: React.FC<BusinessLocationMapProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
  title = "Select Business Location"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [locationName, setLocationName] = useState('');
  
  const { getCurrentLocation, isLoading: isGeoLoading, error: geoError, location: geoLocation } = useGeolocation();

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create new map
    const map = L.map(mapRef.current).setView(
      initialLocation || [14.5995, 120.9842], // Default to Manila
      initialLocation ? 15 : 6
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add initial marker if location provided
    if (initialLocation) {
      addMarker(initialLocation.lat, initialLocation.lng);
    }

    // Handle map clicks
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      // Check if location is within Philippines
      if (!isWithinPhilippines(lat, lng)) {
        alert('Please select a location within the Philippines.');
        return;
      }
      
      addMarker(lat, lng);
      setSelectedLocation({ lat, lng });
      
      // Get location name
      try {
        const address = await reverseGeocode(lat, lng);
        setLocationName(address);
      } catch (error) {
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, initialLocation]);

  const addMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Add new marker
    const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    markerRef.current = marker;
    
    // Center map on marker
    mapInstanceRef.current.setView([lat, lng], 15);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchPhilippinesLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (mapInstanceRef.current) {
      addMarker(lat, lng);
      setSelectedLocation({ lat, lng });
      setLocationName(result.display_name);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      await getCurrentLocation();
      if (geoLocation) {
        const { latitude, longitude } = geoLocation;
        
        if (!isWithinPhilippines(latitude, longitude)) {
          alert('Your current location is outside the Philippines. Please select a location within the Philippines.');
          return;
        }
        
        addMarker(latitude, longitude);
        setSelectedLocation({ lat: latitude, lng: longitude });
        setLocationName(geoLocation.address);
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && locationName) {
      onLocationSelect({
        address: locationName,
        coordinates: selectedLocation
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-white">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">Click on the map or search to select your business location</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close map"
            aria-label="Close map"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a location in Philippines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleUseCurrentLocation}
              disabled={isGeoLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {isGeoLoading ? 'Finding...' : 'Use Current'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="text-sm font-medium text-gray-900">{result.display_name}</div>
                </button>
              ))}
            </div>
          )}

          {/* Error Messages */}
          {geoError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {geoError}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative h-96">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Map Instructions Overlay */}
          {!selectedLocation && (
            <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-pink-500" />
                <span>Click anywhere on the map to select your business location</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Location Info */}
        {selectedLocation && locationName && (
          <div className="p-4 bg-green-50 border-t border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-1">Selected Location:</h4>
                <p className="text-sm text-green-700">{locationName}</p>
                <p className="text-xs text-green-600 mt-1">
                  Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedLocation ? 'Click "Confirm Location" to use this address' : 'Select a location to continue'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLocation}
              disabled={!selectedLocation || !locationName}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessLocationMap;
