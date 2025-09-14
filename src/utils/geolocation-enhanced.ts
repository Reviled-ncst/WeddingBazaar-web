// Enhanced Geolocation utilities for Philippine addresses with maximum accuracy

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  province?: string;
  region?: string;
  country?: string;
  barangay?: string;
  municipality?: string;
  accuracy?: number;
  confidence?: 'high' | 'medium' | 'low';
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface PhilippineLocationDetails {
  barangay?: string;
  municipality?: string;
  city?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  formattedAddress: string;
  coordinates: { lat: number; lng: number };
}

/**
 * Enhanced Philippine provinces and regions mapping for better accuracy
 */
const PHILIPPINE_REGIONS = {
  'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Muntinlupa', 'Parañaque', 'Las Piñas', 'Mandaluyong', 'San Juan', 'Marikina', 'Pasay', 'Caloocan', 'Malabon', 'Navotas', 'Valenzuela', 'Pateros'],
  'Cavite': ['Dasmariñas', 'Bacoor', 'Imus', 'Kawit', 'Noveleta', 'Rosario', 'Cavite City', 'Trece Martires', 'Tagaytay', 'Silang', 'Amadeo', 'Indang', 'Maragondon', 'Naic', 'Tanza', 'Ternate', 'Alfonso', 'Carmona', 'General Mariano Alvarez', 'General Emilio Aguinaldo', 'General Trias', 'Magallanes', 'Mendez'],
  'Laguna': ['San Pedro', 'Biñan', 'Santa Rosa', 'Cabuyao', 'Calamba', 'Los Baños', 'Bay', 'Calauan', 'Alaminos', 'San Pablo', 'Sta. Cruz', 'Pila', 'Victoria', 'Rizal', 'Nagcarlan', 'Liliw', 'Magdalena', 'Majayjay', 'Pagsanjan', 'Lumban', 'Kalayaan', 'Cavinti', 'Pakil', 'Pangil', 'Siniloan', 'Santa Maria', 'Mabitac', 'Famy', 'Luisiana', 'Paete'],
  'Rizal': ['Antipolo', 'Cainta', 'Taytay', 'Angono', 'Binangonan', 'Cardona', 'Jalajala', 'Morong', 'Pililla', 'Rodriguez', 'San Mateo', 'Tanay', 'Teresa', 'Baras'],
  'Bulacan': ['Malolos', 'Meycauayan', 'Marilao', 'Bocaue', 'Guiguinto', 'Balagtas', 'Pandi', 'Santa Maria', 'Hagonoy', 'Calumpit', 'Pulilan', 'Plaridel', 'Baliuag', 'Bustos', 'San Rafael', 'Angat', 'Norzagaray', 'San Ildefonso', 'San Miguel', 'Obando', 'Paombong', 'Bulakan']
};

