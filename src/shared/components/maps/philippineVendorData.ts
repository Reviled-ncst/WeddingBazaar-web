import type { VendorLocation } from './VendorMap';

/**
 * Sample wedding vendor locations in major Philippine cities
 * Coordinates are accurate for real locations in the Philippines
 */
export const philippineVendorLocations: VendorLocation[] = [
  // Manila Metro Area
  {
    id: 'ph-vendor-001',
    name: 'Manila Bay Wedding Photography',
    category: 'Photography',
    latitude: 14.5964,
    longitude: 120.9814,
    address: 'Malate, Manila, Metro Manila, Philippines',
    phone: '+63 917 123 4567',
    website: 'https://manilabaywideding.ph',
    rating: 4.8,
    reviewCount: 127,
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop',
    description: 'Capturing love stories against Manila Bay\'s stunning sunset backdrop. Professional wedding photography with a Filipino touch.',
    priceRange: '₱80,000 - ₱150,000'
  },
  {
    id: 'ph-vendor-002',
    name: 'Intramuros Heritage Weddings',
    category: 'Wedding Planning',
    latitude: 14.5906,
    longitude: 120.9740,
    address: 'Intramuros, Manila, Metro Manila, Philippines',
    phone: '+63 917 234 5678',
    website: 'https://intramurosweddings.ph',
    rating: 4.9,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
    description: 'Historic charm meets modern elegance. Expert wedding planning in Manila\'s most romantic locations.',
    priceRange: '₱120,000 - ₱300,000'
  },
  {
    id: 'ph-vendor-003',
    name: 'BGC Premier Catering',
    category: 'Catering',
    latitude: 14.5515,
    longitude: 121.0436,
    address: 'Bonifacio Global City, Taguig, Metro Manila, Philippines',
    phone: '+63 917 345 6789',
    website: 'https://bgcpremier.ph',
    rating: 4.7,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    description: 'Filipino fusion cuisine with international flair. Farm-to-table ingredients sourced from Luzon\'s finest farms.',
    priceRange: '₱2,500 - ₱5,000/guest'
  },
  
  // Quezon City
  {
    id: 'ph-vendor-004',
    name: 'UP Diliman Garden Florist',
    category: 'Florist',
    latitude: 14.6537,
    longitude: 121.0685,
    address: 'UP Campus, Diliman, Quezon City, Metro Manila, Philippines',
    phone: '+63 917 456 7890',
    website: 'https://updilimangarden.ph',
    rating: 4.6,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=300&fit=crop',
    description: 'Tropical blooms and native Philippine flowers. Sustainable floristry with sampaguita, ilang-ilang, and exotic orchids.',
    priceRange: '₱30,000 - ₱80,000'
  },
  
  // Makati
  {
    id: 'ph-vendor-005',
    name: 'Makati Jazz & Acoustic',
    category: 'Music',
    latitude: 14.5548,
    longitude: 121.0244,
    address: 'Salcedo Village, Makati, Metro Manila, Philippines',
    phone: '+63 917 567 8901',
    website: 'https://makatijazz.ph',
    rating: 4.8,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    description: 'Live bands specializing in Filipino love songs, jazz standards, and acoustic performances for intimate weddings.',
    priceRange: '₱50,000 - ₱120,000'
  },
  
  // Cebu City
  {
    id: 'ph-vendor-006',
    name: 'Cebu Heritage Wedding Studio',
    category: 'Photography',
    latitude: 10.3157,
    longitude: 123.8854,
    address: 'Colon Street, Cebu City, Central Visayas, Philippines',
    phone: '+63 917 678 9012',
    website: 'https://cebuheritage.ph',
    rating: 4.9,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    description: 'Documenting love stories in Cebu\'s historic landmarks. Temple of Leah, Sirao Flower Garden, and beach destinations.',
    priceRange: '₱60,000 - ₱120,000'
  },
  
  // Boracay, Aklan
  {
    id: 'ph-vendor-007',
    name: 'Boracay Beach Weddings',
    category: 'Wedding Planning',
    latitude: 11.9674,
    longitude: 121.9248,
    address: 'White Beach, Boracay Island, Malay, Aklan, Philippines',
    phone: '+63 917 789 0123',
    website: 'https://boracaybeach.ph',
    rating: 4.8,
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&h=300&fit=crop',
    description: 'Sunset beach ceremonies on world-famous White Beach. Complete destination wedding packages with resort coordination.',
    priceRange: '₱200,000 - ₱500,000'
  },
  
  // Baguio City
  {
    id: 'ph-vendor-008',
    name: 'Baguio Mountain Catering',
    category: 'Catering',
    latitude: 16.4023,
    longitude: 120.5960,
    address: 'Session Road, Baguio City, Cordillera Administrative Region, Philippines',
    phone: '+63 917 890 1234',
    website: 'https://baguiomountain.ph',
    rating: 4.7,
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    description: 'Cool mountain venue catering specializing in Cordillera cuisine and farm-fresh ingredients from Benguet.',
    priceRange: '₱2,000 - ₱4,000/guest'
  },
  
  // Davao City
  {
    id: 'ph-vendor-009',
    name: 'Davao Durian & Orchids Florist',
    category: 'Florist',
    latitude: 7.0731,
    longitude: 125.6128,
    address: 'Bajada, Davao City, Davao del Sur, Mindanao, Philippines',
    phone: '+63 917 901 2345',
    website: 'https://davaodurian.ph',
    rating: 4.6,
    reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1490736519003-c2d9d2c2f644?w=400&h=300&fit=crop',
    description: 'Mindanao\'s exotic blooms including rare orchids, bird of paradise, and tropical arrangements unique to the South.',
    priceRange: '₱25,000 - ₱70,000'
  },
  
  // Palawan - El Nido
  {
    id: 'ph-vendor-010',
    name: 'El Nido Island Weddings',
    category: 'Wedding Planning',
    latitude: 11.1949,
    longitude: 119.4103,
    address: 'Bacuit Bay, El Nido, Palawan, MIMAROPA, Philippines',
    phone: '+63 917 012 3456',
    website: 'https://elnidoisland.ph',
    rating: 4.9,
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1470905906913-e08dcc1c5dcc?w=400&h=300&fit=crop',
    description: 'Limestone cliff ceremonies with crystal-clear lagoons. Remote island weddings in one of Philippines\' most beautiful destinations.',
    priceRange: '₱300,000 - ₱800,000'
  },
  
  // Iloilo City
  {
    id: 'ph-vendor-011',
    name: 'Iloilo Heritage Acoustic Band',
    category: 'Music',
    latitude: 10.7202,
    longitude: 122.5621,
    address: 'Calle Real, Iloilo City, Western Visayas, Philippines',
    phone: '+63 917 123 4567',
    website: 'https://iloiloheritage.ph',
    rating: 4.7,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
    description: 'Traditional Filipino folk music with modern arrangements. Specializing in Hiligaynon love songs and Spanish-era classics.',
    priceRange: '₱40,000 - ₱90,000'
  },
  
  // Tagaytay
  {
    id: 'ph-vendor-012',
    name: 'Taal Vista Weddings',
    category: 'Venue',
    latitude: 14.1092,
    longitude: 120.9608,
    address: 'Taal Vista Hotel, Tagaytay Ridge, Cavite, Philippines',
    phone: '+63 917 234 5678',
    website: 'https://taalvista.ph',
    rating: 4.8,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
    description: 'Breathtaking Taal Lake and volcano views. Cool mountain climate perfect for outdoor ceremonies with Manila accessibility.',
    priceRange: '₱150,000 - ₱400,000'
  }
];

