# WeddingBazaar Map Components

This directory contains all mapping and geolocation components for the WeddingBazaar application, specifically designed for the Philippine market.

## Components

### BusinessLocationMap.tsx
A comprehensive map component for vendor business location selection during registration.

**Features:**
- Interactive Philippines-focused map using OpenStreetMap/Leaflet
- Click-to-select location functionality
- Location search with Philippines-specific results via Nominatim
- Current location detection with geolocation API
- Philippines bounds validation
- Responsive design with mobile support
- Reverse geocoding for address display

**Usage:**
```tsx
import BusinessLocationMap from '../map/BusinessLocationMap';

const [showLocationMap, setShowLocationMap] = useState(false);

const handleLocationSelect = (location: { address: string; coordinates: { lat: number; lng: number } }) => {
  console.log('Selected location:', location);
};

<BusinessLocationMap
  isOpen={showLocationMap}
  onClose={() => setShowLocationMap(false)}
  onLocationSelect={handleLocationSelect}
  title="Select Your Business Location"
  initialLocation={{ lat: 14.5995, lng: 120.9842 }} // Optional
/>
```

## Dependencies
- `leaflet`: Interactive maps
- `react`: UI framework
- `lucide-react`: Icons
- Custom utilities:
  - `../../../utils/geolocation`: Philippines-specific geolocation utilities
  - `../../../hooks/useGeolocation`: React hook for geolocation state management

## Map Features

### Philippines Focus
- Default center: Manila (14.5995, 120.9842)
- Bounds validation to ensure locations are within Philippines
- Country code filtering for search results (`countrycodes=ph`)
- Localized address formatting

### User Interactions
- **Click to Select**: Click anywhere on the map to select a location
- **Search**: Type location names to search within Philippines
- **Current Location**: Use device GPS to auto-detect location
- **Visual Feedback**: Real-time marker placement and address display

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- Clear visual indicators
- Error state handling

## File Structure
```
src/shared/components/map/
├── BusinessLocationMap.tsx     # Main map component
└── index.ts                   # Export barrel
```

## Integration Points

### RegisterModal
The BusinessLocationMap is integrated into the vendor registration flow:
- Map button appears next to the location input field
- Selected addresses automatically populate the form field
- Validation errors are cleared when a location is selected

### Geolocation Utilities
Uses shared utilities for consistent Philippines-focused functionality:
- `isWithinPhilippines()`: Validates coordinates
- `reverseGeocode()`: Converts coordinates to addresses
- `useGeolocation()`: React hook for location state

## Future Enhancements
- Vendor clustering for discovery maps
- Route planning between vendors
- Custom map styles/themes
- Offline map support
- Advanced search filters (city, province, etc.)
- Map analytics and usage tracking
