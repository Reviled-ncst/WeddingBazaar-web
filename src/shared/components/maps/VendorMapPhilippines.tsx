import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder';
import './VendorMapPhilippines.css';
import { MapPin, Navigation, Search } from 'lucide-react';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface VendorLocation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  description?: string;
  priceRange?: string;
}

interface VendorMapProps {
  vendors: VendorLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onVendorSelect?: (vendor: VendorLocation) => void;
  selectedVendorId?: string;
  showUserLocation?: boolean;
  showAddressSearch?: boolean;
  showVendorCount?: boolean;
  className?: string;
  onAddressFound?: (address: string, lat: number, lng: number) => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

// Philippines-specific geocoding service
const philippineGeocoding = {
  async searchAddress(query: string): Promise<{ lat: number; lng: number; display_name: string }[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ph&q=${encodeURIComponent(query)}`
      );
      return await response.json();
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  },

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=en,tl`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
};

// Create custom vendor marker icon
const createVendorIcon = (category: string, isSelected: boolean = false) => {
  const categoryColors: { [key: string]: string } = {
    'photography': '#e11d48',
    'catering': '#f59e0b',
    'venues': '#8b5cf6',
    'music': '#06b6d4',
    'planning': '#10b981',
    'flowers': '#ec4899',
    'transportation': '#6366f1',
    'decoration': '#f97316',
    'other': '#6b7280'
  };
  
  const color = categoryColors[category.toLowerCase()] || categoryColors.other;
  const size = isSelected ? 40 : 32;
  
  return L.divIcon({
    html: `
      <div class="vendor-marker ${isSelected ? 'selected' : ''}" 
           style="width: ${size}px; height: ${size}px; border-color: ${color};">
        <div class="vendor-marker-inner" style="background-color: ${color};">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        ${isSelected ? '<div class="selection-ring"></div>' : ''}
      </div>
    `,
    className: 'vendor-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

export const VendorMap: React.FC<VendorMapProps> = ({
  vendors,
  center = [14.5995, 120.9842], // Default to Manila, Philippines
  zoom = 10,
  height = '400px',
  onVendorSelect,
  selectedVendorId,
  showUserLocation = true,
  showAddressSearch = false,
  showVendorCount = true,
  className = '',
  onAddressFound
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const vendorMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapRef.current = map;

    // Add tile layer with Philippine-optimized settings
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | Wedding Vendors Philippines',
      maxZoom: 19,
      minZoom: 5,
    }).addTo(map);

    // Add scale control (metric for Philippines)
    L.control.scale({ metric: true, imperial: false }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  // Get user location with high accuracy for Philippines
  useEffect(() => {
    if (!showUserLocation || !mapRef.current) return;

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser');
        return;
      }

      setLocationError('');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📍 Philippines location: ${latitude}, ${longitude} (±${accuracy}m)`);
          
          // Get complete address for the user location
          const address = await philippineGeocoding.reverseGeocode(latitude, longitude);
          
          const location: UserLocation = {
            latitude,
            longitude,
            accuracy,
            address
          };
          
          setUserLocation(location);

          // Add user location marker with Philippine styling
          if (userMarkerRef.current) {
            mapRef.current?.removeLayer(userMarkerRef.current);
          }

          const userIcon = L.divIcon({
            html: `
              <div class="user-location-marker philippines-location">
                <div class="user-location-pulse"></div>
                <div class="user-location-dot"></div>
                <div class="philippines-flag">🇵🇭</div>
              </div>
            `,
            className: 'user-location-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([latitude, longitude], { icon: userIcon });
          
          marker.bindPopup(`
            <div class="user-location-popup">
              <h3 class="flex items-center">
                <span class="mr-2">📍</span>
                Your Location in Philippines 🇵🇭
              </h3>
              <div class="location-details">
                <p class="address"><strong>Address:</strong> ${address}</p>
                <p class="coordinates"><strong>Coordinates:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                <p class="accuracy"><strong>Accuracy:</strong> ±${Math.round(accuracy)}m</p>
                <p class="timezone"><strong>Timezone:</strong> Asia/Manila</p>
              </div>
              <div class="location-actions">
                <button onclick="window.open('https://maps.google.com/?q=${latitude},${longitude}', '_blank')" 
                        class="btn-open-maps">
                  📱 Open in Google Maps
                </button>
              </div>
            </div>
          `);

          marker.addTo(mapRef.current!);
          userMarkerRef.current = marker;

          // Show accuracy circle for high accuracy locations
          if (accuracy < 100) {
            L.circle([latitude, longitude], {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              radius: accuracy,
              className: 'accuracy-circle'
            }).addTo(mapRef.current!);
          }
        },
        (error) => {
          let errorMessage = 'Unable to get your location in Philippines';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services for better vendor discovery.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Check your GPS signal.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          setLocationError(errorMessage);
          console.warn('Philippines geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // 15 seconds timeout
          maximumAge: 300000 // 5 minutes cache
        }
      );
    };

    getCurrentLocation();
  }, [showUserLocation]);

  // Add vendor markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing vendor markers
    vendorMarkersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    vendorMarkersRef.current = [];

    vendors.forEach(vendor => {
      const isSelected = selectedVendorId === vendor.id;
      const marker = L.marker([vendor.latitude, vendor.longitude], { 
        icon: createVendorIcon(vendor.category, isSelected) 
      });
      
      const popupContent = `
        <div class="vendor-popup philippines-vendor">
          <div class="vendor-header">
            ${vendor.image ? `
              <img src="${vendor.image}" alt="${vendor.name}" class="vendor-image" />
            ` : `
              <div class="vendor-image-placeholder">
                <svg class="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            `}
            <div class="vendor-info">
              <h3 class="vendor-name">${vendor.name}</h3>
              <span class="vendor-category">${vendor.category}</span>
              ${vendor.rating ? `
                <div class="vendor-rating">
                  <div class="stars">
                    ${Array.from({length: 5}, (_, i) => `
                      <svg class="w-4 h-4 ${i < Math.floor(vendor.rating!) ? 'text-yellow-400' : 'text-gray-300'}" 
                           fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    `).join('')}
                  </div>
                  <span class="rating-text">${vendor.rating}</span>
                  ${vendor.reviewCount ? `<span class="review-count">(${vendor.reviewCount} reviews)</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          
          ${vendor.description ? `
            <p class="vendor-description">${vendor.description}</p>
          ` : ''}
          
          <div class="vendor-details">
            ${vendor.address ? `
              <div class="vendor-detail">
                <span class="detail-icon">📍</span>
                <span class="detail-text">${vendor.address}</span>
              </div>
            ` : ''}
            
            ${vendor.phone ? `
              <div class="vendor-detail">
                <span class="detail-icon">📞</span>
                <a href="tel:${vendor.phone}" class="detail-link">${vendor.phone}</a>
              </div>
            ` : ''}
            
            ${vendor.website ? `
              <div class="vendor-detail">
                <span class="detail-icon">🌐</span>
                <a href="${vendor.website}" target="_blank" rel="noopener" class="detail-link">Visit Website</a>
              </div>
            ` : ''}
            
            ${vendor.priceRange ? `
              <div class="vendor-detail">
                <span class="detail-icon">💰</span>
                <span class="detail-text price-range">₱{vendor.priceRange}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="vendor-actions">
            <button onclick="window.open('https://maps.google.com/?q=${vendor.latitude},${vendor.longitude}', '_blank')" 
                    class="action-btn">
              🗺️ Directions
            </button>
            ${vendor.phone ? `
              <button onclick="window.open('tel:${vendor.phone}')" class="action-btn">
                📞 Call Now
              </button>
            ` : ''}
          </div>
          
          <div class="philippines-badge">
            <span>🇵🇭 Philippine Wedding Vendor</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'custom-vendor-popup'
      });

      if (onVendorSelect) {
        marker.on('click', () => onVendorSelect(vendor));
      }

      marker.addTo(mapRef.current!);
      vendorMarkersRef.current.push(marker);
    });
  }, [vendors, selectedVendorId, onVendorSelect]);

  // Fit map to show all vendors
  useEffect(() => {
    if (!mapRef.current || vendors.length === 0) return;

    const group = new L.FeatureGroup(vendorMarkersRef.current);
    
    if (userLocation && userMarkerRef.current) {
      group.addLayer(userMarkerRef.current);
    }

    if (group.getLayers().length > 0) {
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [vendors, userLocation]);

  // Philippine address search functionality
  const handleAddressSearch = async (query: string) => {
    if (!query.trim() || !mapRef.current) return;

    setIsSearching(true);
    try {
      const results = await philippineGeocoding.searchAddress(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Philippine address search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    if (!mapRef.current) return;

    const coordinates: [number, number] = [parseFloat(result.lat), parseFloat(result.lng)];
    
    // Remove existing search marker
    if (searchMarkerRef.current) {
      mapRef.current.removeLayer(searchMarkerRef.current);
    }

    // Add search result marker
    const searchIcon = L.divIcon({
      html: `
        <div class="search-marker philippines-search">
          <div class="search-pulse"></div>
          <div class="search-icon">🔍</div>
        </div>
      `,
      className: 'search-marker-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    const marker = L.marker(coordinates, { icon: searchIcon });
    marker.bindPopup(`
      <div class="search-popup">
        <h3>🔍 Search Result in Philippines 🇵🇭</h3>
        <p class="search-address">${result.display_name}</p>
        <button onclick="this.closest('.leaflet-popup').remove()" 
                class="close-btn">
          ✕ Close
        </button>
      </div>
    `).openPopup();

    marker.addTo(mapRef.current);
    searchMarkerRef.current = marker;

    // Pan to result with appropriate zoom
    mapRef.current.setView(coordinates, Math.max(mapRef.current.getZoom(), 14));

    // Clear search
    setSearchQuery('');
    setSearchResults([]);

    // Notify parent component
    if (onAddressFound) {
      onAddressFound(result.display_name, parseFloat(result.lat), parseFloat(result.lng));
    }
  };

  return (
    <div className={`vendor-map-container philippines-map ${className}`}>
      {/* Map Header */}
      <div className="vendor-map-header">
        <div className="vendor-map-title">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3>Philippine Wedding Vendors 🇵🇭</h3>
          {showVendorCount && (
            <span className="vendor-count">
              {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {showAddressSearch && (
          <div className="address-search philippines-search">
            <div className="search-input-container">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Philippine addresses (e.g., Manila, Cebu, Davao)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddressSearch(searchQuery);
                  }
                }}
                className="search-input"
              />
              <button
                onClick={() => handleAddressSearch(searchQuery)}
                disabled={isSearching}
                className="search-button"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectSearchResult(result)}
                    className="search-result-item"
                  >
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Status */}
      {showUserLocation && (userLocation || locationError) && (
        <div className="location-status philippines-status">
          {userLocation ? (
            <div className="location-success">
              <Navigation className="w-4 h-4 text-green-600" />
              <span>📍 Your location in Philippines: {userLocation.address}</span>
              <span className="accuracy">±{Math.round(userLocation.accuracy)}m</span>
            </div>
          ) : (
            <div className="location-error">
              <span className="text-red-600">⚠️ {locationError}</span>
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="vendor-map philippines-vendor-map"
        style={{ height }}
      />

      {/* Map Footer */}
      <div className="vendor-map-footer philippines-footer">
        <div className="category-legend">
          <span className="legend-title">Wedding Vendor Categories:</span>
          {Object.entries({
            'Photography': '#e11d48',
            'Catering': '#f59e0b',
            'Venues': '#8b5cf6',
            'Music': '#06b6d4',
            'Planning': '#10b981',
            'Flowers': '#ec4899'
          }).map(([category, color]) => (
            <div key={category} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: color }}
              />
              <span>{category}</span>
            </div>
          ))}
        </div>
        
        <div className="map-attribution">
          <span>🇵🇭 Powered by OpenStreetMap • Philippine Wedding Vendors • Asia/Manila Timezone</span>
        </div>
      </div>
    </div>
  );
};

export default VendorMap;
