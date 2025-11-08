/**
 * 🎴 ServiceCard Component - Micro Frontend
 * 
 * Individual service card display with actions
 * Extracted from VendorServices.tsx for better modularity
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Share2,
  Crown,
  CheckCircle2,
  Package,
  Gift,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Service } from '../services/vendorServicesAPI';
import { getDisplayPrice, getDisplayImage } from '../utils/serviceDataNormalizer';
import { useNotification } from '../../../../../shared/hooks/useNotification';
import { NotificationModal } from '../../../../../shared/components/modals';

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
  const [showItemization, setShowItemization] = React.useState(false);
  
  // Notification system
  const { notification, showSuccess, hideNotification } = useNotification();
  
  // Check if service has itemization data
  const hasItemization = (service as any).packages?.length > 0 || 
                         (service as any).addons?.length > 0 || 
                         (service as any).pricing_rules?.length > 0;

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

  const handleShare = async () => {
    if (onShare) {
      onShare(service);
    } else {
      // Default share behavior
      const shareUrl = window.location.origin + `/services/${service.id}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        showSuccess('Service link copied to clipboard!', 'Link Copied');
      } catch {
        showSuccess(`Link: ${shareUrl}`, 'Service Link');
      }
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
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-3 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onEdit(service)}
                className="bg-white text-gray-800 p-3 rounded-full hover:bg-pink-50 hover:text-pink-600 hover:scale-110 transition-all shadow-lg"
                title="Edit Service"
              >
                <Edit className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={cn(
                  'bg-white p-3 rounded-full transition-all shadow-lg hover:scale-110',
                  isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50',
                  isActive ? 'text-gray-800 hover:text-green-600' : 'text-gray-800 hover:text-blue-600'
                )}
                title={isActive ? 'Deactivate Service' : 'Activate Service'}
              >
                {isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              <button
                onClick={handleShare}
                className="bg-white text-gray-800 p-3 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all shadow-lg"
                title="Share Service"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => onDelete(service.id)}
                className="bg-white text-gray-800 p-3 rounded-full hover:bg-red-50 hover:text-red-600 hover:scale-110 transition-all shadow-lg"
                title="Delete Service"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Service Info */}
      <div className="p-4 relative z-10">
        {/* Title and Category */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 break-words">
            {service.name || service.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <span className="px-2 py-1 bg-pink-100 text-pink-600 rounded-lg font-medium text-xs whitespace-nowrap">
              {service.category}
            </span>
            {service.location && (
              <div className="flex items-center gap-1 max-w-[200px]">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs truncate">{service.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">
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
        
        {/* ✅ NEW: Itemization Display Section */}
        {hasItemization && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowItemization(!showItemization)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-pink-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>View Packages & Details</span>
              </div>
              {showItemization ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            <AnimatePresence>
              {showItemization && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-3 overflow-hidden"
                >
                  {/* Packages */}
                  {(service as any).packages?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Packages ({(service as any).packages.length})
                      </h4>
                      <div className="space-y-2">
                        {(service as any).packages.map((pkg: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 text-xs"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="font-bold text-gray-800">{pkg.name}</span>
                              <span className="font-bold text-pink-600">
                                ₱{pkg.price.toLocaleString()}
                              </span>
                            </div>
                            {pkg.description && (
                              <p className="text-gray-600 text-xs mb-2">{pkg.description}</p>
                            )}
                            {(service as any).package_items?.[pkg.id]?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {(service as any).package_items[pkg.id].slice(0, 3).map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>{item.quantity}× {item.item_name}</span>
                                  </div>
                                ))}
                                {(service as any).package_items[pkg.id].length > 3 && (
                                  <p className="text-xs text-gray-500 italic">
                                    +{(service as any).package_items[pkg.id].length - 3} more items
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add-ons */}
                  {(service as any).addons?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        Add-ons ({(service as any).addons.length})
                      </h4>
                      <div className="space-y-1">
                        {(service as any).addons.slice(0, 3).map((addon: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-blue-50 rounded px-2 py-1 text-xs"
                          >
                            <span className="text-gray-700">{addon.name}</span>
                            <span className="font-semibold text-blue-600">
                              +₱{addon.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {(service as any).addons.length > 3 && (
                          <p className="text-xs text-gray-500 italic px-2">
                            +{(service as any).addons.length - 3} more add-ons
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        confirmText={notification.confirmText}
        showCancel={notification.showCancel}
        onConfirm={notification.onConfirm}
      />
    </motion.div>
  );
};
