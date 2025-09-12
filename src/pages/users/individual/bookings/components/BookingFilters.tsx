import React from 'react';
import { Search, Filter, Download, Grid, List } from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { FilterStatus } from '../types/booking.types';

interface BookingFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  viewMode?: 'grid' | 'list';
  setViewMode?: (mode: 'grid' | 'list') => void;
  onExport?: () => void;
  totalResults?: number;
}

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  viewMode = 'grid',
  setViewMode,
  onExport,
  totalResults = 0
}) => {
  const filterOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'inquiry', label: 'Inquiry' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'downpayment_paid', label: 'Downpayment Paid' },
    { value: 'completed', label: 'Completed' },
    { value: 'paid_in_full', label: 'Fully Paid' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          {setViewMode && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 text-sm",
                  viewMode === 'grid' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 text-sm",
                  viewMode === 'list' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          )}

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              title="Filter bookings by status"
              className="appearance-none pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white min-w-[160px]"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          {onExport && (
            <button
              onClick={onExport}
              className={cn(
                "flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl",
                "hover:bg-gray-200 transition-all duration-200",
                "border border-gray-300"
              )}
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {totalResults > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {totalResults} booking{totalResults !== 1 ? 's' : ''}
            {filterStatus !== 'all' && (
              <span className="text-pink-600 font-medium ml-1">
                ({filterStatus.replace('_', ' ')})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
