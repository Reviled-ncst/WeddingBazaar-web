// Enhanced Geolocation utilities for Philippine addresses

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  province?: string;
  country?: string;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface PhilippineLocationDetails {
  barangay?: string;
  city: string;
  province: string;
  region?: string;
  country: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Get current position using browser geolocation API with enhanced accuracy
 * Implements multiple strategies for maximum accuracy, especially for Cavite area
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Strategy 1: Ultra-high accuracy GPS first (prioritized for business location)
    const ultraHighAccuracyOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000, // 20 second timeout for best GPS
      maximumAge: 0 // No cache, absolutely fresh position
    };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        const { latitude, longitude } = position.coords;
        // For business registration, we want the best possible accuracy
        // Accept if accuracy is better than 50m (excellent for business location)
        if (accuracy <= 50) {
          resolve(position);
        } else if (accuracy <= 100) {
          resolve(position);
        } else {
          tryEnhancedFallback(resolve, reject, position);
        }
      },
      (error) => {
        tryStandardGPS(resolve, reject);
      },
      ultraHighAccuracyOptions
    );
  });
};

/**
 * Try standard GPS if ultra-high accuracy fails
 */
const tryStandardGPS = (
  resolve: (position: GeolocationPosition) => void, 
  reject: (error: Error) => void
) => {
  const standardGPSOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000, // 15 second timeout
    maximumAge: 30000 // Allow 30-second cache
  };
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const accuracy = position.coords.accuracy;
      // Accept if accuracy is reasonable for business location
      if (accuracy <= 200) {
        resolve(position);
      } else {
        tryEnhancedFallback(resolve, reject, position);
      }
    },
    (error) => {
      tryEnhancedFallback(resolve, reject);
    },
    standardGPSOptions
  );
};

/**
 * Enhanced fallback positioning strategy with preference for any GPS over network
 */
const tryEnhancedFallback = (
  resolve: (position: GeolocationPosition) => void, 
  reject: (error: Error) => void,
  lastGPSPosition?: GeolocationPosition
) => {
  // If we have any GPS position, even with poor accuracy, prefer it over network-based location
  if (lastGPSPosition) {
    resolve(lastGPSPosition);
    return;
  }

  const networkFallbackOptions: PositionOptions = {
    enableHighAccuracy: false, // Allow network-based location as last resort
    timeout: 10000,
    maximumAge: 60000 // Allow 1-minute cache
  };
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Add warning that this might be ISP location
      resolve(position);
    },
    (error) => {
      let message = 'Unable to get your location. ';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message += 'Please allow location access and try again. For accurate business location, enable GPS/high accuracy mode in your device settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          message += 'Location services are unavailable. Please check your device settings and internet connection, or use "Select on Map" to choose your business location.';
          break;
        case error.TIMEOUT:
          message += 'Location request timed out. For precise business location, try again or use "Select on Map".';
          break;
        default:
          message += 'Please use "Select on Map" to pinpoint your business location accurately.';
          break;
      }
      
      reject(new Error(message));
    },
    networkFallbackOptions
  );
};

/**
 * Format Philippine city names with proper spelling
 */
const formatPhilippineCityName = (city: string): string => {
  const cityMappings: { [key: string]: string } = {
    'Dasmarinas': 'Dasmariñas',
    'Paranaque': 'Parañaque',
    'Las Pinas': 'Las Piñas',
    'Mandaluyong': 'Mandaluyong',
    'Muntinlupa': 'Muntinlupa',
    'Antipolo': 'Antipolo',
    'Bacoor': 'Bacoor',
    'Imus': 'Imus',
    'General Trias': 'General Trias',
    'Kawit': 'Kawit',
    'Noveleta': 'Noveleta',
    'Rosario': 'Rosario',
    'Tanza': 'Tanza',
    'Trece Martires': 'Trece Martires'
  };
  
  return cityMappings[city] || city;
};

/**
 * Format Philippine province names
 */
const formatPhilippineProvinceName = (province: string): string => {
  const provinceMappings: { [key: string]: string } = {
    'Metro Manila': 'Metro Manila',
    'National Capital Region': 'Metro Manila',
    'Cavite': 'Cavite',
    'Laguna': 'Laguna',
    'Batangas': 'Batangas',
    'Rizal': 'Rizal',
    'Quezon': 'Quezon',
    'Bulacan': 'Bulacan'
  };
  
  return provinceMappings[province] || province;
};

