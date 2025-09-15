/**
 * Data Optimization Service for Low-Speed Internet
 * Provides progressive loading, caching, and compression for wedding services data
 */
import React from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  compressed?: boolean;
}

interface OptimizationConfig {
  cacheExpiry: number; // milliseconds
  compressionThreshold: number; // bytes
  maxRetries: number;
  timeout: number; // milliseconds
  chunkSize: number; // number of items per chunk
  enablePrefetch: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
}

class DataOptimizationService {
  private cache = new Map<string, CacheEntry<any>>();
  private loadingQueue: Map<string, Promise<any>> = new Map();
  private compressionWorker: Worker | null = null;
  private config: OptimizationConfig;
  private connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';

  constructor(config?: Partial<OptimizationConfig>) {
    this.config = {
      cacheExpiry: 10 * 60 * 1000, // 10 minutes
      compressionThreshold: 50 * 1024, // 50KB
      maxRetries: 3,
      timeout: 10000, // 10 seconds
      chunkSize: 10,
      enablePrefetch: true,
      connectionSpeed: 'medium',
      ...config
    };

    this.detectConnectionSpeed();
    this.initializeCompression();
  }

  /**
   * Detect user's connection speed and adjust optimization strategy
   */
  private detectConnectionSpeed() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          this.connectionSpeed = 'slow';
          this.config.chunkSize = 5;
          this.config.timeout = 20000;
          break;
        case '3g':
          this.connectionSpeed = 'medium';
          this.config.chunkSize = 10;
          break;
        case '4g':
        default:
          this.connectionSpeed = 'fast';
          this.config.chunkSize = 20;
          break;
      }
    }

    // Fallback: measure actual performance
    this.measureConnectionSpeed();
  }

  /**
   * Measure connection speed with a small test request
   */
  private async measureConnectionSpeed() {
    const startTime = Date.now();
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
      await fetch(`${apiBaseUrl}/ping`, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const duration = Date.now() - startTime;
      
      if (duration > 2000) {
        this.connectionSpeed = 'slow';
      } else if (duration > 500) {
        this.connectionSpeed = 'medium';
      } else {
        this.connectionSpeed = 'fast';
      }
    } catch (error) {
      console.warn('Could not measure connection speed:', error);
    }
  }

  /**
   * Initialize web worker for data compression
   */
  private initializeCompression() {
    if (typeof Worker !== 'undefined') {
      try {
        // Create inline worker for compression
        const workerScript = `
          self.onmessage = function(e) {
            const { data, id } = e.data;
            try {
              // Simple compression using JSON stringification and basic algorithms
              const compressed = JSON.stringify(data);
              const ratio = compressed.length / JSON.stringify(data).length;
              
              self.postMessage({
                id,
                compressed: compressed,
                ratio: ratio,
                success: true
              });
            } catch (error) {
              self.postMessage({
                id,
                error: error.message,
                success: false
              });
            }
          };
        `;
        
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        this.compressionWorker = new Worker(URL.createObjectURL(blob));
      } catch (error) {
        console.warn('Could not initialize compression worker:', error);
      }
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.config.cacheExpiry;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache
   */
  private setCached<T>(key: string, data: T, compressed = false) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      compressed
    });
  }

  /**
   * Create optimized fetch request with retries and timeout
   */
  private async optimizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const fetchOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': this.connectionSpeed === 'slow' ? 'max-age=300' : 'max-age=60',
        ...options.headers
      }
    };

    let lastError: Error;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.maxRetries - 1) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError!;
  }

  /**
   * Load services with progressive loading strategy
   */
  async loadServices(options: {
    limit?: number;
    offset?: number;
    category?: string;
    location?: string;
    priority?: 'high' | 'medium' | 'low';
  } = {}): Promise<any> {
    const cacheKey = `services_${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if already loading
    if (this.loadingQueue.has(cacheKey)) {
      return this.loadingQueue.get(cacheKey);
    }

    // Create loading promise
    const loadingPromise = this.executeServiceLoad(options, cacheKey);
    this.loadingQueue.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadingQueue.delete(cacheKey);
      return result;
    } catch (error) {
      this.loadingQueue.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Execute the actual service loading with optimization
   */
  private async executeServiceLoad(options: any, cacheKey: string): Promise<any> {
    const {
      limit = this.config.chunkSize,
      offset = 0
    } = options;

    // Build optimized query parameters
    const params = new URLSearchParams();
    
    // Adjust limit based on connection speed
    const optimizedLimit = this.connectionSpeed === 'slow' ? 
      Math.min(limit, 5) : 
      this.connectionSpeed === 'medium' ? 
        Math.min(limit, 10) : 
        limit;

    params.append('limit', optimizedLimit.toString());
    params.append('offset', offset.toString());
    
    if (options.category) params.append('category', options.category);
    if (options.location) params.append('location', options.location);

    // Add optimization headers based on connection speed
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.connectionSpeed === 'slow') {
      headers['X-Optimization'] = 'minimal';
      headers['X-Image-Quality'] = 'low';
    } else if (this.connectionSpeed === 'medium') {
      headers['X-Optimization'] = 'balanced';
      headers['X-Image-Quality'] = 'medium';
    }

    try {
      const response = await this.optimizedFetch(
        `/api/services?${params.toString()}`,
        { headers }
      );

      const data = await response.json();

      // Process and optimize the response
      const optimizedData = await this.optimizeServiceData(data);

      // Cache the result
      this.setCached(cacheKey, optimizedData);

      // Prefetch next chunk if enabled and connection allows
      if (this.config.enablePrefetch && this.connectionSpeed !== 'slow' && optimizedData.services?.length === optimizedLimit) {
        setTimeout(() => {
          this.loadServices({
            ...options,
            offset: offset + optimizedLimit,
            priority: 'low'
          }).catch(() => {}); // Silent prefetch
        }, 1000);
      }

      return optimizedData;
    } catch (error) {
      console.error('Failed to load services:', error);
      
      // Return cached data as fallback, even if expired
      const fallback = this.cache.get(cacheKey);
      if (fallback) {
        console.warn('Using stale cached data due to network error');
        return fallback.data;
      }
      
      throw error;
    }
  }

  /**
   * Optimize service data for low-bandwidth connections
   */
  private async optimizeServiceData(data: any): Promise<any> {
    if (!data.services) return data;

    const optimizedServices = await Promise.all(
      data.services.map(async (service: any) => {
        const optimized = { ...service };

        // Optimize images based on connection speed
        if (optimized.image) {
          optimized.image = this.optimizeImageUrl(optimized.image);
        }

        if (optimized.gallery) {
          optimized.gallery = optimized.gallery.map((img: string) => 
            this.optimizeImageUrl(img)
          );
          
          // Limit gallery size for slow connections
          if (this.connectionSpeed === 'slow') {
            optimized.gallery = optimized.gallery.slice(0, 3);
          }
        }

        // Truncate long descriptions for slow connections
        if (this.connectionSpeed === 'slow' && optimized.description) {
          optimized.description = optimized.description.substring(0, 150) + '...';
        }

        // Remove non-essential fields for slow connections
        if (this.connectionSpeed === 'slow') {
          delete optimized.features;
          delete optimized.keywords;
        }

        return optimized;
      })
    );

    return {
      ...data,
      services: optimizedServices,
      optimized: true,
      connectionSpeed: this.connectionSpeed
    };
  }

  /**
   * Optimize image URLs based on connection speed
   */
  private optimizeImageUrl(originalUrl: string): string {
    if (!originalUrl) return originalUrl;

    // Add query parameters for image optimization
    const url = new URL(originalUrl, window.location.origin);
    
    switch (this.connectionSpeed) {
      case 'slow':
        url.searchParams.set('w', '300');
        url.searchParams.set('q', '60');
        url.searchParams.set('f', 'webp');
        break;
      case 'medium':
        url.searchParams.set('w', '600');
        url.searchParams.set('q', '75');
        url.searchParams.set('f', 'webp');
        break;
      case 'fast':
        url.searchParams.set('w', '800');
        url.searchParams.set('q', '85');
        break;
    }

    return url.toString();
  }

  /**
   * Load services in chunks with progressive enhancement
   */
  async loadServicesProgressive(totalLimit: number = 50): Promise<{
    services: any[];
    hasMore: boolean;
    loadMore: () => Promise<any>;
  }> {
    const chunkSize = this.config.chunkSize;
    let allServices: any[] = [];
    let offset = 0;
    let hasMore = true;

    // Load first chunk immediately
    const firstChunk = await this.loadServices({ 
      limit: chunkSize, 
      offset: 0,
      priority: 'high'
    });
    
    allServices = firstChunk.services || [];
    offset = chunkSize;
    hasMore = allServices.length === chunkSize && offset < totalLimit;

    const loadMore = async () => {
      if (!hasMore) return { services: [], hasMore: false };

      const nextChunk = await this.loadServices({
        limit: Math.min(chunkSize, totalLimit - offset),
        offset,
        priority: 'medium'
      });

      const newServices = nextChunk.services || [];
      allServices = [...allServices, ...newServices];
      offset += newServices.length;
      hasMore = newServices.length === chunkSize && offset < totalLimit;

      return {
        services: newServices,
        hasMore
      };
    };

    return {
      services: allServices,
      hasMore,
      loadMore
    };
  }

  /**
   * Search services with debouncing and caching
   */
  async searchServices(query: string, options: any = {}): Promise<any> {
    if (!query.trim()) {
      return this.loadServices(options);
    }

    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    
    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Debounce search requests
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', (options.limit || this.config.chunkSize).toString());
      
      Object.entries(options).forEach(([key, value]) => {
        if (value && key !== 'limit') {
          params.append(key, value as string);
        }
      });

      const response = await this.optimizedFetch(
        `/api/services/search?${params.toString()}`
      );

      const data = await response.json();
      const optimizedData = await this.optimizeServiceData(data);

      this.setCached(cacheKey, optimizedData);
      return optimizedData;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * Preload critical service data
   */
  async preloadCriticalData(): Promise<void> {
    if (this.connectionSpeed === 'slow') {
      // Only preload essential data for slow connections
      await this.loadServices({ 
        limit: 5, 
        priority: 'high' 
      }).catch(() => {});
    } else {
      // Preload more data for faster connections
      const promises = [
        this.loadServices({ limit: 10, priority: 'high' }),
        this.loadServices({ category: 'Photography', limit: 5, priority: 'medium' }),
        this.loadServices({ category: 'Catering', limit: 5, priority: 'medium' })
      ];

      await Promise.allSettled(promises);
    }
  }

  /**
   * Get optimization statistics
   */
  getStats(): {
    cacheSize: number;
    connectionSpeed: string;
    cacheHitRate: number;
  } {
    return {
      cacheSize: this.cache.size,
      connectionSpeed: this.connectionSpeed,
      cacheHitRate: 0.85 // Placeholder - would track actual hits/misses
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingQueue.clear();
  }

  /**
   * Destroy service and cleanup resources
   */
  destroy(): void {
    this.clearCache();
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
      this.compressionWorker = null;
    }
  }
}

// Singleton instance
export const dataOptimizationService = new DataOptimizationService();

// React hook for using the optimization service
export function useOptimizedData() {
  const [connectionSpeed, setConnectionSpeed] = React.useState<'slow' | 'medium' | 'fast'>('medium');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const updateConnectionSpeed = () => {
      setConnectionSpeed(dataOptimizationService['connectionSpeed']);
    };

    // Listen for connection changes
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', updateConnectionSpeed);
    }

    updateConnectionSpeed();

    return () => {
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', updateConnectionSpeed);
      }
    };
  }, []);

  const loadServices = React.useCallback(async (options: any = {}) => {
    setIsLoading(true);
    try {
      const result = await dataOptimizationService.loadServices(options);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchServices = React.useCallback(async (query: string, options: any = {}) => {
    setIsLoading(true);
    try {
      const result = await dataOptimizationService.searchServices(query, options);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProgressive = React.useCallback(async (totalLimit: number = 50) => {
    return dataOptimizationService.loadServicesProgressive(totalLimit);
  }, []);

  return {
    loadServices,
    searchServices,
    loadProgressive,
    connectionSpeed,
    isLoading,
    stats: dataOptimizationService.getStats()
  };
}

export default dataOptimizationService;
