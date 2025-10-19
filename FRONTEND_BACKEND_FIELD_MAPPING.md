# Frontend-Backend Service Field Mapping

## Complete Field Reference for Services

This document provides a comprehensive mapping between frontend and backend service fields, including all DSS (Dynamic Service Scoring) fields that were added to support enhanced vendor capabilities.

---

## Backend Database Schema (services table)

### Core Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Auto-generated (SRV-XXXXX format) |
| `vendor_id` | string | Yes | Reference to vendors table |
| `title` | string | Yes | Service name/title |
| `description` | text | No | Service description |
| `category` | string | Yes | Service category (Photography, Planning, etc.) |
| `price` | numeric | No | Base price |
| `location` | string | No | Service location |
| `images` | text[] | No | Array of image URLs |
| `featured` | boolean | No | Featured service flag (default: false) |
| `is_active` | boolean | No | Active status (default: true) |
| `created_at` | timestamp | Auto | Creation timestamp |
| `updated_at` | timestamp | Auto | Last update timestamp |

### Optional Extended Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `price_range` | string | No | Price range description |
| `features` | text[] | No | Array of service features |
| `contact_info` | jsonb | No | Contact information object |
| `tags` | text[] | No | Search tags |
| `keywords` | string | No | Search keywords |
| `location_coordinates` | jsonb | No | GPS coordinates |
| `location_details` | jsonb | No | Detailed location info |

### DSS Fields (Dynamic Service Scoring)
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `years_in_business` | integer | No | Years of experience | 5, 10, 15 |
| `service_tier` | string | No | Service tier level | 'premium', 'standard', 'basic' |
| `wedding_styles` | text[] | No | Wedding style specialties | ['modern', 'traditional', 'rustic'] |
| `cultural_specialties` | text[] | No | Cultural expertise | ['indian', 'chinese', 'western'] |
| `availability` | string | No | Availability status | 'available', 'limited', 'booked' |

---

## Backend API Response Format

### POST /api/services Response
```json
{
  "success": true,
  "message": "Service created successfully",
  "service": {
    "id": "SRV-00123",
    "vendor_id": "USR-00456",
    "title": "Premium Wedding Photography",
    "description": "Professional wedding photography services",
    "category": "Photography",
    "price": 2500.00,
    "location": "New York, NY",
    "images": ["url1", "url2"],
    "featured": false,
    "is_active": true,
    "years_in_business": 10,
    "service_tier": "premium",
    "wedding_styles": ["modern", "traditional"],
    "cultural_specialties": ["indian", "chinese"],
    "availability": "available",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/services Response
```json
{
  "success": true,
  "services": [
    {
      "id": "SRV-00123",
      "vendor_id": "USR-00456",
      "title": "Premium Wedding Photography",
      // ... all fields as above
    }
  ]
}
```

---

## Frontend Interface Updates Required

### Current VendorServices.tsx Interface (INCOMPLETE)
```typescript
interface Service {
  id: string;
  vendorId: string;
  vendor_id?: string;
  name: string;
  title?: string;
  description: string;
  category: string;
  price: string;
  imageUrl?: string | null;
  images?: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  is_active?: boolean;
  featured: boolean;
  // ... missing DSS fields
}
```

### Updated VendorServices.tsx Interface (COMPLETE)
```typescript
interface Service {
  // Core identifiers
  id: string;
  vendorId?: string;
  vendor_id: string;
  
  // Basic info (both naming conventions supported)
  title: string;
  name?: string;
  description: string;
  category: string;
  
  // Pricing
  price?: number | string;
  price_range?: string;
  
  // Location
  location?: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
  location_details?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  
  // Media
  images?: string[];
  imageUrl?: string;
  gallery?: string[];
  
  // Status flags (both naming conventions)
  isActive?: boolean;
  is_active: boolean;
  featured: boolean;
  
  // Vendor info
  vendor_name?: string;
  
  // Rating/Reviews
  rating?: number;
  reviewCount?: number;
  review_count?: number;
  
  // Features
  features?: string[];
  tags?: string[];
  keywords?: string;
  
  // Contact
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // DSS Fields (NEW)
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}
```

### Current Services_Centralized.tsx Interface (INCOMPLETE)
```typescript
interface Service {
  id: string;
  title?: string;
  name: string;
  category: string;
  vendor_id: string;
  vendorId: string;
  vendorName: string;
  vendorImage: string;
  description: string;
  price?: number;
  priceRange: string;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  gallery: string[];
  features: string[];
  is_active: boolean;
  availability: boolean; // This field exists but is boolean, should be string
  featured: boolean;
  created_at: string;
  updated_at: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  // ... missing DSS fields (years_in_business, service_tier, wedding_styles, cultural_specialties)
}
```

### Updated Services_Centralized.tsx Interface (COMPLETE)
```typescript
interface Service {
  // Core identifiers
  id: string;
  vendor_id: string;
  vendorId: string;
  
  // Names (both conventions)
  title?: string;
  name: string;
  
  // Vendor details
  vendorName: string;
  vendorImage: string;
  
  // Basic info
  description: string;
  category: string;
  location: string;
  
  // Pricing
  price?: number;
  priceRange: string;
  
  // Media
  image: string;
  images: string[];
  gallery: string[];
  
  // Features
  features: string[];
  tags?: string[];
  keywords?: string;
  
  // Status
  is_active: boolean;
  featured: boolean;
  
