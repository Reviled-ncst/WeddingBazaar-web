/**
 * 🔍 ServiceFilters Component - Micro Frontend
 * 
 * Search, filter, and sort controls for services
 * Extracted from VendorServices.tsx for better modularity
 */

import React from 'react';
import { Search, Grid, List, RefreshCw, X } from 'lucide-react';
import { cn } from '../../../../../utils/cn';

// Service categories (matching AddServiceForm)
const SERVICE_CATEGORIES = [
  { display: 'Photographer & Videographer', value: 'Photography' },
  { display: 'Wedding Planner', value: 'Planning' },
  { display: 'Florist', value: 'Florist' },
  { display: 'Hair & Makeup Artists', value: 'Beauty' },
  { display: 'Caterer', value: 'Catering' },
  { display: 'DJ/Band', value: 'Music' },
  { display: 'Officiant', value: 'Officiant' },
  { display: 'Venue Coordinator', value: 'Venue' },
  { display: 'Event Rentals', value: 'Rentals' },
  { display: 'Cake Designer', value: 'Cake' },
  { display: 'Dress Designer/Tailor', value: 'Fashion' },
  { display: 'Security & Guest Management', value: 'Security' },
  { display: 'Sounds & Lights', value: 'AV_Equipment' },
  { display: 'Stationery Designer', value: 'Stationery' },
  { display: 'Transportation Services', value: 'Transport' }
];

interface ServiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterStatus: 'all' | 'active' | 'inactive';
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  resultCount?: number;
}

export const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing = false,
  resultCount
}) => {
  const hasActiveFilters = searchTerm || filterCategory || filterStatus !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('');
    onStatusChange('all');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services by name or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full lg:w-64">
          <select
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all appearance-none bg-white cursor-pointer"
            aria-label="Filter by category"
            title="Filter by category"
          >
            <option value="">All Categories</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.display}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all appearance-none bg-white cursor-pointer"
            aria-label="Filter by status"
            title="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-3 rounded-xl border-2 transition-all',
              viewMode === 'grid'
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
            )}
            title="Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-3 rounded-xl border-2 transition-all',
              viewMode === 'list'
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
            )}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={cn(
                'p-3 rounded-xl border-2 bg-white text-gray-600 border-gray-200 hover:border-pink-300 transition-all',
                isRefreshing && 'opacity-50 cursor-not-allowed'
              )}
              title="Refresh Services"
            >
              <RefreshCw className={cn('w-5 h-5', isRefreshing && 'animate-spin')} />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {searchTerm && (
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium">
                Search: "{searchTerm}"
              </span>
            )}
            
            {filterCategory && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                Category: {SERVICE_CATEGORIES.find(c => c.value === filterCategory)?.display}
              </span>
            )}
            
            {filterStatus !== 'all' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              </span>
            )}

            {resultCount !== undefined && (
              <span className="text-sm text-gray-600 ml-2">
                ({resultCount} {resultCount === 1 ? 'result' : 'results'})
              </span>
            )}
          </div>

          <button
            onClick={clearFilters}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
