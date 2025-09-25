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

  // Valid filter status values
  const validFilterStatuses: FilterStatus[] = [
    'all', 'draft', 'quote_requested', 'quote_sent', 'quote_accepted', 
    'quote_rejected', 'confirmed', 'downpayment_paid', 'paid_in_full', 
    'in_progress', 'completed', 'cancelled', 'refunded', 'disputed'
  ];

  // Validate and fix filter status if invalid - always default to 'all' for now
  const filterStatus = 'all'; // Force 'all' to load all bookings
  
  // Update localStorage if it was invalid
  if (rawFilterStatus !== 'all') {
    setRawFilterStatus('all');
  }
  
  const setFilterStatus = (status: FilterStatus) => {
    if (validFilterStatuses.includes(status)) {
      setRawFilterStatus(status);
    } else {
      console.warn(`Invalid filter status: ${status}, resetting to 'all'`);
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
