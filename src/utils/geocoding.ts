/**
 * Enhanced geocoding utilities for Wedding Bazaar
 * Provides accurate location mapping for Philippine wedding venues
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

// Cavite cities and municipalities with precise coordinates
const CAVITE_CITIES = [
  { keywords: ['heritage spring homes'], coords: { lat: 14.2306, lng: 120.9856 } }, // Heritage Spring Homes specific
  { keywords: ['purok', 'silang'], coords: { lat: 14.2306, lng: 120.9856 } }, // Purok areas in Silang
  { keywords: ['silang'], coords: { lat: 14.2306, lng: 120.9856 } },
  { keywords: ['dasmariñas', 'dasmarinas'], coords: { lat: 14.3294, lng: 120.9367 } },
  { keywords: ['imus'], coords: { lat: 14.4297, lng: 120.9367 } },
  { keywords: ['bacoor'], coords: { lat: 14.4590, lng: 120.9367 } },
  { keywords: ['tagaytay'], coords: { lat: 14.1039, lng: 120.9572 } },
  { keywords: ['general trias', 'gen trias'], coords: { lat: 14.3869, lng: 120.8819 } },
  { keywords: ['trece martires'], coords: { lat: 14.2856, lng: 120.8661 } },
  { keywords: ['carmona'], coords: { lat: 14.3167, lng: 121.0453 } },
  { keywords: ['kawit'], coords: { lat: 14.4389, lng: 120.9056 } },
  { keywords: ['rosario'], coords: { lat: 14.4167, lng: 120.8583 } },
  { keywords: ['noveleta'], coords: { lat: 14.4244, lng: 120.8839 } },
  { keywords: ['maragondon'], coords: { lat: 14.2750, lng: 120.7350 } },
  { keywords: ['naic'], coords: { lat: 14.3167, lng: 120.7667 } },
  { keywords: ['ternate'], coords: { lat: 14.2833, lng: 120.7167 } },
  { keywords: ['tanza'], coords: { lat: 14.3944, lng: 120.9381 } },
  { keywords: ['alfonso'], coords: { lat: 14.1186, lng: 120.8500 } },
  { keywords: ['amadeo'], coords: { lat: 14.1667, lng: 120.9167 } },
  { keywords: ['indang'], coords: { lat: 14.1944, lng: 120.8769 } },
  { keywords: ['mendez'], coords: { lat: 14.1333, lng: 120.9000 } },
  { keywords: ['magallanes'], coords: { lat: 14.0500, lng: 120.8167 } }
];

// Metro Manila venues and locations
const METRO_MANILA_LOCATIONS: Record<string, Coordinates> = {
  // Metro Manila Hotels & Venues
  'manila hotel': { lat: 14.5995, lng: 120.9842 },
  'makati shangri-la': { lat: 14.5547, lng: 121.0244 },
  'the peninsula manila': { lat: 14.5547, lng: 121.0244 },
  'marco polo ortigas': { lat: 14.5864, lng: 121.0637 },
  'okada manila': { lat: 14.5176, lng: 120.9822 },
  'sofitel philippine plaza': { lat: 14.5547, lng: 121.0244 },
  'solaire resort': { lat: 14.5176, lng: 120.9822 },
  'conrad manila': { lat: 14.5547, lng: 121.0244 },
  'new world makati': { lat: 14.5547, lng: 121.0244 },
  'fairmont makati': { lat: 14.5547, lng: 121.0244 },
  'shangri-la the fort': { lat: 14.5515, lng: 121.0473 },
  'marriott manila': { lat: 14.5547, lng: 121.0244 },
  'hyatt regency manila': { lat: 14.5547, lng: 121.0244 },
  'diamond hotel': { lat: 14.5995, lng: 120.9842 },
  'edsa shangri-la': { lat: 14.5864, lng: 121.0637 },
  
  // City centers and districts
  'quezon city': { lat: 14.6760, lng: 121.0437 },
  'up diliman': { lat: 14.6537, lng: 121.0682 },
  'pasig city': { lat: 14.5864, lng: 121.0637 },
  'ortigas center': { lat: 14.5864, lng: 121.0637 },
  'bonifacio global city': { lat: 14.5515, lng: 121.0473 },
  'bgc': { lat: 14.5515, lng: 121.0473 },
  'taguig': { lat: 14.5515, lng: 121.0473 },
  'makati': { lat: 14.5547, lng: 121.0244 },
  'mandaluyong': { lat: 14.5794, lng: 121.0359 },
  'san juan': { lat: 14.6019, lng: 121.0355 },
  'marikina': { lat: 14.6507, lng: 121.1029 },
  'antipolo': { lat: 14.5932, lng: 121.1780 },
  'paranaque': { lat: 14.4979, lng: 121.0187 },
  'las pinas': { lat: 14.4641, lng: 120.9822 },
  'muntinlupa': { lat: 14.3832, lng: 121.0409 },
  'caloocan': { lat: 14.6488, lng: 120.9673 },
  'malabon': { lat: 14.6570, lng: 120.9568 },
  'navotas': { lat: 14.6691, lng: 120.9468 },
  'valenzuela': { lat: 14.7000, lng: 120.9830 },
  
  // Churches and wedding venues
  'manila cathedral': { lat: 14.5995, lng: 120.9750 },
  'san agustin church': { lat: 14.5892, lng: 120.9750 },
  'malate church': { lat: 14.5729, lng: 120.9794 },
  'blue leaf filipinas': { lat: 14.6537, lng: 121.0682 },
  'fernbrook gardens': { lat: 14.6537, lng: 121.0682 },
  'la vista association': { lat: 14.6537, lng: 121.0682 },
  'white plains': { lat: 14.6537, lng: 121.0682 },
  'eastwood city': { lat: 14.6174, lng: 121.0773 },
  'greenhills': { lat: 14.6034, lng: 121.0514 },
  'alabang': { lat: 14.4198, lng: 121.0317 },
  'ayala triangle': { lat: 14.5547, lng: 121.0244 },
  'greenbelt': { lat: 14.5547, lng: 121.0244 },
  'glorietta': { lat: 14.5547, lng: 121.0244 }
};

// ZIP code mapping
const ZIP_CODE_MAPPING: Record<string, Coordinates> = {
  '4118': { lat: 14.2306, lng: 120.9856 }, // Silang, Cavite
};

// Province defaults
const PROVINCE_DEFAULTS: Record<string, Coordinates> = {
  'cavite': { lat: 14.2456, lng: 120.8792 },
  'laguna': { lat: 14.2691, lng: 121.3465 },
  'batangas': { lat: 13.7565, lng: 121.0583 },
  'rizal': { lat: 14.6037, lng: 121.3084 },
  'quezon': { lat: 14.0832, lng: 121.9189 },
  'manila': { lat: 14.5995, lng: 120.9842 }
};

/**
 * Enhanced geocoding function for accurate venue location mapping
 * @param location - The location string to geocode
 * @returns Coordinates object with lat/lng
 */
