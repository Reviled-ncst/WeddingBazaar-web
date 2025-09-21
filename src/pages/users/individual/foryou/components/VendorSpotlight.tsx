/**
 * Vendor Spotlight Component
 */

import React from 'react';
import { Star } from 'lucide-react';

interface VendorSpotlightProps {
  className?: string;
}

export const VendorSpotlight: React.FC<VendorSpotlightProps> = ({ className }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Star className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900">Vendor Spotlight</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg">
            <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
            <h3 className="font-semibold text-gray-900">Featured Vendor {i + 1}</h3>
            <p className="text-sm text-gray-600">Excellent service provider</p>
          </div>
        ))}
      </div>
    </div>
  );
};
