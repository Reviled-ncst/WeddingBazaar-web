import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Heart,
  MessageCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../../../../utils/cn';
import type { Service } from '../../../../../../modules/services/types';
import type { DSSRecommendation, CurrencyConfig, LocationData } from '../types';
import { VendorAPIService, CurrencyService } from '../services';

interface ServiceCardProps {
  recommendation: DSSRecommendation;
  service: Service;
  currency?: CurrencyConfig;
  locationData?: LocationData | null;
  onViewDetails: (serviceId: string) => void;
  onSave?: (serviceId: string) => void;
  onContact?: (serviceId: string) => void;
  index?: number;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  recommendation,
  service,
  currency,
  locationData,
  onViewDetails,
  onSave,
  onContact,
  index = 0
}) => {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isContacting, setIsContacting] = React.useState(false);

  // Use location-based currency or fallback
  const activeCurrency = locationData?.currency || currency || { 
    code: 'USD', 
    symbol: '$', 
    name: 'US Dollar', 
    rate: 1.0 
  };
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      const success = await VendorAPIService.saveRecommendation(service.id);
      if (success) {
        setIsSaved(true);
        onSave(service.id);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
    setIsSaving(false);
  };

  const handleContact = async () => {
    if (!onContact) return;
    setIsContacting(true);
    try {
      const success = await VendorAPIService.contactVendor(
        service.id, 
        'Hi, I found your service through our AI Wedding Assistant and I\'m interested in learning more about your offerings for my wedding.'
      );
      if (success) {
        onContact(service.id);
      }
    } catch (error) {
      console.error('Contact failed:', error);
    }
    setIsContacting(false);
  };

  const formatCurrency = (amount: number): string => {
    return CurrencyService.formatCurrency(amount, activeCurrency);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-200 hover:-translate-y-1"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Service Header */}
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={service.image}
              alt={service.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover ring-2 ring-gray-100"
              loading="lazy"
            />
            <div className={cn(
              "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm",
              recommendation.priority === 'high' ? "bg-green-500" :
              recommendation.priority === 'medium' ? "bg-yellow-500" : "bg-gray-500"
            )}>
              {recommendation.score}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {service.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">{service.category}</p>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0",
                recommendation.priority === 'high' ? "bg-green-100 text-green-700" :
                recommendation.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"
              )}>
                {recommendation.priority}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                <span className="text-xs sm:text-sm font-medium">{service.rating}</span>
                <span className="text-xs text-gray-500">({service.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span className="text-xs sm:text-sm font-medium">
                  {formatCurrency(recommendation.estimatedCost)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                <span className="text-xs sm:text-sm">Value: {recommendation.valueRating}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reasons */}
        <div className="space-y-1">
          {recommendation.reasons.slice(0, 3).map((reason, index) => (
            <div key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
              <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>

        {/* Risk Badge */}
        {recommendation.riskLevel !== 'low' && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              recommendation.riskLevel === 'high' ? "bg-red-100 text-red-700" :
              "bg-orange-100 text-orange-700"
            )}>
              {recommendation.riskLevel} risk
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onViewDetails(service.id)}
            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            View Details
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          
          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={cn(
                "px-3 py-2 border rounded-lg transition-colors text-sm",
                isSaved ? "bg-green-50 border-green-300 text-green-700" :
                isSaving ? "bg-gray-50 border-gray-300 text-gray-400" :
                "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
              title={isSaved ? "Saved" : "Save for later"}
            >
              <Heart className={cn("h-3 w-3 sm:h-4 sm:w-4", isSaved && "fill-current")} />
            </button>
          )}

          {onContact && (
            <button
              onClick={handleContact}
              disabled={isContacting}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              title="Contact vendor"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