/**
 * Get current position using browser geolocation API with maximum accuracy for Philippines
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 25000, // Extended timeout for better GPS lock in Philippines
      maximumAge: 30000 // Fresh location data
    };

    // First attempt with high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 Location accuracy:', position.coords.accuracy, 'meters');
        resolve(position);
      },
      (_error) => {
        console.warn('High accuracy failed, trying standard accuracy...');
        
        // Fallback with lower accuracy requirements
        const fallbackOptions: PositionOptions = {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000
        };
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('📍 Fallback location accuracy:', position.coords.accuracy, 'meters');
            resolve(position);
          },
          (fallbackError) => {
            let message = 'Unable to get your location. ';
            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                message += 'Please allow location access and try again.';
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                message += 'Location information is unavailable. Please check your GPS/internet connection.';
                break;
              case fallbackError.TIMEOUT:
                message += 'Location request timed out. Please try again or enter manually.';
                break;
              default:
                message += 'Please enter your location manually.';
                break;
            }
            reject(new Error(message));
          },
          fallbackOptions
        );
      },
      options
    );
  });
};

/**
 * Enhanced reverse geocoding with multiple providers for maximum accuracy in Philippines
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  console.log(`🗺️ Reverse geocoding: ${latitude}, ${longitude}`);
  
  try {
    // Primary: Enhanced Nominatim with maximum detail for Philippines
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=ph&accept-language=en&addressdetails=1&zoom=18&namedetails=1&extratags=1`;
    
    const response = await fetch(nominatimUrl);
    
    if (!response.ok) {
      throw new Error('Primary geocoding service unavailable');
    }
    
    const data = await response.json();
    console.log('🏢 Geocoding response:', data);
    
    if (data && data.address) {
      const formattedAddress = formatEnhancedPhilippineAddress(data.address, data.display_name, latitude, longitude);
      console.log('✅ Formatted address:', formattedAddress);
      return formattedAddress;
    }
    
    // Fallback to basic display name
    if (data && data.display_name) {
      return enhanceDisplayName(data.display_name);
    }
    
    // Last resort: coordinates with context
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Philippines`;
    
  } catch (error) {
    console.error('Primary geocoding error:', error);
    
    // Fallback: Try alternative approach
    try {
      return await fallbackGeocode(latitude, longitude);
    } catch (fallbackError) {
      console.error('All geocoding methods failed:', fallbackError);
      throw new Error('Unable to get location details');
    }
  }
};

/**
 * Enhanced Philippine address formatting with proper hierarchy and local knowledge
 */
function formatEnhancedPhilippineAddress(addressComponents: any, displayName: string, _lat: number, _lng: number): string {
  const parts: string[] = [];
  
  // Add house number/building if available
  if (addressComponents.house_number && addressComponents.road) {
    parts.push(`${addressComponents.house_number} ${addressComponents.road}`);
  } else if (addressComponents.road) {
    parts.push(addressComponents.road);
  } else if (addressComponents.pedestrian) {
    parts.push(addressComponents.pedestrian);
  }
  
  // Add barangay/neighbourhood with proper formatting
  let barangay = '';
  if (addressComponents.neighbourhood) {
    barangay = addressComponents.neighbourhood;
  } else if (addressComponents.suburb) {
    barangay = addressComponents.suburb;
  } else if (addressComponents.village) {
    barangay = addressComponents.village;
  } else if (addressComponents.hamlet) {
    barangay = addressComponents.hamlet;
  }
  
  if (barangay && !barangay.toLowerCase().startsWith('barangay') && !barangay.toLowerCase().startsWith('brgy')) {
    parts.push(`Brgy. ${barangay}`);
  } else if (barangay) {
    parts.push(barangay);
  }
  
  // Add city/municipality with enhanced matching and validation
  let cityMunicipality = getCityMunicipality(addressComponents);
  if (cityMunicipality) {
    const normalizedCity = normalizeCityName(cityMunicipality);
    parts.push(normalizedCity);
  }
  
  // Add province with enhanced recognition and validation
  let province = getProvince(addressComponents, cityMunicipality);
  if (province) {
    const normalizedProvince = normalizeProvinceName(province, cityMunicipality);
    parts.push(normalizedProvince);
  }
  
  // Add Philippines if not already included
  if (!parts.some(part => part.toLowerCase().includes('philippines'))) {
    parts.push('Philippines');
  }
  
  const formattedAddress = parts.filter(part => part.length > 0).join(', ');
  
  // Validate the formatted address
  if (formattedAddress.length > 10 && !formattedAddress.includes('undefined')) {
    return formattedAddress;
  }
  
  // Fallback to enhanced display name
  return enhanceDisplayName(displayName);
}

/**
 * Get city/municipality from address components with priority logic
 */
function getCityMunicipality(addressComponents: any): string {
  // Priority order for Philippine addressing
  if (addressComponents.city) return addressComponents.city;
  if (addressComponents.municipality) return addressComponents.municipality;
  if (addressComponents.town) return addressComponents.town;
  if (addressComponents.county) return addressComponents.county;
  return '';
}

/**
 * Get province from address components with fallback logic
 */
