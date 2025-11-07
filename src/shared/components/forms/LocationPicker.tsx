import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '../../../utils/cn';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  address: string;
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
}

interface LocationPickerProps {
  value: string;
  onChange: (location: string, locationData?: LocationData) => void;
  placeholder?: string;
  className?: string;
  showMapPreview?: boolean;
}

// Component to handle map clicks
const MapClickHandler: React.FC<{ 
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};


export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search locations in Cavite (e.g., Dasmariñas, Imus, Bacoor)",
  className
}) => {
  // ✅ ENHANCEMENT: Always default to Dasmariñas, Cavite (Wedding Bazaar primary location)
  const DASMARINAS_CENTER: [number, number] = [14.3294, 120.9367]; // Dasmariñas City Hall coordinates
  
  const [position, setPosition] = useState<[number, number] | null>(DASMARINAS_CENTER);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchCacheRef = useRef<Map<string, LocationData[]>>(new Map());

  // Initialize with Dasmariñas location (no geolocation request by default)
  useEffect(() => {
    // Map always starts centered on Dasmariñas
    // User can click "Use current location" button if they want their GPS location
    setPosition(DASMARINAS_CENTER);
  }, []);

  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    // Check cache first for instant results
    const cacheKey = query.toLowerCase().trim();
    if (searchCacheRef.current.has(cacheKey)) {
      setSearchResults(searchCacheRef.current.get(cacheKey)!);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      // ✅ STRICT CAVITE-ONLY SEARCH: Force Philippines country code and Cavite province
      const searchQuery = `${query}, Cavite, Philippines`;
      
      // Viewbox for Cavite province (approximate bounds)
      // Southwest: 14.1°N, 120.8°E | Northeast: 14.5°N, 121.1°E
      const viewbox = '120.8,14.1,121.1,14.5'; // lon_min,lat_min,lon_max,lat_max
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json` +
        `&q=${encodeURIComponent(searchQuery)}` +
        `&countrycodes=ph` + // ✅ STRICT: Only Philippines results
        `&viewbox=${viewbox}` +
        `&bounded=1` + // ✅ STRICT: Must be within viewbox
        `&limit=10` +
        `&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WeddingBazaar/1.0'
          }
        }
      );
      const data = await response.json();
      
      // ✅ STRICT FILTER: Only accept results that are definitely in Cavite, Philippines
      const caviteResults: LocationData[] = data
        .filter((item: any) => {
          // Check coordinates are within Cavite bounds
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const inBounds = lat >= 14.1 && lat <= 14.5 && lng >= 120.8 && lng <= 121.1;
          
          if (!inBounds) return false;
          
          // Check address fields for Cavite
          const state = item.address?.state?.toLowerCase() || '';
          const province = item.address?.province?.toLowerCase() || '';
          const county = item.address?.county?.toLowerCase() || '';
          const country = item.address?.country?.toLowerCase() || '';
          const displayName = item.display_name?.toLowerCase() || '';
          
          // Must be in Philippines
          if (!country.includes('philippines') && !country.includes('pilipinas')) {
            return false;
          }
          
          // Must be in Cavite
          return state.includes('cavite') || 
                 province.includes('cavite') || 
                 county.includes('cavite') ||
                 displayName.includes('cavite');
        })
        .map((item: any) => ({
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          city: item.address?.city || item.address?.town || item.address?.village || item.address?.municipality,
          state: 'Cavite',
          country: 'Philippines'
        }));
      
      // Store in cache for faster future searches
      searchCacheRef.current.set(cacheKey, caviteResults);
      
      // Limit cache size to prevent memory issues (keep last 50 searches)
      if (searchCacheRef.current.size > 50) {
        const firstKey = searchCacheRef.current.keys().next().value;
        if (firstKey) {
          searchCacheRef.current.delete(firstKey);
        }
      }
      
      setSearchResults(caviteResults);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Show loading immediately when user types
    if (searchQuery.length >= 3) {
      setIsSearching(true);
    }
    
    // Reduced delay from 300ms to 150ms for faster response
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(searchQuery);
    }, 150);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WeddingBazaar/1.0'
          }
        }
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const handleLocationSelect = async (locationData: LocationData) => {
    onChange(locationData.address, locationData);
    setSearchResults([]);
    setSearchQuery('');
    if (locationData.lat && locationData.lng) {
      setPosition([locationData.lat, locationData.lng]);
    }
  };

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    const address = await getAddressFromCoords(lat, lng);
    onChange(address, { address, lat, lng });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setPosition([lat, lng]);
          const address = await getAddressFromCoords(lat, lng);
          onChange(address, { address, lat, lng });
        },
        () => {}
      );
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Input Field with Search Dropdown */}
      <div className="relative z-10">
        <MapPin className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 transition-colors",
          isSearching && searchQuery.length >= 3 ? "text-rose-500 animate-pulse" : "text-gray-400"
        )} />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const inputValue = e.target.value;
            onChange(inputValue, { address: inputValue });
            setSearchQuery(inputValue);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 relative z-10 transition-all",
            isSearching && searchQuery.length >= 3 
              ? "border-rose-300 bg-rose-50/30" 
              : "border-gray-300 bg-white"
          )}
        />
        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1 z-10">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Use current location"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>
        
        {/* Search Results Dropdown - Directly below input */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-rose-200 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleLocationSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-rose-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
              <div className="font-medium text-gray-900 truncate">{result.address}</div>
              {result.city && result.state && (
                <div className="text-sm text-gray-500">
                  {result.city}, {result.state}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Loading indicator - Appears instantly with animation */}
      {isSearching && searchQuery.length >= 3 && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-rose-200 rounded-lg shadow-2xl z-50 p-3 text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Searching Cavite locations...</span>
          </div>
        </div>
      )}
    </div>
    {/* Close input wrapper div */}
      {/* Map Preview (always visible) - Focused on Dasmariñas */}
      {position && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0">
          <MapContainer
            center={position}
            zoom={14}
            style={{ height: '300px', width: '100%', position: 'relative', zIndex: 0 }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
            <MapClickHandler onLocationSelect={handleMapLocationSelect} />
          </MapContainer>
          <div className="px-3 py-2 bg-rose-50 border-t border-rose-100 text-xs text-rose-700">
            📍 Map centered on Dasmariñas, Cavite. Click map to select location or search above.
          </div>
        </div>
      )}
    </div>
  );
};
