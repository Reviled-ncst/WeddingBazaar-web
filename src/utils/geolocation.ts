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

    console.log('🎯 Attempting ultra-high accuracy GPS positioning for business location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        const { latitude, longitude } = position.coords;
        
        console.log('✅ Ultra-high accuracy GPS success:', {
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          accuracy: `${accuracy}m`,
          timestamp: new Date(position.timestamp).toLocaleTimeString(),
          source: 'GPS'
        });
        
        // For business registration, we want the best possible accuracy
        // Accept if accuracy is better than 50m (excellent for business location)
        if (accuracy <= 50) {
          console.log('🏆 Excellent GPS accuracy achieved for business location!');
          resolve(position);
        } else if (accuracy <= 100) {
          console.log('✅ Good GPS accuracy for business location');
          resolve(position);
        } else {
          console.log('⚠️ GPS accuracy not ideal for business location, trying enhanced fallback...');
          tryEnhancedFallback(resolve, reject, position);
        }
      },
      (error) => {
        console.log('❌ Ultra-high accuracy GPS failed:', error.message);
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

  console.log('🔄 Trying standard GPS positioning...');
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const accuracy = position.coords.accuracy;
      console.log('📍 Standard GPS obtained:', {
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6),
        accuracy: `${accuracy}m`,
        source: 'GPS-standard'
      });
      
      // Accept if accuracy is reasonable for business location
      if (accuracy <= 200) {
        resolve(position);
      } else {
        tryEnhancedFallback(resolve, reject, position);
      }
    },
    (error) => {
      console.log('❌ Standard GPS failed:', error.message);
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
    console.log('🎯 Using GPS position despite accuracy concerns (better than ISP location)');
    resolve(lastGPSPosition);
    return;
  }

  const networkFallbackOptions: PositionOptions = {
    enableHighAccuracy: false, // Allow network-based location as last resort
    timeout: 10000,
    maximumAge: 60000 // Allow 1-minute cache
  };

  console.log('⚠️ Falling back to network-based positioning (may be inaccurate for exact business location)...');
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('� Network-based position obtained:', {
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6),
        accuracy: `${position.coords.accuracy}m`,
        source: 'network/cellular',
        warning: 'May be ISP location - recommend manual verification'
      });
      
      // Add warning that this might be ISP location
      console.warn('⚠️ Network-based location may be inaccurate for business addresses. Consider using "Select on Map" for precise location.');
      
      resolve(position);
    },
    (error) => {
      console.log('❌ All positioning methods failed:', error.message);
      
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
        console.log(`🎯 GPS-validated city: ${mapping.name} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        return mapping.name;
      } else {
        console.log(`⚠️ Coordinate mismatch for ${mapping.name}. GPS: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      }
    }
    
    return mapping.name;
  }
  
  // Coordinate-based detection for Dasmariñas (most common case)
  if (latitude >= 14.30 && latitude <= 14.35 && longitude >= 120.93 && longitude <= 120.98) {
    console.log('🎯 GPS coordinates suggest Dasmariñas');
    return 'Dasmariñas';
  }
  
  // Other coordinate-based detections for major Cavite cities
  if (latitude >= 14.45 && latitude <= 14.48 && longitude >= 120.93 && longitude <= 120.97) {
    console.log('🎯 GPS coordinates suggest Bacoor');
    return 'Bacoor';
  }
  
  if (latitude >= 14.40 && latitude <= 14.44 && longitude >= 120.93 && longitude <= 120.97) {
    console.log('🎯 GPS coordinates suggest Imus');
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
    console.log(`🗺️ Reverse geocoding for: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    
    // Enhanced Cavite area detection with sub-region mapping
    const isCaviteArea = latitude >= 14.1 && latitude <= 14.7 && longitude >= 120.6 && longitude <= 121.2;
    const isDasmarinasArea = latitude >= 14.30 && latitude <= 14.35 && longitude >= 120.93 && longitude <= 120.98;
    
    if (isCaviteArea) {
      console.log('📍 Detected Cavite province - using enhanced geocoding');
      if (isDasmarinasArea) {
        console.log('🎯 Detected Dasmariñas area - applying specialized geocoding');
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
        console.log(`🌐 Attempting geocoding request ${i + 1}/${urls.length}...`);
        const response = await fetch(urls[i]);
        
        if (response.ok) {
          data = await response.json();
          console.log(`✅ Geocoding success on attempt ${i + 1}:`, data);
          break;
        }
      } catch (err) {
        console.log(`⚠️ Geocoding attempt ${i + 1} failed:`, err);
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
        console.log('🎯 GPS coordinates strongly suggest Dasmariñas - adding city override');
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
        console.log('🎯 GPS coordinates suggest Cavite - overriding province');
        province = 'Cavite';
      }
      
      if (province) {
        parts.push(formatPhilippineProvinceName(province));
      }
      
      // Always add Philippines
      parts.push('Philippines');
      
      const formattedAddress = parts.join(', ');
      console.log('✅ Final formatted address:', formattedAddress);
      
      // Additional validation logging for Cavite areas
      if (isCaviteArea) {
        console.log(`🎯 Cavite-specific validation applied for ${isDasmarinasArea ? 'Dasmariñas area' : 'Cavite province'}`);
      }
      
      return formattedAddress;
    }
    
    // Enhanced fallback with coordinate-based city detection
    if (isDasmarinasArea) {
      console.log('🎯 Using Dasmariñas coordinate-based fallback');
      return `Dasmariñas, Cavite, Philippines (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
    } else if (isCaviteArea) {
      const detectedCity = formatCaviteCityName('', latitude, longitude);
      if (detectedCity !== '') {
        console.log(`🎯 Using ${detectedCity} coordinate-based fallback`);
        return `${detectedCity}, Cavite, Philippines (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
      }
    }
    
    // Final coordinate fallback
    const fallback = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    console.log('⚠️ Using coordinate fallback:', fallback);
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
    console.log('Getting current location...');
    const position = await getCurrentPosition();
    const { latitude, longitude, accuracy } = position.coords;
    
    console.log(`Position obtained: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
    
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