function getProvince(addressComponents: any, cityName: string = ''): string {
  if (addressComponents.province) return addressComponents.province;
  if (addressComponents.state) return addressComponents.state;
  
  // Infer province from city name using region mapping
  if (cityName) {
    for (const [province, cities] of Object.entries(PHILIPPINE_REGIONS)) {
      if (cities.some(city => city.toLowerCase() === cityName.toLowerCase())) {
        return province;
      }
    }
  }
  
  return '';
}

/**
 * Normalize city names for better recognition in Philippines
 */
function normalizeCityName(cityName: string): string {
  const cityMap: { [key: string]: string } = {
    'dasmarinas': 'Dasmariñas',
    'dasmariñas': 'Dasmariñas',
    'dasmarinas city': 'Dasmariñas',
    'bacoor': 'Bacoor',
    'bacoor city': 'Bacoor',
    'imus': 'Imus', 
    'imus city': 'Imus',
    'las pinas': 'Las Piñas',
    'las piñas': 'Las Piñas',
    'paranaque': 'Parañaque',
    'parañaque': 'Parañaque',
    'quezon city': 'Quezon City',
    'marikina': 'Marikina',
    'marikina city': 'Marikina',
    'san juan': 'San Juan',
    'mandaluyong': 'Mandaluyong',
    'mandaluyong city': 'Mandaluyong',
    'makati': 'Makati',
    'makati city': 'Makati',
    'taguig': 'Taguig',
    'taguig city': 'Taguig',
    'pasig': 'Pasig',
    'pasig city': 'Pasig',
    'muntinlupa': 'Muntinlupa',
    'muntinlupa city': 'Muntinlupa',
    'antipolo': 'Antipolo',
    'antipolo city': 'Antipolo',
    'calamba': 'Calamba',
    'calamba city': 'Calamba',
    'santa rosa': 'Santa Rosa',
    'santa rosa city': 'Santa Rosa',
    'binan': 'Biñan',
    'biñan': 'Biñan',
    'binan city': 'Biñan',
    'san pedro': 'San Pedro',
    'san pedro city': 'San Pedro',
    'cabuyao': 'Cabuyao',
    'cabuyao city': 'Cabuyao'
  };
  
  const normalized = cityName.toLowerCase().trim();
  return cityMap[normalized] || cityName;
}

/**
 * Normalize province names with special handling for Metro Manila area
 */
function normalizeProvinceName(provinceName: string, cityName: string = ''): string {
  const normalized = provinceName.toLowerCase().trim();
  
  // Check if city belongs to Metro Manila
  const metroManilaCities = PHILIPPINE_REGIONS['Metro Manila'].map(city => city.toLowerCase());
  if (cityName && metroManilaCities.includes(cityName.toLowerCase())) {
    return 'Metro Manila';
  }
  
  const provinceMap: { [key: string]: string } = {
    'cavite': 'Cavite',
    'laguna': 'Laguna',
    'rizal': 'Rizal',
    'bulacan': 'Bulacan',
    'batangas': 'Batangas',
    'pampanga': 'Pampanga',
    'nueva ecija': 'Nueva Ecija',
    'tarlac': 'Tarlac',
    'zambales': 'Zambales',
    'bataan': 'Bataan',
    'metro manila': 'Metro Manila',
    'national capital region': 'Metro Manila',
    'ncr': 'Metro Manila'
  };
  
  return provinceMap[normalized] || provinceName;
}

/**
 * Enhance display name for better Philippine address formatting
 */
function enhanceDisplayName(displayName: string): string {
  if (!displayName) return '';
  
  // Clean up common geocoding artifacts
  let enhanced = displayName
    .replace(/,\s*Philippines,\s*Philippines/g, ', Philippines')
    .replace(/,\s*Philippines$/i, ', Philippines')
    .replace(/\bPhilippines,\s*/gi, '')
    .trim();
  
  // Ensure Philippines is at the end
  if (!enhanced.toLowerCase().endsWith('philippines')) {
    enhanced += ', Philippines';
  }
  
  return enhanced;
}