/**
 * Format Cavite city names with GPS coordinate validation for maximum accuracy
 * Particularly important for Dasmariñas area where ISP location can be inaccurate
 */
const formatCaviteCityName = (city: string, latitude: number, longitude: number): string => {
  const normalizedCity = city.toLowerCase().trim();
  
  // Cavite city mappings with coordinate validation
  const caviteCityMappings: { [key: string]: { name: string; bounds?: { lat: [number, number]; lng: [number, number] } } } = {
    'dasmarinas': { 
      name: 'Dasmariñas',
      bounds: { lat: [14.30, 14.35], lng: [120.93, 120.98] }
    },
    'dasmariñas': { 
      name: 'Dasmariñas',
      bounds: { lat: [14.30, 14.35], lng: [120.93, 120.98] }
    },
    'bacoor': { 
      name: 'Bacoor',
      bounds: { lat: [14.45, 14.48], lng: [120.93, 120.97] }
    },
    'imus': { 
      name: 'Imus',
      bounds: { lat: [14.40, 14.44], lng: [120.93, 120.97] }
    },
    'general trias': { 
      name: 'General Trias',
      bounds: { lat: [14.38, 14.42], lng: [120.87, 120.91] }
    },
    'kawit': { 
      name: 'Kawit',
      bounds: { lat: [14.44, 14.47], lng: [120.89, 120.92] }
    },
    'noveleta': { 
      name: 'Noveleta',
      bounds: { lat: [14.42, 14.45], lng: [120.87, 120.90] }
    },
    'rosario': { 
      name: 'Rosario',
      bounds: { lat: [14.40, 14.43], lng: [120.85, 120.88] }
    },
    'tanza': { 
      name: 'Tanza',
      bounds: { lat: [14.67, 14.70], lng: [120.93, 120.96] }
    },
    'trece martires': { 
      name: 'Trece Martires',
      bounds: { lat: [14.28, 14.32], lng: [120.86, 120.90] }
    }
  };
  
  // First, try direct mapping
  if (caviteCityMappings[normalizedCity]) {
    const mapping = caviteCityMappings[normalizedCity];
    
    // Validate coordinates if bounds are available
    if (mapping.bounds) {
      const { lat, lng } = mapping.bounds;
      const isWithinBounds = latitude >= lat[0] && latitude <= lat[1] && longitude >= lng[0] && longitude <= lng[1];
      
      if (isWithinBounds) {
        return mapping.name;
      } else {
      }
    }
    
    return mapping.name;
  }
  
  // Coordinate-based detection for Dasmariñas (most common case)
  if (latitude >= 14.30 && latitude <= 14.35 && longitude >= 120.93 && longitude <= 120.98) {
    return 'Dasmariñas';
  }
  
  // Other coordinate-based detections for major Cavite cities
  if (latitude >= 14.45 && latitude <= 14.48 && longitude >= 120.93 && longitude <= 120.97) {
    return 'Bacoor';
  }
  
  if (latitude >= 14.40 && latitude <= 14.44 && longitude >= 120.93 && longitude <= 120.97) {
    return 'Imus';
  }
  
  // Fallback to original city name with proper capitalization
  return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

/**
 * Enhanced reverse geocode for Philippine addresses with Cavite-specific optimization
 * Special attention to Dasmariñas area where ISP vs GPS locations can differ significantly
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Enhanced Cavite area detection with sub-region mapping
    const isCaviteArea = latitude >= 14.1 && latitude <= 14.7 && longitude >= 120.6 && longitude <= 121.2;
    const isDasmarinasArea = latitude >= 14.30 && latitude <= 14.35 && longitude >= 120.93 && longitude <= 120.98;
    
    if (isCaviteArea) {
      if (isDasmarinasArea) {
      }
    }
    
    // Primary: Nominatim with maximum detail for Cavite, ultra-high detail for Dasmariñas
    const zoomLevel = isDasmarinasArea ? 19 : (isCaviteArea ? 18 : 16);
    
    // Multiple geocoding attempts for maximum accuracy
    const urls = [
      // Primary: Nominatim with highest detail
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=ph&accept-language=en&addressdetails=1&zoom=${zoomLevel}&extratags=1`,
      // Backup: Lower zoom for broader area
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=ph&accept-language=en&addressdetails=1&zoom=${Math.max(zoomLevel - 2, 14)}`
    ];
    
    let data = null;
    
    for (let i = 0; i < urls.length; i++) {
      try {
        const response = await fetch(urls[i]);
        
        if (response.ok) {
          data = await response.json();
          break;
        }
      } catch (err) {
      }
    }
    
    if (!data) {
      throw new Error('All geocoding attempts failed');
    }
    
    // Enhanced formatting for Philippine addresses with Cavite/Dasmariñas specificity
    if (data.address) {
      const address = data.address;
      const parts = [];
      
      // Add barangay/subdivision with enhanced formatting for Dasmariñas
      let barangay = '';
      const barangayFields = ['suburb', 'neighbourhood', 'village', 'hamlet', 'residential', 'quarter'];
      
      for (const field of barangayFields) {
        if (address[field]) {
          barangay = address[field];
          break;
        }
      }
      
      if (barangay) {
        // Special formatting for Dasmariñas barangays
        if (isDasmarinasArea) {
          // Common Dasmariñas barangays with proper formatting
          const dasmarinasBarangays: { [key: string]: string } = {
            'sabang': 'Sabang',
            'zone iv': 'Zone IV (Poblacion)',
            'burol': 'Burol',
            'salitran': 'Salitran',
            'langkaan': 'Langkaan',
            'paliparan': 'Paliparan',
            'sampaloc': 'Sampaloc',
            'bagong bayan': 'Bagong Bayan',
            'brookside': 'Brookside',
            'datu esmael': 'Datu Esmael'
          };
          
          const normalizedBarangay = barangay.toLowerCase();
          if (dasmarinasBarangays[normalizedBarangay]) {
            barangay = dasmarinasBarangays[normalizedBarangay];
          }
        }
        
        // Ensure proper Barangay formatting
        if (!barangay.toLowerCase().includes('brgy') && !barangay.toLowerCase().includes('barangay')) {
          barangay = `Brgy. ${barangay}`;
        }
        parts.push(barangay);
      }
      
      // Add city/municipality with GPS-validated Cavite-specific corrections
      let city = '';
      const cityFields = ['municipality', 'city', 'town'];
      
      for (const field of cityFields) {
        if (address[field]) {
          city = address[field];
          break;
        }
      }
      
      if (city) {
        city = formatCaviteCityName(city, latitude, longitude);
        parts.push(city);
      } else if (isDasmarinasArea) {
        // Force Dasmariñas if coordinates strongly suggest it
        parts.push('Dasmariñas');
      }
      
      // Add province with enhanced validation
      let province = '';
      if (address.province) {
        province = address.province;
      } else if (address.state) {
        province = address.state;
      }
      
      // Force Cavite if coordinates suggest it and geocoding missed it
      if (isCaviteArea && (!province || !province.toLowerCase().includes('cavite'))) {
        province = 'Cavite';
      }
      
      if (province) {
        parts.push(formatPhilippineProvinceName(province));
      }
      
      // Always add Philippines
      parts.push('Philippines');
      
      const formattedAddress = parts.join(', ');
      // Additional validation logging for Cavite areas
      if (isCaviteArea) {
      }
      
      return formattedAddress;
    }
    
    // Enhanced fallback with coordinate-based city detection
    if (isDasmarinasArea) {
      return `Dasmariñas, Cavite, Philippines (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
    } else if (isCaviteArea) {
      const detectedCity = formatCaviteCityName('', latitude, longitude);
      if (detectedCity !== '') {
        return `${detectedCity}, Cavite, Philippines (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
      }
    }
    
    // Final coordinate fallback
    const fallback = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    return fallback;
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    
    // Enhanced error fallback for Cavite area
    const isDasmarinasArea = latitude >= 14.30 && latitude <= 14.35 && longitude >= 120.93 && longitude <= 120.98;
    if (isDasmarinasArea) {
      return `Dasmariñas, Cavite, Philippines (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
    }
    
    throw new Error('Unable to get location details. Please check your internet connection or select your location on the map.');
  }
};

/**
 * Get current location with formatted Philippine address
 */
export const getCurrentLocationWithAddress = async (): Promise<GeolocationResult> => {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude, accuracy } = position.coords;
    if (!isWithinPhilippines(latitude, longitude)) {
      throw new Error('Your current location appears to be outside the Philippines. Please select a location within the Philippines manually.');
    }
    
    const address = await reverseGeocode(latitude, longitude);
    
    return {
      latitude,
      longitude,
      address,
      accuracy
    };
  } catch (error) {
    console.error('getCurrentLocationWithAddress error:', error);
    
    if (error instanceof GeolocationPositionError) {
      let message = 'Unable to get your location. ';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message += 'Please allow location access in your browser and try again.';
          break;
        case error.POSITION_UNAVAILABLE:
          message += 'Location information is unavailable. Please check your internet connection.';
          break;
        case error.TIMEOUT:
          message += 'Location request timed out. Please try again.';
          break;
        default:
          message += 'Please enter your location manually or try again.';
          break;
      }
      
      throw new Error(message);
    }
    
    throw error;
  }
};

