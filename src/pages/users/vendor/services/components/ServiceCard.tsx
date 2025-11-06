/**
 * 🎴 ServiceCard Component - Micro Frontend
 * 
 * Individual service card display with actions
 * Extracted from VendorServices.tsx for better modularity
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Share2,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Service } from '../services/vendorServicesAPI';
import { getDisplayPrice, getDisplayImage } from '../utils/serviceDataNormalizer';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onToggleStatus: (serviceId: string, isActive: boolean) => void;
  onShare?: (service: Service) => void;
  highlighted?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  onToggleStatus,
  onShare,
  highlighted = false
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);

  const displayPrice = getDisplayPrice(service);
  const displayImage = getDisplayImage(service);
  const isActive = service.isActive ?? service.is_active ?? true;

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await onToggleStatus(service.id, !isActive);
    } finally {
      setIsToggling(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(service);
    } else {
      // Default share behavior
      const shareUrl = window.location.origin + `/services/${service.id}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Service link copied to clipboard!');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300',
        highlighted ? 'border-pink-500 ring-4 ring-pink-200' : 'border-transparent hover:border-pink-200',
        !isActive && 'opacity-60 grayscale'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Service Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
        <img
          src={displayImage}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400';
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {service.featured && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold shadow-lg"
            >
              <Crown className="w-3 h-3" />
              Featured
            </motion.div>
          )}
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold shadow-lg',
              isActive
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white'
            )}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Active
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                Inactive
              </>
            )}
          </motion.div>
        </div>

        {/* Quick Actions Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showActions ? 1 : 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-2"
        >
          <button
            onClick={() => onEdit(service)}
            className="bg-white text-gray-800 p-3 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-all shadow-lg"
            title="Edit Service"
          >
            <Edit className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={cn(
              'bg-white p-3 rounded-full transition-all shadow-lg',
              isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50',
              isActive ? 'text-gray-800 hover:text-green-600' : 'text-gray-800 hover:text-blue-600'
            )}
            title={isActive ? 'Deactivate Service' : 'Activate Service'}
          >
            {isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <button
            onClick={handleShare}
            className="bg-white text-gray-800 p-3 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg"
            title="Share Service"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onDelete(service.id)}
            className="bg-white text-gray-800 p-3 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-lg"
            title="Delete Service"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Service Info */}
      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
            {service.name || service.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-pink-100 text-pink-600 rounded-lg font-medium">
              {service.category}
            </span>
            {service.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{service.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {service.description}
          </p>
        )}

        {/* Price and Rating */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-lg font-bold text-pink-600">
            {displayPrice}
          </div>
          
          {(service.rating || 0) > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{service.rating?.toFixed(1)}</span>
              <span className="text-xs text-gray-500">
                ({service.review_count || service.reviewCount || 0})
              </span>
            </div>
          )}
        </div>

        {/* DSS Fields (if available) */}
        {(service.service_tier || service.years_in_business) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2 text-xs">
            {service.service_tier && (
              <span className={cn(
                'px-2 py-1 rounded font-medium',
                service.service_tier === 'premium' && 'bg-purple-100 text-purple-700',
                service.service_tier === 'standard' && 'bg-blue-100 text-blue-700',
                service.service_tier === 'basic' && 'bg-gray-100 text-gray-700'
              )}>
                {service.service_tier.charAt(0).toUpperCase() + service.service_tier.slice(1)}
              </span>
            )}
            {service.years_in_business && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                {service.years_in_business}+ years
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
