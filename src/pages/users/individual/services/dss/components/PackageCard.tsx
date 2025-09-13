import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Award,
  Shield,
  Package
} from 'lucide-react';
import { cn } from '../../../../../../utils/cn';
import type { PackageRecommendation, CurrencyConfig, LocationData } from '../types';
import { CurrencyService } from '../services';

interface PackageCardProps {
  packageData: PackageRecommendation;
  currency?: CurrencyConfig;
  locationData?: LocationData | null;
  onSelect: (packageId: string) => void;
  onCustomize: (packageId: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  packageData,
  currency,
  locationData,
  onSelect,
  onCustomize
}) => {
  // Use location-based currency or fallback
  const activeCurrency = locationData?.currency || currency || { 
    code: 'USD', 
    symbol: '$', 
    name: 'US Dollar', 
    rate: 1.0 
  };

  const formatCurrency = (amount: number): string => {
    return CurrencyService.formatCurrency(amount, activeCurrency);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">{packageData.name}</h3>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              packageData.category === 'essential' ? "bg-blue-100 text-blue-700" :
              packageData.category === 'standard' ? "bg-green-100 text-green-700" :
              packageData.category === 'premium' ? "bg-purple-100 text-purple-700" :
              "bg-yellow-100 text-yellow-700"
            )}>
              {packageData.category}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">{packageData.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{packageData.suitability}%</div>
          <div className="text-xs text-gray-500">Suitability</div>
        </div>
      </div>

      {/* Package Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(packageData.totalCost)}
          </div>
          <div className="text-xs text-gray-500">Total Cost</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(packageData.savings)}
          </div>
          <div className="text-xs text-gray-500">You Save</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{packageData.services.length}</div>
          <div className="text-xs text-gray-500">Services</div>
        </div>
      </div>

      {/* Package Features */}
      <div className="space-y-2 mb-4">
        {packageData.reasons.map((reason: string, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
            {reason}
          </div>
        ))}
      </div>

      {/* Package Details */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {packageData.timeline}
        </div>
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          {packageData.riskLevel} risk
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => onSelect(packageData.id)}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <Award className="h-4 w-4" />
          Select Package
        </button>
        <button 
          onClick={() => onCustomize(packageData.id)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Customize
        </button>
      </div>
    </motion.div>
  );
};
