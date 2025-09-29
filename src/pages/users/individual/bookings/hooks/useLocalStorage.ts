import { useState, useEffect } from 'react';
import type { FilterStatus } from '../types/booking.types';

/**
 * Custom hook for persisting state to localStorage
 * @param key - The key to store the value under in localStorage
 * @param defaultValue - The default value to use if nothing is in localStorage
 * @returns [value, setValue] - Array with current value and setter function
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

/**
 * Hook to manage user preferences for the bookings page
 */
export function useBookingPreferences() {
  const [rawFilterStatus, setRawFilterStatus] = useLocalStorage<FilterStatus>('bookings-filter-status', 'all');
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'list'>('bookings-view-mode', 'list');
  const [sortBy, setSortBy] = useLocalStorage<string>('bookings-sort-by', 'created_at');
  const [sortOrder, setSortOrder] = useLocalStorage<'asc' | 'desc'>('bookings-sort-order', 'desc');

  // Valid filter status values - FIXED to match actual data (after STATUS_MAPPING transformation)
  const validFilterStatuses: FilterStatus[] = [
    'all', 'quote_requested', 'confirmed', 'downpayment_paid', 'paid_in_full', 'completed', 'cancelled', 'quote_rejected'
  ];

  // Validate filter status and use valid value
  const filterStatus = validFilterStatuses.includes(rawFilterStatus) ? rawFilterStatus : 'all';
  
  // Debug logging for filter status
  console.log('🔍 [useBookingPreferences v3.0] Raw filter status:', rawFilterStatus);
  console.log('🔍 [useBookingPreferences v3.0] Final filter status:', filterStatus);
  console.log('🔍 [useBookingPreferences v3.0] Valid statuses:', validFilterStatuses);
  
  // Update localStorage if it was invalid
  if (rawFilterStatus !== filterStatus) {
    setRawFilterStatus(filterStatus);
  }
  
  const setFilterStatus = (status: FilterStatus) => {
    console.log('🎯 [FilterStatus v3.0] Setting filter status:', status);
    console.log('🎯 [FilterStatus v3.0] Valid statuses:', validFilterStatuses);
    console.log('🎯 [FilterStatus v3.0] Is valid:', validFilterStatuses.includes(status));
    
    if (validFilterStatuses.includes(status)) {
      console.log('✅ [FilterStatus v3.0] Status is valid, setting to:', status);
      setRawFilterStatus(status);
    } else {
      console.warn(`❌ [FilterStatus v3.0] Invalid filter status: ${status}, resetting to 'all'`);
      setRawFilterStatus('all');
    }
  };

  return {
    filterStatus,
    setFilterStatus,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
}
