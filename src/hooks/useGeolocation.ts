import { useState, useCallback } from 'react';
import { getCurrentLocationWithAddress } from '../utils/geolocation-enhanced';
import type { GeolocationResult } from '../utils/geolocation-enhanced';

interface UseGeolocationState {
  isLoading: boolean;
  error: string | null;
  location: GeolocationResult | null;
}

interface UseGeolocationReturn extends UseGeolocationState {
  getCurrentLocation: () => Promise<void>;
  clearError: () => void;
  clearLocation: () => void;
}

/**
 * Custom hook for geolocation functionality
 */
export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<UseGeolocationState>({
    isLoading: false,
    error: null,
    location: null
  });

  const getCurrentLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const location = await getCurrentLocationWithAddress();
      setState(prev => ({ ...prev, location, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to get your location';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearLocation = useCallback(() => {
    setState(prev => ({ ...prev, location: null }));
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearError,
    clearLocation
  };
};
