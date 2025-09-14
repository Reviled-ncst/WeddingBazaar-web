import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EnhancedEventLocationMap.css';

// Import our geolocation utilities  
import { isWithinPhilippines } from '../../../../../utils/geolocation';

// Simple reverse geocoding function for this component
const reverseGeocodePhilippines = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=ph&accept-language=en`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.log('Reverse geocoding failed:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

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

// Configure Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EventLocation {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  venue?: string;
  eventType?: string;
}

interface EnhancedEventLocationMapProps {
  location: EventLocation;
  onClose: () => void;
  showModal?: boolean;
}

export const EnhancedEventLocationMap: React.FC<EnhancedEventLocationMapProps> = ({
  location,
  onClose,
  showModal = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState<string>(location.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);
  const [currentCoords, setCurrentCoords] = useState({
    lat: location.coordinates.lat,
    lng: location.coordinates.lng
  });

  // Custom event location icon
  const eventLocationIcon = L.divIcon({
    html: `
      <div class="event-location-marker">
        <div class="event-marker-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#e91e63"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    className: 'event-location-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  // User location icon
  const userLocationIcon = L.divIcon({
    html: `
      <div class="user-location-marker">
        <div class="user-marker-inner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#2196f3"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    className: 'user-location-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  // Helper function to create popup content
  const createPopupContent = (coords: [number, number], addressText: string) => {
    return `
      <div class="ph-event-popup">
        <div class="popup-header">
          <h3>${location.name}</h3>
          ${location.eventType ? `<span class="event-type">${location.eventType}</span>` : ''}
        </div>
        <div class="popup-content">
          ${location.venue ? `<p><strong>Venue:</strong> ${location.venue}</p>` : ''}
          <p><strong>Location:</strong> ${addressText}</p>
          <div class="popup-coordinates">
            <small>Coordinates: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}</small>
          </div>
          <div class="popup-actions">
            <a href="https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}" 
               target="_blank" 
               class="maps-link">
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    `;
  };

  // Search functionality
  const handleLocationSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPhilippinesLocations(query);
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: any) => {
    const newCoords = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    
    setCurrentCoords(newCoords);
    setAddress(result.display_name);
    setShowSearchResults(false);
    setSearchQuery(result.display_name);

    // Update map center and marker
    if (mapInstance.current && markerRef.current) {
      const newLatLng: [number, number] = [newCoords.lat, newCoords.lng];
      mapInstance.current.setView(newLatLng, 15);
      markerRef.current.setLatLng(newLatLng);
      markerRef.current.setPopupContent(createPopupContent(newLatLng, result.display_name));
    }
  };

  // Map initialization effect
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Validate coordinates or use Manila as fallback
    const eventCoords = isWithinPhilippines(currentCoords.lat, currentCoords.lng) 
      ? [currentCoords.lat, currentCoords.lng] as [number, number]
      : [14.5995, 120.9842] as [number, number]; // Manila fallback

    // Initialize map with better settings
    const map = L.map(mapRef.current, {
      center: eventCoords,
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      attributionControl: true
    });

    mapInstance.current = map;

    // Add OpenStreetMap tiles with Philippines attribution
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Philippines Wedding Event Location',
      maxZoom: 19,
      minZoom: 8
    });
    
    tileLayer.addTo(map);

    // Wait for map to fully load before adding markers
    map.whenReady(() => {
      // Add event location marker
      const marker = L.marker(eventCoords, { icon: eventLocationIcon });
      marker.addTo(map);
      markerRef.current = marker;
      
      // Create and bind popup
      const popupContent = createPopupContent(eventCoords, address || 'Getting address...');
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      }).openPopup();

      // Get user's current location for distance calculation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
            
            // Only add user marker if within Philippines bounds
            if (isWithinPhilippines(userCoords[0], userCoords[1])) {
              const userMarker = L.marker(userCoords, { icon: userLocationIcon });
              userMarker.addTo(map);
              
              userMarker.bindPopup(`
                <div class="ph-user-popup">
                  <h4>Your Location</h4>
                  <p>Distance to event: ${calculateDistance(userCoords, eventCoords)} km</p>
                  <p>Estimated travel time: ${estimateTravelTime(userCoords, eventCoords)}</p>
                </div>
              `);

              // Add route line if reasonable distance (less than 200km)
              const distance = parseFloat(calculateDistance(userCoords, eventCoords));
              if (distance < 200) {
                const routeLine = L.polyline([userCoords, eventCoords], {
                  color: '#e91e63',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '10, 5'
                });
                routeLine.addTo(map);

                // Fit map to show both markers
                const group = new L.FeatureGroup([marker, userMarker, routeLine]);
                map.fitBounds(group.getBounds().pad(0.1));
              }
            }
          },
          (error) => {
            console.log('Geolocation not available or permission denied:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      }

      setIsLoading(false);
    });

    // Reverse geocode to get full address
    if (!address) {
      reverseGeocodePhilippines(eventCoords[0], eventCoords[1])
        .then((fullAddress: string) => {
          if (fullAddress) {
            setAddress(fullAddress);
            // Update marker popup with full address
            if (markerRef.current) {
              const updatedPopupContent = createPopupContent(eventCoords, fullAddress);
              markerRef.current.setPopupContent(updatedPopupContent);
            }
          }
        })
        .catch((error: any) => {
          console.log('Reverse geocoding failed:', error);
          setAddress(`${eventCoords[0].toFixed(4)}, ${eventCoords[1].toFixed(4)}`);
        });
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [location, address, currentCoords]);

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (coords1: [number, number], coords2: [number, number]): string => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((coords2[0] - coords1[0]) * Math.PI) / 180;
    const dLon = ((coords2[1] - coords1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coords1[0] * Math.PI) / 180) *
        Math.cos((coords2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  // Helper function to estimate travel time
  const estimateTravelTime = (coords1: [number, number], coords2: [number, number]): string => {
    const distance = parseFloat(calculateDistance(coords1, coords2));
    
    if (distance < 5) {
      return '15-30 minutes';
    } else if (distance < 20) {
      return '30-60 minutes';
    } else if (distance < 50) {
      return '1-2 hours';
    } else if (distance < 100) {
      return '2-3 hours';
    } else {
      return '3+ hours';
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 via-rose-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Event Location
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {location.eventType ? `${location.eventType} • ` : ''}{location.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              title="Close map"
              aria-label="Close event location map"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Search Interface */}
          <div className="mb-6 relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleLocationSearch(e.target.value);
                }}
                placeholder="Search for locations in Philippines..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchResultSelect(result)}
                    className="w-full text-left px-4 py-2 hover:bg-pink-50 transition-colors focus:outline-none focus:bg-pink-50"
                  >
                    <div className="font-medium text-gray-900">{result.display_name}</div>
                    <div className="text-sm text-gray-500">{result.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Info */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01" />
              </svg>
              {location.venue || location.name}
            </h4>
            <p className="text-gray-600 text-sm mb-3">
              {address || 'Loading address...'}
            </p>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>📍 Coordinates: {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}</span>
            </div>
          </div>
          
          {/* Enhanced Map Container */}
          <div className="h-96 rounded-xl overflow-hidden shadow-lg relative bg-gray-100">
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-rose-50 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading Philippines map...</p>
                </div>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full ph-event-map" />
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Open in Google Maps
            </a>
            
            <a
              href={`https://waze.com/ul?ll=${currentCoords.lat}%2C${currentCoords.lng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
              Navigate with Waze
            </a>

            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const coords = [position.coords.latitude, position.coords.longitude] as [number, number];
                      if (mapInstance.current) {
                        mapInstance.current.setView(coords, 15);
                      }
                    },
                    (error) => console.log('Location access denied:', error)
                  );
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find My Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEventLocationMap;
