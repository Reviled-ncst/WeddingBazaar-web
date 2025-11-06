/**
 * 📋 ServiceListView Component - Micro Frontend
 * 
 * Grid/List view with pagination and empty states
 * Extracted from VendorServices.tsx for better modularity
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, Package } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import type { Service } from '../services/vendorServicesAPI';

interface ServiceListViewProps {
  services: Service[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onToggleStatus: (serviceId: string, isActive: boolean) => void;
  onShare?: (service: Service) => void;
  highlightedServiceId?: string | null;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export const ServiceListView: React.FC<ServiceListViewProps> = ({
  services,
  loading,
  error,
  viewMode,
  onEdit,
  onDelete,
  onToggleStatus,
  onShare,
  highlightedServiceId,
  emptyMessage = 'No services found',
  emptyAction
}) => {
  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-16 h-16 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Loading your services...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center"
      >
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Services</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  // Empty State
  if (services.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-dashed border-pink-300 rounded-2xl p-12 text-center"
      >
        <Package className="w-20 h-20 text-pink-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {emptyAction 
            ? "Get started by adding your first service to showcase your offerings to potential clients."
            : "Try adjusting your filters or search terms to find what you're looking for."
          }
        </p>
        {emptyAction && (
          <button
            onClick={emptyAction.onClick}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-xl transition-all text-lg font-semibold"
          >
            {emptyAction.label}
          </button>
        )}
      </motion.div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onShare={onShare}
              highlighted={service.id === highlightedServiceId}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  // List View
  return (
    <motion.div
      layout
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {services.map((service) => (
          <motion.div
            key={service.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <ServiceCard
              service={service}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onShare={onShare}
              highlighted={service.id === highlightedServiceId}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