/**
 * Check if coordinates are within Philippine bounds (enhanced precision)
 */
export const isWithinPhilippines = (latitude: number, longitude: number): boolean => {
  return latitude >= 4.5 && latitude <= 21.0 && longitude >= 116.0 && longitude <= 127.0;
};

/**
 * Get detailed Philippine location information
 */
export const getPhilippineLocationDetails = async (latitude: number, longitude: number): Promise<PhilippineLocationDetails> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=ph&accept-language=en&addressdetails=1&zoom=18`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get location details');
    }
    
    const data = await response.json();
    
    return {
      barangay: data.address?.suburb || data.address?.neighbourhood || data.address?.village || '',
      city: formatPhilippineCityName(data.address?.municipality || data.address?.city || data.address?.town || ''),
      province: formatPhilippineProvinceName(data.address?.province || data.address?.state || ''),
      region: data.address?.region || '',
      country: 'Philippines',
      fullAddress: await reverseGeocode(latitude, longitude),
      latitude,
      longitude
    };
  } catch (error) {
    console.error('Location details error:', error);
    return {
      barangay: '',
      city: '',
      province: '',
      country: 'Philippines',
      fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      latitude,
      longitude
    };
  }
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Philippine Location Search and Autocomplete
 * Provides search functionality for Philippine cities, provinces, and municipalities
 */

export interface PhilippineLocation {
  id: string;
  name: string;
  type: 'city' | 'municipality' | 'province' | 'region';
  province?: string;
  region?: string;
  fullName: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Comprehensive Philippine locations database
export const PHILIPPINE_LOCATIONS: PhilippineLocation[] = [
  // NCR (National Capital Region)
  { id: 'ncr-manila', name: 'Manila', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Manila, Metro Manila', coordinates: { latitude: 14.5995, longitude: 120.9842 } },
  { id: 'ncr-quezon', name: 'Quezon City', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Quezon City, Metro Manila', coordinates: { latitude: 14.6760, longitude: 121.0437 } },
  { id: 'ncr-makati', name: 'Makati', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Makati City, Metro Manila', coordinates: { latitude: 14.5547, longitude: 121.0244 } },
  { id: 'ncr-pasig', name: 'Pasig', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Pasig City, Metro Manila', coordinates: { latitude: 14.5764, longitude: 121.0851 } },
  { id: 'ncr-taguig', name: 'Taguig', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Taguig City, Metro Manila', coordinates: { latitude: 14.5176, longitude: 121.0509 } },
  { id: 'ncr-paranaque', name: 'Parañaque', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Parañaque City, Metro Manila', coordinates: { latitude: 14.4793, longitude: 121.0198 } },
  { id: 'ncr-muntinlupa', name: 'Muntinlupa', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Muntinlupa City, Metro Manila', coordinates: { latitude: 14.3832, longitude: 121.0409 } },
  { id: 'ncr-marikina', name: 'Marikina', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Marikina City, Metro Manila', coordinates: { latitude: 14.6507, longitude: 121.1029 } },
  { id: 'ncr-mandaluyong', name: 'Mandaluyong', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Mandaluyong City, Metro Manila', coordinates: { latitude: 14.5794, longitude: 121.0359 } },
  { id: 'ncr-pasay', name: 'Pasay', type: 'city', province: 'Metro Manila', region: 'NCR', fullName: 'Pasay City, Metro Manila', coordinates: { latitude: 14.5378, longitude: 120.9896 } },
  
  // CALABARZON (Most relevant for wedding venues)
  { id: 'cavite-tagaytay', name: 'Tagaytay', type: 'city', province: 'Cavite', region: 'CALABARZON', fullName: 'Tagaytay City, Cavite', coordinates: { latitude: 14.1153, longitude: 120.9621 } },
  { id: 'cavite-dasmarinas', name: 'Dasmariñas', type: 'city', province: 'Cavite', region: 'CALABARZON', fullName: 'Dasmariñas City, Cavite', coordinates: { latitude: 14.3294, longitude: 120.9367 } },
  { id: 'cavite-bacoor', name: 'Bacoor', type: 'city', province: 'Cavite', region: 'CALABARZON', fullName: 'Bacoor City, Cavite', coordinates: { latitude: 14.4304, longitude: 120.9490 } },
  { id: 'cavite-imus', name: 'Imus', type: 'city', province: 'Cavite', region: 'CALABARZON', fullName: 'Imus City, Cavite', coordinates: { latitude: 14.4297, longitude: 120.9370 } },
  { id: 'cavite-general-trias', name: 'General Trias', type: 'city', province: 'Cavite', region: 'CALABARZON', fullName: 'General Trias City, Cavite', coordinates: { latitude: 14.3858, longitude: 120.8808 } },
  { id: 'cavite-kawit', name: 'Kawit', type: 'municipality', province: 'Cavite', region: 'CALABARZON', fullName: 'Kawit, Cavite', coordinates: { latitude: 14.4487, longitude: 120.9045 } },
  { id: 'cavite-silang', name: 'Silang', type: 'municipality', province: 'Cavite', region: 'CALABARZON', fullName: 'Silang, Cavite', coordinates: { latitude: 14.2306, longitude: 120.9728 } },
  
  { id: 'laguna-santa-rosa', name: 'Santa Rosa', type: 'city', province: 'Laguna', region: 'CALABARZON', fullName: 'Santa Rosa City, Laguna', coordinates: { latitude: 14.3124, longitude: 121.1114 } },
  { id: 'laguna-binan', name: 'Biñan', type: 'city', province: 'Laguna', region: 'CALABARZON', fullName: 'Biñan City, Laguna', coordinates: { latitude: 14.3369, longitude: 121.0864 } },
  { id: 'laguna-san-pedro', name: 'San Pedro', type: 'city', province: 'Laguna', region: 'CALABARZON', fullName: 'San Pedro City, Laguna', coordinates: { latitude: 14.3553, longitude: 121.0444 } },
  { id: 'laguna-calamba', name: 'Calamba', type: 'city', province: 'Laguna', region: 'CALABARZON', fullName: 'Calamba City, Laguna', coordinates: { latitude: 14.2118, longitude: 121.1653 } },
  { id: 'laguna-los-banos', name: 'Los Baños', type: 'municipality', province: 'Laguna', region: 'CALABARZON', fullName: 'Los Baños, Laguna', coordinates: { latitude: 14.1691, longitude: 121.2198 } },
  
  { id: 'batangas-batangas-city', name: 'Batangas City', type: 'city', province: 'Batangas', region: 'CALABARZON', fullName: 'Batangas City, Batangas', coordinates: { latitude: 13.7565, longitude: 121.0583 } },
  { id: 'batangas-lipa', name: 'Lipa', type: 'city', province: 'Batangas', region: 'CALABARZON', fullName: 'Lipa City, Batangas', coordinates: { latitude: 13.9411, longitude: 121.1648 } },
  { id: 'batangas-tanauan', name: 'Tanauan', type: 'city', province: 'Batangas', region: 'CALABARZON', fullName: 'Tanauan City, Batangas', coordinates: { latitude: 14.0865, longitude: 121.1489 } },
  { id: 'batangas-nasugbu', name: 'Nasugbu', type: 'municipality', province: 'Batangas', region: 'CALABARZON', fullName: 'Nasugbu, Batangas', coordinates: { latitude: 14.0787, longitude: 120.6363 } },
  
  { id: 'rizal-antipolo', name: 'Antipolo', type: 'city', province: 'Rizal', region: 'CALABARZON', fullName: 'Antipolo City, Rizal', coordinates: { latitude: 14.5873, longitude: 121.1759 } },
  { id: 'rizal-cainta', name: 'Cainta', type: 'municipality', province: 'Rizal', region: 'CALABARZON', fullName: 'Cainta, Rizal', coordinates: { latitude: 14.5789, longitude: 121.1228 } },
  { id: 'rizal-taytay', name: 'Taytay', type: 'municipality', province: 'Rizal', region: 'CALABARZON', fullName: 'Taytay, Rizal', coordinates: { latitude: 14.5574, longitude: 121.1324 } },
  
  { id: 'quezon-lucena', name: 'Lucena', type: 'city', province: 'Quezon', region: 'CALABARZON', fullName: 'Lucena City, Quezon', coordinates: { latitude: 13.9374, longitude: 121.6170 } },
  
  // Central Luzon
  { id: 'bulacan-malolos', name: 'Malolos', type: 'city', province: 'Bulacan', region: 'Central Luzon', fullName: 'Malolos City, Bulacan', coordinates: { latitude: 14.8433, longitude: 120.8113 } },
  { id: 'bulacan-san-jose-del-monte', name: 'San Jose del Monte', type: 'city', province: 'Bulacan', region: 'Central Luzon', fullName: 'San Jose del Monte City, Bulacan', coordinates: { latitude: 14.8136, longitude: 121.0453 } },
  { id: 'bulacan-meycauayan', name: 'Meycauayan', type: 'city', province: 'Bulacan', region: 'Central Luzon', fullName: 'Meycauayan City, Bulacan', coordinates: { latitude: 14.7352, longitude: 120.9533 } },
  
  { id: 'pampanga-angeles', name: 'Angeles', type: 'city', province: 'Pampanga', region: 'Central Luzon', fullName: 'Angeles City, Pampanga', coordinates: { latitude: 15.1450, longitude: 120.5950 } },
  { id: 'pampanga-san-fernando', name: 'San Fernando', type: 'city', province: 'Pampanga', region: 'Central Luzon', fullName: 'San Fernando City, Pampanga', coordinates: { latitude: 15.0255, longitude: 120.6897 } },
  
  // Cebu
  { id: 'cebu-cebu-city', name: 'Cebu City', type: 'city', province: 'Cebu', region: 'Central Visayas', fullName: 'Cebu City, Cebu', coordinates: { latitude: 10.3157, longitude: 123.8854 } },
  { id: 'cebu-mandaue', name: 'Mandaue', type: 'city', province: 'Cebu', region: 'Central Visayas', fullName: 'Mandaue City, Cebu', coordinates: { latitude: 10.3237, longitude: 123.9227 } },
  { id: 'cebu-lapu-lapu', name: 'Lapu-Lapu', type: 'city', province: 'Cebu', region: 'Central Visayas', fullName: 'Lapu-Lapu City, Cebu', coordinates: { latitude: 10.3103, longitude: 124.0069 } },
  
  // Davao
  { id: 'davao-davao-city', name: 'Davao City', type: 'city', province: 'Davao del Sur', region: 'Davao Region', fullName: 'Davao City, Davao del Sur', coordinates: { latitude: 7.1907, longitude: 125.4553 } },
  
  // Baguio
  { id: 'benguet-baguio', name: 'Baguio', type: 'city', province: 'Benguet', region: 'CAR', fullName: 'Baguio City, Benguet', coordinates: { latitude: 16.4023, longitude: 120.5960 } },
  
  // Iloilo
  { id: 'iloilo-iloilo-city', name: 'Iloilo City', type: 'city', province: 'Iloilo', region: 'Western Visayas', fullName: 'Iloilo City, Iloilo', coordinates: { latitude: 10.7202, longitude: 122.5621 } },
  
  // Bacolod
  { id: 'negros-occidental-bacolod', name: 'Bacolod', type: 'city', province: 'Negros Occidental', region: 'Western Visayas', fullName: 'Bacolod City, Negros Occidental', coordinates: { latitude: 10.6760, longitude: 122.9540 } },
  
  // Popular provinces
  { id: 'cavite', name: 'Cavite', type: 'province', region: 'CALABARZON', fullName: 'Cavite Province', coordinates: { latitude: 14.2456, longitude: 120.8782 } },
  { id: 'laguna', name: 'Laguna', type: 'province', region: 'CALABARZON', fullName: 'Laguna Province', coordinates: { latitude: 14.2691, longitude: 121.3470 } },
  { id: 'batangas', name: 'Batangas', type: 'province', region: 'CALABARZON', fullName: 'Batangas Province', coordinates: { latitude: 13.9568, longitude: 121.1073 } },
  { id: 'rizal', name: 'Rizal', type: 'province', region: 'CALABARZON', fullName: 'Rizal Province', coordinates: { latitude: 14.6037, longitude: 121.3084 } },
  { id: 'bulacan', name: 'Bulacan', type: 'province', region: 'Central Luzon', fullName: 'Bulacan Province', coordinates: { latitude: 14.7942, longitude: 120.8794 } },
  { id: 'pampanga', name: 'Pampanga', type: 'province', region: 'Central Luzon', fullName: 'Pampanga Province', coordinates: { latitude: 15.0794, longitude: 120.6200 } },
  { id: 'cebu', name: 'Cebu', type: 'province', region: 'Central Visayas', fullName: 'Cebu Province', coordinates: { latitude: 10.3157, longitude: 123.8854 } }
];

/**
 * Search Philippine locations by query
 * Supports fuzzy matching and multiple search strategies
 */
export const searchPhilippineLocations = (query: string, limit: number = 10): PhilippineLocation[] => {
  if (!query || query.length < 2) {
    return [];
  }

  const searchQuery = query.toLowerCase().trim();
  const results: Array<PhilippineLocation & { score: number }> = [];

  PHILIPPINE_LOCATIONS.forEach(location => {
    let score = 0;
    const name = location.name.toLowerCase();
    const fullName = location.fullName.toLowerCase();
    const province = location.province?.toLowerCase() || '';

    // Exact match gets highest score
    if (name === searchQuery) {
      score = 100;
    }
    // Starts with query gets high score
    else if (name.startsWith(searchQuery)) {
      score = 90;
    }
    // Contains query gets medium score
    else if (name.includes(searchQuery)) {
      score = 70;
    }
    // Full name contains query gets lower score
    else if (fullName.includes(searchQuery)) {
      score = 50;
    }
    // Province matches gets low score
    else if (province.includes(searchQuery)) {
      score = 30;
    }

    // Boost score for cities over municipalities
    if (location.type === 'city' && score > 0) {
      score += 10;
    }

    // Boost score for popular wedding destinations
    const popularDestinations = ['tagaytay', 'baguio', 'cebu', 'boracay', 'palawan', 'batangas', 'laguna'];
    if (popularDestinations.some(dest => name.includes(dest)) && score > 0) {
      score += 15;
    }

    if (score > 0) {
      results.push({ ...location, score });
    }
  });

  // Sort by score (descending) and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...location }) => location);
};

/**
 * Get location by ID
 */
export const getLocationById = (id: string): PhilippineLocation | null => {
  return PHILIPPINE_LOCATIONS.find(location => location.id === id) || null;
};

/**
 * Get popular wedding destinations
 */
export const getPopularWeddingDestinations = (): PhilippineLocation[] => {
  const popularIds = [
    'cavite-tagaytay',
    'benguet-baguio', 
    'batangas-nasugbu',
    'laguna-los-banos',
    'cebu-cebu-city',
    'ncr-manila',
    'ncr-makati',
    'cavite-silang'
  ];

  return popularIds
    .map(id => getLocationById(id))
    .filter(location => location !== null) as PhilippineLocation[];
};

/**
 * Get locations by province
 */
export const getLocationsByProvince = (province: string): PhilippineLocation[] => {
  return PHILIPPINE_LOCATIONS.filter(location => 
    location.province?.toLowerCase() === province.toLowerCase()
  );
};

/**
 * Get coordinates for a location
 */
export const getLocationCoordinates = (locationName: string): { latitude: number; longitude: number } | null => {
  const location = PHILIPPINE_LOCATIONS.find(loc => 
    loc.name.toLowerCase() === locationName.toLowerCase() ||
    loc.fullName.toLowerCase() === locationName.toLowerCase()
  );
  
  return location?.coordinates || null;
};