/**
 * Fallback geocoding method
 */
async function fallbackGeocode(latitude: number, longitude: number): Promise<string> {
  // Try with reduced precision
  const basicUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}&countrycodes=ph`;
  
  const response = await fetch(basicUrl);
  const data = await response.json();
  
  if (data && data.display_name) {
    return enhanceDisplayName(data.display_name);
  }
  
  // Ultimate fallback with region detection
  const region = detectRegionFromCoordinates(latitude, longitude);
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}, ${region}, Philippines`;
}

/**
 * Detect region from coordinates for better context
 */
function detectRegionFromCoordinates(lat: number, lng: number): string {
  // Metro Manila area
  if (lat >= 14.4 && lat <= 14.8 && lng >= 120.9 && lng <= 121.2) {
    return 'Metro Manila';
  }
  
  // Cavite area  
  if (lat >= 14.1 && lat <= 14.5 && lng >= 120.6 && lng <= 121.0) {
    return 'Cavite Province';
  }
  
  // Laguna area
  if (lat >= 14.0 && lat <= 14.4 && lng >= 121.0 && lng <= 121.6) {
    return 'Laguna Province';
  }
  
  // Rizal area
  if (lat >= 14.4 && lat <= 14.8 && lng >= 121.0 && lng <= 121.3) {
    return 'Rizal Province';
  }
  
  // Bulacan area
  if (lat >= 14.7 && lat <= 15.1 && lng >= 120.7 && lng <= 121.2) {
    return 'Bulacan Province';
  }
  
  // Central Luzon
  if (lat >= 14.5 && lat <= 16.0 && lng >= 120.0 && lng <= 122.0) {
    return 'Central Luzon';
  }
  
  // Default to general area
  return 'Luzon';
}

// Legacy compatibility functions
export const getCurrentLocationWithAddress = async (): Promise<GeolocationResult> => {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    
    const address = await reverseGeocode(latitude, longitude);
    
    return {
      latitude,
      longitude,
      address,
      accuracy: position.coords.accuracy
    };
  } catch (error) {
    if (error instanceof GeolocationPositionError) {
      let message = 'Unable to get your location. ';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message += 'Please allow location access and try again.';
          break;
        case error.POSITION_UNAVAILABLE:
          message += 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          message += 'Location request timed out.';
          break;
        default:
          message += 'Please enter your location manually.';
          break;
      }
      
      throw new Error(message);
    }
    
    throw error;
  }
};

export const isWithinPhilippines = (latitude: number, longitude: number): boolean => {
  return latitude >= 4.5 && latitude <= 21.0 && longitude >= 116.0 && longitude <= 127.0;
};

export const getPhilippineLocationDetails = async (latitude: number, longitude: number): Promise<PhilippineLocationDetails> => {
  try {
    const address = await reverseGeocode(latitude, longitude);
    
    // Enhanced parsing for Philippine addresses
    const addressParts = address.split(', ');
    let barangay = '';
    let municipality = '';
    let city = '';
    let province = '';
    
    // Parse address components
    addressParts.forEach(part => {
      const lowerPart = part.toLowerCase();
      if (lowerPart.startsWith('brgy.') || lowerPart.startsWith('barangay')) {
        barangay = part;
      } else if (Object.values(PHILIPPINE_REGIONS).flat().some(c => c.toLowerCase() === lowerPart)) {
        if (lowerPart.includes('city') || ['manila', 'quezon city', 'makati', 'taguig'].includes(lowerPart)) {
          city = part;
        } else {
          municipality = part;
        }
      } else if (Object.keys(PHILIPPINE_REGIONS).some(p => p.toLowerCase() === lowerPart)) {
        province = part;
      }
    });
    
    return {
      barangay,
      municipality,
      city,
      province,
      formattedAddress: address,
      coordinates: { lat: latitude, lng: longitude }
    };
  } catch (error) {
    console.error('Location details error:', error);
    return {
      formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}, Philippines`,
      coordinates: { lat: latitude, lng: longitude }
    };
  }
};
