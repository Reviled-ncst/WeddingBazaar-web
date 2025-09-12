import React from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Grid, 
  List 
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { ServiceFilters, FilterOptions, ViewMode } from '../types';
import type { ServiceCategory } from '../../../shared/types/comprehensive-booking.types';

interface ServiceFiltersProps {
  filters: ServiceFilters;
  onFiltersChange: (filters: Partial<ServiceFilters>) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterOptions: FilterOptions;
}

export const ServiceFiltersComponent: React.FC<ServiceFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  showFilters,
  onToggleFilters,
  viewMode,
  onViewModeChange,
  filterOptions
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search services, vendors, or locations..."
          value={filters.searchQuery}
          onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          onClick={onToggleFilters}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
            showFilters ? "bg-rose-50 border-rose-200 text-rose-700" : "border-gray-300 hover:bg-gray-50"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </button>

        <select
          value={filters.selectedCategory}
          onChange={(e) => onFiltersChange({ selectedCategory: e.target.value as ServiceCategory | 'all' })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {filterOptions.categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          aria-label="Sort services by"
        >
          <option value="relevance">Sort by Relevance</option>
          <option value="rating">Highest Rated</option>
          <option value="reviews">Most Reviews</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>

        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'grid' ? "bg-rose-100 text-rose-700" : "text-gray-500 hover:bg-gray-100"
            )}
            title="Grid view"
            aria-label="Switch to grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'list' ? "bg-rose-100 text-rose-700" : "text-gray-500 hover:bg-gray-100"
            )}
            title="List view"
            aria-label="Switch to list view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" id="location-label">
                Location
              </label>
              <select
                value={filters.selectedLocation}
                onChange={(e) => onFiltersChange({ selectedLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                aria-labelledby="location-label"
              >
                <option value="all">All Locations</option>
                {filterOptions.locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" id="price-label">
                Price Range
              </label>
              <select
                value={filters.selectedPriceRange}
                onChange={(e) => onFiltersChange({ selectedPriceRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                aria-labelledby="price-label"
              >
                <option value="all">All Prices</option>
                {filterOptions.priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" id="rating-label">
                Minimum Rating
              </label>
              <select
                value={filters.selectedRating}
                onChange={(e) => onFiltersChange({ selectedRating: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                aria-labelledby="rating-label"
              >
                <option value={0}>Any Rating</option>
                {filterOptions.ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}+ Stars</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
