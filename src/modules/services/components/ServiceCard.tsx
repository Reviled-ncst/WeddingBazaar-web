import React from 'react';
import { 
  Heart, 
  MapPin, 
  Star, 
  MessageCircle 
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { Service, ViewMode } from '../types';

interface ServiceCardProps {
  service: Service;
  viewMode: ViewMode;
  isLiked: boolean;
  onLike: (serviceId: string) => void;
  onContact: (service: Service) => void;
  onViewDetails: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  viewMode,
  isLiked,
  onLike,
  onContact,
  onViewDetails
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow",
        viewMode === 'list' ? "flex" : ""
      )}
    >
      {/* Image Section */}
      <div className={cn(
        "relative",
        viewMode === 'list' ? "w-64 flex-shrink-0" : "h-48"
      )}>
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => onLike(service.id)}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-colors",
            isLiked
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-600 hover:bg-white"
          )}
          title={isLiked ? "Remove from favorites" : "Add to favorites"}
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn(
            "h-4 w-4",
            isLiked ? "fill-current" : ""
          )} />
        </button>
        {!service.availability && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Not Available</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
            <p className="text-sm text-rose-600 font-medium">{service.category}</p>
          </div>
          <span className="text-lg font-bold text-gray-900">{service.priceRange}</span>
        </div>

        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(service.rating)}
            <span className="text-sm text-gray-600 ml-1">
              {service.rating} ({service.reviewCount})
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{service.location}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {service.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
          {service.features.length > 3 && (
            <span className="text-xs text-gray-500">
              +{service.features.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {service.vendorImage && (
              <img
                src={service.vendorImage}
                alt={service.vendorName}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-gray-600">{service.vendorName}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onContact(service)}
              className="px-3 py-1.5 border border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors text-sm flex items-center space-x-1"
            >
              <MessageCircle className="h-3 w-3" />
              <span>Contact</span>
            </button>
            <button 
              onClick={() => onViewDetails(service)}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
