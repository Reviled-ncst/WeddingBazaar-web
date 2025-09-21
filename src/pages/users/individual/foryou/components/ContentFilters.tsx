/**
 * Content Filters Component
 * Advanced filtering interface for For You content
 */

import React from 'react';
import { X, Filter } from 'lucide-react';
import { cn } from '../../../../../utils/cn';

interface ContentFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
  className?: string;
}

export const ContentFilters: React.FC<ContentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  className
}) => {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <div className="space-y-2">
            {['inspiration', 'tip', 'vendor-spotlight', 'trend', 'planning-advice', 'real-wedding'].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700 capitalize">{type.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="space-y-2">
            {['Venue', 'Photography', 'Catering', 'Music', 'Flowers', 'Attire'].map((category) => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Relevance Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Relevance
          </label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={() => onFiltersChange({})}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