export function geocodeLocation(location: string): Coordinates {
  if (!location) {
    return PROVINCE_DEFAULTS.manila; // Default to Manila
  }

  const cleanLocation = location.trim().toLowerCase();
  // PRIORITY 1: Heritage Spring Homes specific matching (most specific first)
  if (cleanLocation.includes('heritage spring homes') || 
      (cleanLocation.includes('heritage') && cleanLocation.includes('spring')) ||
      (cleanLocation.includes('heritage') && cleanLocation.includes('homes'))) {
    return { lat: 14.2306, lng: 120.9856 };
  }

  // PRIORITY 2: ZIP code matching
  for (const [zip, coords] of Object.entries(ZIP_CODE_MAPPING)) {
    if (cleanLocation.includes(zip)) {
      return coords;
    }
  }

  // PRIORITY 3: Cavite cities/municipalities matching
  for (const city of CAVITE_CITIES) {
    if (city.keywords.some(keyword => cleanLocation.includes(keyword))) {
      return city.coords;
    }
  }

  // PRIORITY 4: Metro Manila venue/location matching
  for (const [venue, coords] of Object.entries(METRO_MANILA_LOCATIONS)) {
    if (cleanLocation.includes(venue)) {
      return coords;
    }
  }

  // PRIORITY 5: CALABARZON region with specific indicators
  if (cleanLocation.includes('calabarzon') && 
      (cleanLocation.includes('cavite') || cleanLocation.includes('silang'))) {
    return { lat: 14.2306, lng: 120.9856 };
  }

  // PRIORITY 6: Province-level matching
  for (const [province, coords] of Object.entries(PROVINCE_DEFAULTS)) {
    if (cleanLocation.includes(province)) {
      // Special handling for Cavite to avoid Manila conflicts
      if (province === 'cavite' && !cleanLocation.includes('manila')) {
        return coords;
      } else if (province !== 'cavite') {
        return coords;
      }
    }
  }

  // PRIORITY 7: Address pattern matching (comma-separated parts)
  const addressParts = cleanLocation.split(',').map(part => part.trim());
  if (addressParts.length >= 2) {
    for (const part of addressParts) {
      // Check Cavite cities first
      for (const city of CAVITE_CITIES) {
        if (city.keywords.some(keyword => part.includes(keyword))) {
          return city.coords;
        }
      }
      
      // Check Metro Manila locations
      for (const [venue, coords] of Object.entries(METRO_MANILA_LOCATIONS)) {
        if (part.includes(venue)) {
          return coords;
        }
      }
    }
  }

  // PRIORITY 8: Log unmatched locations for future enhancement
  return PROVINCE_DEFAULTS.manila;
}

/**
 * Validate coordinates to ensure they're within reasonable Philippine bounds
 * @param coords - Coordinates to validate
 * @returns Validated coordinates or Manila default
 */
export function validateCoordinates(coords: Coordinates): Coordinates {
  const { lat, lng } = coords;
  
  // Philippine bounds (approximate)
  const PHILIPPINES_BOUNDS = {
    north: 21.2,
    south: 4.5,
    east: 127.0,
    west: 116.0
  };

  if (lat >= PHILIPPINES_BOUNDS.south && lat <= PHILIPPINES_BOUNDS.north &&
      lng >= PHILIPPINES_BOUNDS.west && lng <= PHILIPPINES_BOUNDS.east) {
    return coords;
  }
  return PROVINCE_DEFAULTS.manila;
}

/**
 * Get readable location name from coordinates (reverse geocoding placeholder)
 * @param coords - Coordinates to reverse geocode
 * @returns Human-readable location name
 */
export function reverseGeocode(coords: Coordinates): string {
  // This is a simple implementation - in production, you'd use a real reverse geocoding API
  const { lat, lng } = coords;
  
  // Check if it matches any known locations
  for (const [venue, venueCoords] of Object.entries(METRO_MANILA_LOCATIONS)) {
    if (Math.abs(venueCoords.lat - lat) < 0.001 && Math.abs(venueCoords.lng - lng) < 0.001) {
      return venue;
    }
  }
  
  for (const city of CAVITE_CITIES) {
    if (Math.abs(city.coords.lat - lat) < 0.001 && Math.abs(city.coords.lng - lng) < 0.001) {
      return city.keywords[0];
    }
  }
  
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
