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
  placeholder = "Enter venue or location",
  className
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          setPosition([14.5995, 120.9842]); // Manila default
        }
      );
    } else {
      setPosition([14.5995, 120.9842]);
    }
  }, []);

  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WeddingBazaar/1.0'
          }
        }
      );
      const data = await response.json();
      const results: LocationData[] = data.map((item: any) => ({
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country
      }));
      setSearchResults(results);
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
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);
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
      {/* Input Field */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const inputValue = e.target.value;
            onChange(inputValue, { address: inputValue });
            setSearchQuery(inputValue);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
        />
        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Use current location"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleLocationSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
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
      {/* Loading indicator */}
      {isSearching && searchQuery.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center">
          <div className="text-gray-500">Searching locations...</div>
        </div>
      )}
      {/* Map Preview (always visible) */}
      {position && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '250px', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
            <MapClickHandler onLocationSelect={handleMapLocationSelect} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};
