/**
 * Philippines Geocoding Utilities
 * Enhanced geocoding services optimized for Philippine addresses
 */

export interface PhilippineAddress {
  display_name: string;
  lat: number;
  lon: number;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    province?: string;
    region?: string;
    postcode?: string;
    country: string;
  };
  importance: number;
  place_id: string;
}

export interface GeocodingResult {
  success: boolean;
  address?: PhilippineAddress;
  error?: string;
  suggestions?: PhilippineAddress[];
}

/**
 * Geocode Philippine addresses using Nominatim with Philippines-specific parameters
 */
export async function geocodePhilippineAddress(query: string): Promise<GeocodingResult> {
  try {
    // Clean and prepare the query for Philippines
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return { success: false, error: 'Address query is required' };
    }

    // Add Philippines context if not already specified
    const searchQuery = cleanQuery.toLowerCase().includes('philippines') || 
                       cleanQuery.toLowerCase().includes('ph') ||
                       cleanQuery.toLowerCase().includes('pilipinas')
      ? cleanQuery
      : `${cleanQuery}, Philippines`;

    console.log(`🔍 Geocoding Philippine address: ${searchQuery}`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: searchQuery,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'ph', // Restrict to Philippines
        'accept-language': 'en,tl', // English and Filipino/Tagalog
        dedupe: '1',
        extratags: '1',
        namedetails: '1'
      })
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return { 
        success: false, 
        error: 'No results found. Please check your Philippine address.' 
      };
    }

    // Process results and prioritize by importance and address completeness
    const processedResults: PhilippineAddress[] = data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      address: {
        house_number: item.address?.house_number,
        road: item.address?.road,
        neighbourhood: item.address?.neighbourhood,
        suburb: item.address?.suburb,
        city: item.address?.city || item.address?.municipality,
        municipality: item.address?.municipality,
        province: item.address?.state || item.address?.province,
        region: item.address?.region,
        postcode: item.address?.postcode,
        country: item.address?.country || 'Philippines'
      },
      importance: parseFloat(item.importance || '0'),
      place_id: item.place_id || item.osm_id
    }));

    // Sort by importance (higher is better)
    processedResults.sort((a, b) => b.importance - a.importance);

    return {
      success: true,
      address: processedResults[0],
      suggestions: processedResults.slice(1, 3) // Include top 2 alternatives
    };

  } catch (error) {
    console.error('Philippines geocoding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Geocoding failed'
    };
  }
}

/**
 * Reverse geocode coordinates to get Philippine address
 */
export async function reverseGeocodePhilippines(lat: number, lon: number): Promise<GeocodingResult> {
  try {
    console.log(`🔍 Reverse geocoding Philippines coordinates: ${lat}, ${lon}`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'en,tl',
        zoom: '16' // Good detail level for Philippines
      })
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.display_name) {
      return { 
        success: false, 
        error: 'No address found for these coordinates in Philippines' 
      };
    }

    const address: PhilippineAddress = {
      display_name: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      address: {
        house_number: data.address?.house_number,
        road: data.address?.road,
        neighbourhood: data.address?.neighbourhood,
        suburb: data.address?.suburb,
        city: data.address?.city || data.address?.municipality,
        municipality: data.address?.municipality,
        province: data.address?.state || data.address?.province,
        region: data.address?.region,
        postcode: data.address?.postcode,
        country: data.address?.country || 'Philippines'
      },
      importance: parseFloat(data.importance || '0'),
      place_id: data.place_id || data.osm_id
    };

    return {
      success: true,
      address
    };

  } catch (error) {
    console.error('Philippines reverse geocoding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Reverse geocoding failed'
    };
  }
}

/**
 * Format Philippine address for display
 */
export function formatPhilippineAddress(address: PhilippineAddress['address']): string {
  const parts: string[] = [];

  // House number and road
  if (address.house_number && address.road) {
    parts.push(`${address.house_number} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }

  // Neighbourhood or suburb
  if (address.neighbourhood) {
    parts.push(address.neighbourhood);
  } else if (address.suburb) {
    parts.push(address.suburb);
  }

  // City/Municipality
  if (address.city) {
    parts.push(address.city);
  } else if (address.municipality) {
    parts.push(address.municipality);
  }

  // Province
  if (address.province) {
    parts.push(address.province);
  }

  // Postal code
  if (address.postcode) {
    parts.push(address.postcode);
  }

  // Always add Philippines
  if (!parts.some(part => part.toLowerCase().includes('philippines'))) {
    parts.push('Philippines');
  }

  return parts.join(', ');
}

/**
 * Validate if coordinates are within Philippines bounds
 */
export function isWithinPhilippines(lat: number, lon: number): boolean {
  // Philippines bounding box (approximate)
  const bounds = {
    north: 21.0, // Batanes
    south: 4.5,  // Tawi-Tawi
    east: 127.0, // Eastern Mindanao
    west: 116.0  // Western Palawan
  };

  return lat >= bounds.south && 
         lat <= bounds.north && 
         lon >= bounds.west && 
         lon <= bounds.east;
}

/**
 * Get Philippine timezone info
 */
export function getPhilippineTimezone() {
  return {
    timezone: 'Asia/Manila',
    offset: '+08:00',
    name: 'Philippine Standard Time (PST)'
  };
}

/**
 * Convert coordinates to different formats commonly used in Philippines
 */
export function formatCoordinatesPhilippines(lat: number, lon: number) {
  return {
    decimal: {
      lat: lat.toFixed(6),
      lon: lon.toFixed(6)
    },
    dms: {
      lat: convertToDMS(lat, 'lat'),
      lon: convertToDMS(lon, 'lon')
    },
    utm: getUTMZonePhilippines(lat, lon)
  };
}

function convertToDMS(coord: number, type: 'lat' | 'lon'): string {
  const abs = Math.abs(coord);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  const seconds = ((abs - degrees) * 60 - minutes) * 60;
  
  const direction = type === 'lat' 
    ? (coord >= 0 ? 'N' : 'S')
    : (coord >= 0 ? 'E' : 'W');
  
  return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
}

function getUTMZonePhilippines(lat: number, lon: number): string {
  // Philippines spans UTM zones 50N and 51N
  const zone = Math.floor((lon + 180) / 6) + 1;
  const hemisphere = lat >= 0 ? 'N' : 'S';
  return `${zone}${hemisphere}`;
}

/**
 * Common Philippine location search suggestions
 */
export const philippineLocationSuggestions = [
  'Manila, Metro Manila',
  'Quezon City, Metro Manila',
  'Makati, Metro Manila',
  'Taguig, Metro Manila',
  'Pasig, Metro Manila',
  'Cebu City, Central Visayas',
  'Davao City, Mindanao',
  'Iloilo City, Western Visayas',
  'Baguio City, Cordillera',
  'Tagaytay, Cavite',
  'Boracay, Aklan',
  'El Nido, Palawan',
  'Bohol, Central Visayas',
  'Siargao, Mindanao'
];