  // Rating
  rating: number;
  reviewCount: number;
  
  // Contact
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  
  // DSS Fields (NEW)
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability: string; // Changed from boolean to string
  
  // Timestamps
  created_at: string;
  updated_at: string;
}
```

---

## Field Naming Conventions

### Backend (Database/API)
- Uses **snake_case**: `vendor_id`, `is_active`, `years_in_business`
- Arrays stored as PostgreSQL text[] or jsonb
- Booleans are true PostgreSQL booleans

### Frontend (TypeScript)
- Uses **camelCase**: `vendorId`, `isActive`, `yearsInBusiness`
- Some components accept both for compatibility: `vendor_id` and `vendorId`
- Arrays are TypeScript string[]
- Objects use TypeScript interfaces

### Compatibility Layer
Both frontend components currently accept both naming conventions:
```typescript
const finalVendorId = service.vendor_id || service.vendorId;
const finalTitle = service.title || service.name;
const finalIsActive = service.is_active ?? service.isActive;
```

---

## DSS Field Details

### years_in_business
- **Type**: integer
- **Purpose**: Experience level for vendor scoring
- **Range**: 0-50+ years
- **Display**: "X years of experience"
- **Used in**: Vendor reputation scoring, search ranking

### service_tier
- **Type**: string enum
- **Values**: 'premium', 'standard', 'basic'
- **Purpose**: Service quality tier
- **Display**: Badge/icon with tier name
- **Used in**: Filtering, pricing estimation, recommendations

### wedding_styles
- **Type**: string[] (array)
- **Values**: 'modern', 'traditional', 'rustic', 'bohemian', 'vintage', 'glamorous', 'minimalist', etc.
- **Purpose**: Style specialization filtering
- **Display**: Pill badges or checkboxes
- **Used in**: Style-based search, recommendations

### cultural_specialties
- **Type**: string[] (array)
- **Values**: 'indian', 'chinese', 'jewish', 'muslim', 'hispanic', 'african', 'western', etc.
- **Purpose**: Cultural expertise filtering
- **Display**: Flag icons or text badges
- **Used in**: Cultural preference matching, specialized search

### availability
- **Type**: string
- **Values**: 'available', 'limited', 'booked', 'seasonal'
- **Purpose**: Current booking status
- **Display**: Status badge with color coding
- **Used in**: Real-time availability filtering

---

## Common Field Issues & Fixes

### Issue 1: Array Double-Encoding
**Problem**: Arrays were being JSON.stringified twice
```javascript
// ❌ WRONG (old code)
images: JSON.stringify(images)

// ✅ CORRECT (fixed)
images: Array.isArray(images) ? images : []
```

### Issue 2: Missing Service ID
**Problem**: Service IDs were not auto-generated
```javascript
// ✅ FIXED: Auto-generate IDs
const countResult = await sql`SELECT COUNT(*) as count FROM services`;
const serviceCount = parseInt(countResult[0].count) + 1;
const serviceId = `SRV-${serviceCount.toString().padStart(5, '0')}`;
```

### Issue 3: Field Name Inconsistency
**Problem**: Frontend used `vendorId`, backend used `vendor_id`
```javascript
// ✅ SOLUTION: Accept both
const finalVendorId = vendor_id || vendorId;
```

### Issue 4: Missing DSS Fields in Frontend
**Problem**: Frontend interfaces didn't include DSS fields
```typescript
// ✅ SOLUTION: Add to interfaces
interface Service {
  // ... existing fields
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability?: string;
}
```

---

## Testing Checklist

### Backend Tests
- [x] POST /api/services with all fields
- [x] POST /api/services with only required fields
- [x] POST /api/services with DSS fields
- [x] POST /api/services with array fields (no double-encoding)
- [x] GET /api/services returns all fields
- [x] PUT /api/services/:id updates all fields

### Frontend Tests
- [ ] VendorServices.tsx displays all service fields
- [ ] VendorServices.tsx displays DSS fields (years, tier, styles)
- [ ] Services_Centralized.tsx shows all fields in cards
- [ ] Services_Centralized.tsx filters work with DSS fields
- [ ] AddServiceForm includes DSS field inputs
- [ ] Service detail modals show all fields
- [ ] Array fields display correctly (not as JSON strings)

---

## Migration Notes

### For Existing Services
If services exist without DSS fields, they will have `null` values:
```sql
SELECT 
  id, title, 
  years_in_business,  -- May be NULL for old services
  service_tier,       -- May be NULL for old services
  wedding_styles,     -- May be NULL for old services
  cultural_specialties -- May be NULL for old services
FROM services;
```

Frontend should handle null/undefined gracefully:
```typescript
{service.years_in_business && (
  <span>{service.years_in_business} years experience</span>
)}

{service.wedding_styles?.length > 0 && (
  <div>Styles: {service.wedding_styles.join(', ')}</div>
)}
```

---

## Next Steps

1. ✅ Update VendorServices.tsx interface to include DSS fields
2. ✅ Update Services_Centralized.tsx interface to include DSS fields
3. ✅ Add DSS field display in service cards
4. ✅ Add DSS field filters (if applicable)
5. ✅ Update AddServiceForm to include DSS field inputs
6. ✅ Test end-to-end service creation with all fields
7. ✅ Verify DSS fields display correctly in UI
8. ✅ Document any UI/UX patterns for DSS fields

---

**Last Updated**: 2024-01-15
**Status**: Backend complete, frontend updates in progress
