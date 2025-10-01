import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Star, Phone, Mail, Globe } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Service {
  id: string;
  name: string;
  category: string;
  vendorId: string;
  vendorName: string;
  vendorImage: string;
  description: string;
  priceRange: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  features: string[];
  availability: boolean;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

interface ServiceLocationMapProps {
  services: Service[];
  userLocation?: { lat: number; lng: number } | null;
  onServiceSelect: (serviceId: string) => void;
  className?: string;
}

// Custom service marker icon
const createServiceIcon = (category: string) => {
  const color = getCategoryColor(category);
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: 'custom-service-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// User location marker icon
const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      </style>
    `,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const getServiceIconUrl = (category: string): string => {
  const iconMap: Record<string, string> = {
    photography: '📸',
    videography: '🎥',
    catering: '🍽️',
    venue: '🏛️',
    flowers: '💐',
    music: '🎵',
    decoration: '🎨',
    planning: '📋',
    transportation: '🚗',
    makeup_hair: '💄',
    cakes: '🎂',
    invitations: '💌',
    jewelry: '💍',
    attire: '👗'
  };
  
  return iconMap[category.toLowerCase()] || '🎯';
};

const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    photography: '#e11d48', // rose-600
    videography: '#dc2626', // red-600
    catering: '#ea580c', // orange-600
    venue: '#d97706', // amber-600
    flowers: '#65a30d', // lime-600
    music: '#16a34a', // green-600
    decoration: '#059669', // emerald-600
    planning: '#0891b2', // cyan-600
    transportation: '#0284c7', // sky-600
    makeup_hair: '#2563eb', // blue-600
    cakes: '#7c3aed', // violet-600
    invitations: '#9333ea', // purple-600
    jewelry: '#c2410c', // orange-700
    attire: '#be185d', // pink-700
    default: '#6b7280' // gray-500
  };
  
  return colorMap[category.toLowerCase()] || colorMap.default;
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`inline h-3 w-3 ${
        i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
      }`}
    />
  ));
};

export const ServiceLocationMap: React.FC<ServiceLocationMapProps> = ({
  services,
  userLocation,
  onServiceSelect,
  className = "h-96 w-full rounded-lg"
}) => {
  // Default center - Philippines center coordinates
  const defaultCenter: [number, number] = [12.8797, 121.7740];
  
  // Calculate map center based on user location or services
  const getMapCenter = (): [number, number] => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    
    // If no user location, center on services with coordinates
    const servicesWithCoords = services.filter(s => s.coordinates);
    if (servicesWithCoords.length > 0) {
      const avgLat = servicesWithCoords.reduce((sum, s) => sum + s.coordinates!.lat, 0) / servicesWithCoords.length;
      const avgLng = servicesWithCoords.reduce((sum, s) => sum + s.coordinates!.lng, 0) / servicesWithCoords.length;
      return [avgLat, avgLng];
    }
    
    return defaultCenter;
  };

  const mapCenter = getMapCenter();
  const zoom = userLocation ? 12 : 10;

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={createUserIcon()}
          >
            <Popup>
              <div className="p-2 text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <p className="font-medium text-gray-900">Your Location</p>
                <p className="text-sm text-gray-600">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Service Markers */}
        {services
          .filter(service => service.coordinates)
          .map((service) => (
            <Marker
              key={service.id}
              position={[service.coordinates!.lat, service.coordinates!.lng]}
              icon={createServiceIcon(service.category)}
            >
              <Popup>
                <div className="p-3 max-w-xs">
                  {/* Service Image */}
                  <div className="mb-3">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-24 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Service Details */}
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {service.name}
                      </h3>
                      <p className="text-xs text-gray-600">{service.vendorName}</p>
                    </div>
                    
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {service.description}
                    </p>
                    
                    {/* Location */}
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 text-rose-500 mr-1 flex-shrink-0" />
                      <span className="truncate">{service.location}</span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      {renderStars(service.rating)}
                      <span className="text-xs font-medium text-gray-900">
                        {service.rating}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({service.reviewCount})
                      </span>
                    </div>
                    
                    {/* Price Range */}
                    <div className="text-sm font-semibold text-rose-600">
                      {service.priceRange}
                    </div>
                    
                    {/* Contact Info */}
                    <div className="flex items-center space-x-2 text-xs">
                      {service.contactInfo.phone && (
                        <a
                          href={`tel:${service.contactInfo.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Call"
                        >
                          <Phone className="h-3 w-3" />
                        </a>
                      )}
                      {service.contactInfo.email && (
                        <a
                          href={`mailto:${service.contactInfo.email}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Email"
                        >
                          <Mail className="h-3 w-3" />
                        </a>
                      )}
                      {service.contactInfo.website && (
                        <a
                          href={service.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="Website"
                        >
                          <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => onServiceSelect(service.id)}
                      className="w-full mt-2 px-3 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors text-xs font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default ServiceLocationMap;
