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
  const [filterStatus, setFilterStatus] = useLocalStorage<FilterStatus>('bookings-filter-status', 'all');
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'list'>('bookings-view-mode', 'grid');
  const [sortBy, setSortBy] = useLocalStorage<string>('bookings-sort-by', 'created_at');
  const [sortOrder, setSortOrder] = useLocalStorage<'asc' | 'desc'>('bookings-sort-order', 'desc');

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
