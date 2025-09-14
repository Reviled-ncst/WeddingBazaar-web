import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder';
import './VendorMap.css';
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

// Custom marker icons for different vendor categories
const createCustomIcon = (category: string, isSelected: boolean = false) => {
  const getMarkerColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Photography': '#3B82F6',
      'Wedding Planning': '#8B5CF6',
      'Catering': '#F59E0B',
      'Music': '#10B981',
      'DJ': '#10B981',
      'Florist': '#EC4899',
      'Venue': '#F59E0B',
      'Beauty': '#EC4899',
      'Transportation': '#6B7280',
      'other': '#6B7280'
    };
    return colors[category] || '#6B7280';
  };

  const color = getMarkerColor(category);
  const size = isSelected ? 35 : 25;
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        ${isSelected ? 'transform: scale(1.2);' : ''}
        transition: all 0.3s ease;
      ">
        <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: 'custom-vendor-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

export const VendorMap: React.FC<VendorMapProps> = ({
  vendors,
  center = [14.5995, 120.9842], // Default to Manila, Philippines
  zoom = 11,
  height: mapHeight = '400px',
  onVendorSelect,
  selectedVendorId,
  showUserLocation = true,
  showAddressSearch = false,
  showVendorCount = true,
  className = '',
  onAddressFound
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const geocoderRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    // Add geocoding control with Philippines-specific settings
    if (showAddressSearch && (L as any).Control.Geocoder) {
      geocoderRef.current = (L as any).Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Search Philippine address...',
        errorMessage: 'Address not found in Philippines',
        geocoder: (L as any).Control.Geocoder.nominatim({
          serviceUrl: 'https://nominatim.openstreetmap.org/',
          geocodingQueryParams: {
            countrycodes: 'ph', // Restrict to Philippines
            addressdetails: 1,
            'accept-language': 'en,tl', // English and Filipino/Tagalog
            limit: 5
          }
        })
      })
      .on('markgeocode', function(e: any) {
        const { center: latlng, name } = e.geocode;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(latlng, 16); // Higher zoom for Philippines
          
          // Add a temporary marker for the searched location
          const searchMarker = L.marker(latlng, {
            icon: L.divIcon({
              html: `
                <div style="
                  background-color: #10B981;
                  width: 30px;
                  height: 30px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  animation: bounce 2s infinite;
                ">
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              `,
              className: 'search-result-marker',
              iconSize: [30, 30],
              iconAnchor: [15, 30]
            })
          }).addTo(mapInstanceRef.current);

          searchMarker.bindPopup(`
            <div class="p-3">
              <div class="flex items-center text-green-600 font-semibold mb-2">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Search Result 🇵🇭
              </div>
              <p class="text-sm text-gray-700 mb-2">${name}</p>
              <button onclick="this.closest('.leaflet-popup').remove()" 
                      class="text-gray-500 hover:text-gray-700 text-xs">
                Close
              </button>
            </div>
          `).openPopup();

          // Remove search marker after 10 seconds
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.removeLayer(searchMarker);
            }
          }, 10000);

          if (onAddressFound) {
            onAddressFound(name, latlng.lat, latlng.lng);
          }
        }
      })
      .addTo(mapInstanceRef.current);
    }

    // Add user location with high accuracy for Philippines
    if (showUserLocation && navigator.geolocation) {
      // High accuracy geolocation options for Philippines
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds timeout
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📍 High accuracy location: ${latitude}, ${longitude} (±${accuracy}m)`);
          
          if (mapInstanceRef.current) {
            userLocationMarkerRef.current = L.marker([latitude, longitude], {
              icon: L.divIcon({
                html: `
                  <div class="user-location-marker philippines-location">
                    <div class="pulse-ring"></div>
                    <div class="user-dot"></div>
                    <div class="accuracy-circle" style="width: ${Math.min(accuracy / 2, 50)}px; height: ${Math.min(accuracy / 2, 50)}px;"></div>
                  </div>
                `,
                className: 'user-location-container',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              })
            }).addTo(mapInstanceRef.current);

            // Enhanced popup for Philippines location
            userLocationMarkerRef.current.bindPopup(`
              <div class="p-3 min-w-[200px]">
                <div class="flex items-center text-blue-600 font-semibold mb-2">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Your Location 🇵🇭
                </div>
                <div class="text-sm space-y-1">
                  <p class="text-gray-700"><strong>Coordinates:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                  <p class="text-gray-600"><strong>Accuracy:</strong> ±${Math.round(accuracy)}m</p>
                  <p class="text-gray-500"><strong>Timezone:</strong> Asia/Manila</p>
                </div>
                <div class="mt-3 pt-2 border-t border-gray-200">
                  <button onclick="navigator.geolocation.getCurrentPosition((pos) => {
                    window.location.href = 'https://maps.google.com/maps?q=' + pos.coords.latitude + ',' + pos.coords.longitude;
                  }, null, {enableHighAccuracy: true})" 
                          class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    📱 Open in Google Maps
                  </button>
                </div>
              </div>
            `);

            // Auto-reverse geocode to get complete address for Philippines
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en,tl`)
              .then(response => response.json())
              .then(data => {
                if (data && data.display_name) {
                  console.log(`📍 Philippines Address: ${data.display_name}`);
                  if (onAddressFound) {
                    onAddressFound(data.display_name, latitude, longitude);
                  }
                }
              })
              .catch(error => console.warn('Reverse geocoding failed:', error));
          }
        },
        (error) => {
          console.warn('High accuracy geolocation error:', error);
          let errorMessage = 'Location access failed';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Check GPS signal.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          // Show error notification
          if (mapInstanceRef.current) {
            L.popup()
              .setLatLng(center)
              .setContent(`
                <div class="p-3 text-center">
                  <div class="text-red-600 font-semibold mb-1">⚠️ Location Error</div>
                  <p class="text-sm text-gray-600">${errorMessage}</p>
                </div>
              `)
              .openOn(mapInstanceRef.current);
          }
        },
        geoOptions
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, showUserLocation, showAddressSearch, onAddressFound]);

  useEffect(() => {
    if (!mapInstanceRef.current || !vendors.length) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      mapInstanceRef.current!.removeLayer(marker);
    });
    markersRef.current = {};

    // Add vendor markers
    vendors.forEach(vendor => {
      const isSelected = selectedVendorId === vendor.id;
      const marker = L.marker(
        [vendor.latitude, vendor.longitude],
        { icon: createCustomIcon(vendor.category, isSelected) }
      ).addTo(mapInstanceRef.current!);

      // Create enhanced popup content with better styling and icons
      const popupContent = `
        <div class="vendor-popup p-4 max-w-sm">
          <div class="flex items-start space-x-3 mb-3">
            ${vendor.image ? `
              <img src="${vendor.image}" alt="${vendor.name}" 
                   class="w-16 h-16 object-cover rounded-xl shadow-md">
            ` : `
              <div class="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md">
                <svg class="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            `}
            <div class="flex-1">
              <h3 class="font-bold text-gray-900 mb-1 text-lg">${vendor.name}</h3>
              <div class="flex items-center mb-2">
                <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  ${vendor.category}
                </span>
              </div>
              ${vendor.rating ? `
                <div class="flex items-center text-sm mb-2">
                  <div class="flex items-center">
                    ${Array.from({length: 5}, (_, i) => `
                      <svg class="w-4 h-4 ${i < Math.floor(vendor.rating!) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    `).join('')}
                  </div>
                  <span class="ml-2 font-semibold text-gray-900">${vendor.rating}</span>
                  ${vendor.reviewCount ? `
                    <span class="text-gray-500 ml-1">(${vendor.reviewCount} reviews)</span>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          
          ${vendor.description ? `
            <p class="text-sm text-gray-700 mb-4 leading-relaxed">${vendor.description}</p>
          ` : ''}
          
          ${vendor.address ? `
            <div class="flex items-start text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
              <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span class="flex-1">${vendor.address}</span>
            </div>
          ` : ''}
          
          <div class="flex items-center justify-between pt-3 border-t border-gray-200">
            <div class="flex space-x-3">
              ${vendor.phone ? `
                <a href="tel:${vendor.phone}" 
                   class="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors shadow-md">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  Call
                </a>
              ` : ''}
              
              ${vendor.website ? `
                <a href="${vendor.website}" target="_blank" rel="noopener noreferrer" 
                   class="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors shadow-md">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM18.92 8h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                  </svg>
                  Visit
                </a>
              ` : ''}
            </div>
            
            ${vendor.priceRange ? `
              <span class="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                ${vendor.priceRange}
              </span>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Handle marker click
      marker.on('click', () => {
        if (onVendorSelect) {
          onVendorSelect(vendor);
        }
      });

      markersRef.current[vendor.id] = marker;
    });

    // Fit map to show all vendors
    if (vendors.length > 1) {
      const group = new L.FeatureGroup(Object.values(markersRef.current));
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    } else if (vendors.length === 1) {
      mapInstanceRef.current.setView([vendors[0].latitude, vendors[0].longitude], 15);
    }

  }, [vendors, selectedVendorId, onVendorSelect]);

  return (
    <div className={`relative ${className}`}>
      {/* Custom Address Search Bar */}
      {showAddressSearch && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center p-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  // Use Leaflet geocoding
                  if (geocoderRef.current) {
                    geocoderRef.current.geocode(searchQuery, (results: any[]) => {
                      if (results.length > 0) {
                        const result = results[0];
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setView([result.center.lat, result.center.lng], 15);
                          if (onAddressFound) {
                            onAddressFound(result.name, result.center.lat, result.center.lng);
                          }
                        }
                      }
                    });
                  }
                }
              }}
              className="w-64 px-2 py-1 border-none outline-none text-sm"
            />
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 vendor-map-container"
        style={{ height: mapHeight }}
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        {showUserLocation && (
          <button
            onClick={() => {
              if (navigator.geolocation && mapInstanceRef.current) {
                const geoOptions = {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 60000 // 1 minute cache for quick re-access
                };
                
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    console.log(`📍 Updated Philippines location: ${latitude}, ${longitude} (±${accuracy}m)`);
                    mapInstanceRef.current!.setView([latitude, longitude], 16);
                    
                    // Show accuracy notification
                    if (mapInstanceRef.current) {
                      L.popup()
                        .setLatLng([latitude, longitude])
                        .setContent(`
                          <div class="p-2 text-center">
                            <div class="text-blue-600 font-semibold">📍 High Accuracy Mode</div>
                            <p class="text-xs text-gray-600">±${Math.round(accuracy)}m accuracy</p>
                          </div>
                        `)
                        .openOn(mapInstanceRef.current);
                    }
                  },
                  (error) => {
                    console.error('High accuracy location failed:', error);
                    // Fallback to standard accuracy
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        mapInstanceRef.current!.setView([latitude, longitude], 15);
                      }
                    );
                  },
                  geoOptions
                );
              }
            }}
            className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors"
            title="Go to my location"
          >
            <Navigation className="w-5 h-5 text-gray-700" />
          </button>
        )}
        
        <button
          onClick={() => {
            if (mapInstanceRef.current && vendors.length > 0) {
              const group = new L.FeatureGroup(Object.values(markersRef.current));
              mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
            }
          }}
          className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors"
          title="Show all vendors"
        >
          <MapPin className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Vendor count badge */}
      {showVendorCount && vendors.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}
    </div>
  );
};
