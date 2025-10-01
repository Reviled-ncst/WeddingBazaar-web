import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  DollarSign, 
  Users, 
  Calendar,
  MessageCircle,
  Clock,
  Sparkles,
  MapPin,
  Navigation as NavigationIcon,
  X
} from 'lucide-react';

interface LocationAwareNavigationProps {
  onMessengerOpen: () => void;
}

export const LocationAwareNavigation: React.FC<LocationAwareNavigationProps> = ({ onMessengerOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Phase 4: Location-aware state
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'detected' | 'denied' | 'none'>('none');

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/individual/dashboard', 
      icon: Heart,
      description: 'Your wedding overview'
    },
    { 
      name: 'Services', 
      href: '/individual/services', 
      icon: Search,
      description: 'Browse wedding vendors',
      locationAware: true // This link will include location parameters
    },
    { 
      name: 'Timeline', 
      href: '/individual/timeline', 
      icon: Clock,
      description: 'Wedding planning timeline'
    },
    { 
      name: 'For You', 
      href: '/individual/foryou', 
      icon: Sparkles,
      description: 'Personalized content'
    },
    { 
      name: 'Budget', 
      href: '/individual/budget', 
      icon: DollarSign,
      description: 'Track expenses'
    },
    { 
      name: 'Guests', 
      href: '/individual/guests', 
      icon: Users,
      description: 'Manage RSVPs'
    },
    { 
      name: 'Bookings', 
      href: '/individual/bookings', 
      icon: Calendar,
      description: 'View appointments'
    },
  ];

  // Phase 4: Get current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLocationStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLocationStatus('detected');
          console.log('✅ Header: User location detected:', location);
        },
        (error) => {
          setLocationStatus('denied');
          console.log('❌ Header: Location access denied:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationStatus('denied');
      console.log('❌ Header: Geolocation not supported');
    }
  }, []);

  // Auto-detect location on component mount
  useEffect(() => {
    if (locationStatus === 'none') {
      getCurrentLocation();
    }
  }, [getCurrentLocation, locationStatus]);

  const isActivePage = (href: string) => {
    return location.pathname === href;
  };

  // Phase 4: Create location-aware URL
  const createLocationAwareUrl = (href: string, locationAware: boolean = false) => {
    if (!locationAware || !userLocation) return href;
    
    const url = new URL(href, window.location.origin);
    url.searchParams.set('lat', userLocation.lat.toString());
    url.searchParams.set('lng', userLocation.lng.toString());
    url.searchParams.set('radius', '25'); // Default 25km radius
    
    return url.pathname + url.search;
  };

  const resetLocation = () => {
    setUserLocation(null);
    setLocationStatus('none');
    setShowLocationMenu(false);
  };

  return (
    <>
      <nav className="hidden lg:flex items-center space-x-6">
        {navigation.map((item) => {
          const isActive = isActivePage(item.href);
          const locationAwareHref = createLocationAwareUrl(item.href, item.locationAware);
          
          return (
            <Link
              key={item.name}
              to={locationAwareHref}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${isActive 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
              title={item.description + (item.locationAware && userLocation ? ' (location-aware)' : '')}
            >
              <item.icon className="h-4 w-4" />
              <span>
                {item.name}
                {item.locationAware && userLocation && (
                  <span className="text-xs text-rose-500 ml-1">●</span>
                )}
              </span>
            </Link>
          );
        })}
        
        {/* Messages Button */}
        <Link
          to="/individual/messages"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          title="View messages"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Messages</span>
        </Link>

        {/* Phase 4: Location Controls */}
        <div className="relative">
          <button
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${userLocation 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : locationStatus === 'detecting'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            title={
              userLocation 
                ? 'Location detected - Services will show nearby results'
                : locationStatus === 'detecting'
                ? 'Detecting your location...'
                : locationStatus === 'denied'
                ? 'Location access denied - Click to retry'
                : 'Click to enable location-aware services'
            }
          >
            {locationStatus === 'detecting' ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="hidden xl:inline">
              {userLocation 
                ? 'Near You' 
                : locationStatus === 'detecting'
                ? 'Detecting...'
                : locationStatus === 'denied'
                ? 'Location Denied'
                : 'Set Location'
              }
            </span>
          </button>

          {/* Location Menu Dropdown */}
          {showLocationMenu && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Location Services</h3>
                  <button
                    onClick={() => setShowLocationMenu(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {userLocation ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <MapPin className="h-4 w-4" />
                      <span>Location detected</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your location is being used to show nearby wedding services and vendors.
                    </p>
                    <div className="text-xs text-gray-500">
                      Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          navigate('/individual/services?nearby=true');
                          setShowLocationMenu(false);
                        }}
                        className="flex-1 px-3 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors text-sm font-medium"
                      >
                        Find Services Near Me
                      </button>
                      <button
                        onClick={resetLocation}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ) : locationStatus === 'denied' ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-red-700 bg-red-50 p-2 rounded">
                      <MapPin className="h-4 w-4" />
                      <span>Location access denied</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Enable location access to see nearby wedding services and get personalized recommendations.
                    </p>
                    <button
                      onClick={getCurrentLocation}
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      <NavigationIcon className="h-4 w-4 inline mr-2" />
                      Try Again
                    </button>
                  </div>
                ) : locationStatus === 'detecting' ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Detecting your location...</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Please allow location access to enable location-aware services.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Enable location services to find wedding vendors near you and get personalized recommendations.
                    </p>
                    <button
                      onClick={getCurrentLocation}
                      className="w-full px-3 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors text-sm font-medium"
                    >
                      <NavigationIcon className="h-4 w-4 inline mr-2" />
                      Enable Location Services
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default LocationAwareNavigation;
