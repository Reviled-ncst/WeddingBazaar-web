import { useCallback, useRef } from 'react';

/**
 * Custom hook for debounced function calls
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Custom hook for enhanced error handling with retry functionality
 * @param onError - Error callback function
 * @returns Error handler with retry capability
 */
export function useErrorHandler(onError?: (error: Error) => void) {
  return useCallback((error: unknown, context?: string) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    console.error(`🚨 [${context || 'Error'}]:`, errorObj);
    
    if (onError) {
      onError(errorObj);
    }
    
    return {
      retry: (retryFn: () => Promise<void>) => retryFn(),
      message: errorObj.message,
      context
    };
  }, [onError]);
}

/**
 * Custom hook for local storage with error handling
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue] tuple
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const getValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return defaultValue;
    }
  }, [key, defaultValue]);

  const setValue = useCallback((value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
    }
  }, [key]);

  return [getValue(), setValue] as const;
}