/**
 * Get vendors by region
 */
export const getVendorsByRegion = (region: string): VendorLocation[] => {
  const regionMap: { [key: string]: string[] } = {
    'Metro Manila': ['ph-vendor-001', 'ph-vendor-002', 'ph-vendor-003', 'ph-vendor-004', 'ph-vendor-005'],
    'Central Visayas': ['ph-vendor-006'],
    'Western Visayas': ['ph-vendor-007', 'ph-vendor-011'],
    'Cordillera': ['ph-vendor-008'],
    'Mindanao': ['ph-vendor-009'],
    'MIMAROPA': ['ph-vendor-010'],
    'Calabarzon': ['ph-vendor-012']
  };
  
  const vendorIds = regionMap[region] || [];
  return philippineVendorLocations.filter(vendor => vendorIds.includes(vendor.id));
};

/**
 * Get vendors by category
 */
export const getVendorsByCategory = (category: string): VendorLocation[] => {
  return philippineVendorLocations.filter(vendor => 
    vendor.category.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Get vendors within radius of coordinates (in kilometers)
 */
export const getVendorsNearLocation = (
  lat: number, 
  lng: number, 
  radiusKm: number = 50
): VendorLocation[] => {
  return philippineVendorLocations.filter(vendor => {
    const distance = calculateDistance(lat, lng, vendor.latitude, vendor.longitude);
    return distance <= radiusKm;
  });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Philippine regions data for filtering
 */
export const philippineRegions = [
  'Metro Manila',
  'Central Visayas', 
  'Western Visayas',
  'Cordillera',
  'Mindanao',
  'MIMAROPA',
  'Calabarzon'
];

/**
 * Major Philippine cities with coordinates
 */
export const philippineCities = [
  { name: 'Manila', lat: 14.5995, lng: 120.9842, region: 'Metro Manila' },
  { name: 'Cebu City', lat: 10.3157, lng: 123.8854, region: 'Central Visayas' },
  { name: 'Davao City', lat: 7.0731, lng: 125.6128, region: 'Mindanao' },
  { name: 'Iloilo City', lat: 10.7202, lng: 122.5621, region: 'Western Visayas' },
  { name: 'Baguio City', lat: 16.4023, lng: 120.5960, region: 'Cordillera' },
  { name: 'Tagaytay', lat: 14.1092, lng: 120.9608, region: 'Calabarzon' },
  { name: 'Boracay', lat: 11.9674, lng: 121.9248, region: 'Western Visayas' },
  { name: 'El Nido', lat: 11.1949, lng: 119.4103, region: 'MIMAROPA' }
];
