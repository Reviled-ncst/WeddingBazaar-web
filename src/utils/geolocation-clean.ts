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
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 25000, // Increased timeout for better accuracy
      maximumAge: 30000 // 30 seconds cache for fresh data
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('GPS Position obtained:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        resolve(position);
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      options
    );
  });
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
 * Enhanced reverse geocode for Philippine addresses with multiple providers
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    console.log(`Reverse geocoding for: ${latitude}, ${longitude}`);
    
    // Primary: Nominatim with detailed address components
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=ph&accept-language=en&addressdetails=1&zoom=18`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get location details');
    }
    
    const data = await response.json();
    console.log('Nominatim response:', data);
    
    // Enhanced formatting for Philippine addresses
    if (data.address) {
      const address = data.address;
      const parts = [];
      
      // Add barangay/subdivision
      if (address.suburb) {
        parts.push(address.suburb.includes('Brgy') ? address.suburb : `Brgy. ${address.suburb}`);
      } else if (address.neighbourhood) {
        parts.push(address.neighbourhood.includes('Brgy') ? address.neighbourhood : `Brgy. ${address.neighbourhood}`);
      } else if (address.village) {
        parts.push(address.village.includes('Brgy') ? address.village : `Brgy. ${address.village}`);
      }
      
      // Add city/municipality (with proper Philippine naming)
      if (address.municipality) {
        parts.push(formatPhilippineCityName(address.municipality));
      } else if (address.city) {
        parts.push(formatPhilippineCityName(address.city));
      } else if (address.town) {
        parts.push(formatPhilippineCityName(address.town));
      }
      
      // Add province
      if (address.province) {
        parts.push(formatPhilippineProvinceName(address.province));
      } else if (address.state) {
        parts.push(formatPhilippineProvinceName(address.state));
      }
      
      // Always add Philippines
      parts.push('Philippines');
      
      const formattedAddress = parts.join(', ');
      console.log('Formatted address:', formattedAddress);
      return formattedAddress;
    }
    
    // Fallback to coordinates
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Unable to get location details. Please check your internet connection.');
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
