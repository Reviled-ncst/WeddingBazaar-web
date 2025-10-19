# Frontend-Backend Field Alignment - Quick Reference

## Service Field Comparison

| Field Name | Backend (Database) | Frontend (VendorServices) | Frontend (Services_Centralized) | AddServiceForm | Status |
|------------|-------------------|---------------------------|--------------------------------|----------------|--------|
| **Core Fields** |
| `id` | ✅ string (auto-gen) | ✅ string | ✅ string | ✅ string | ✅ Aligned |
| `vendor_id` | ✅ string (required) | ✅ string (required) | ✅ string (required) | ✅ string | ✅ Aligned |
| `vendorId` | - | ✅ string (optional) | ✅ string (optional) | - | ✅ Compat layer |
| `title` | ✅ string | ✅ string (optional) | ✅ string (optional) | ✅ string | ✅ Aligned |
| `name` | - | ✅ string | ✅ string | - | ✅ Compat layer |
| `description` | ✅ text | ✅ string | ✅ string | ✅ string | ✅ Aligned |
| `category` | ✅ string | ✅ string | ✅ string | ✅ string | ✅ Aligned |
| **Pricing** |
| `price` | ✅ numeric | ✅ number \| string | ✅ number | ✅ number | ✅ Aligned |
| `price_range` | ✅ string | ✅ string (optional) | ✅ string | ✅ string | ✅ Aligned |
| **Location** |
| `location` | ✅ string | ✅ string (optional) | ✅ string | ✅ string | ✅ Aligned |
| **Media** |
| `images` | ✅ text[] | ✅ string[] | ✅ string[] | ✅ string[] | ✅ Aligned |
| `gallery` | - | ✅ string[] | ✅ string[] | - | ✅ Frontend only |
| **Status** |
| `is_active` | ✅ boolean | ✅ boolean | ✅ boolean | ✅ boolean | ✅ Aligned |
| `featured` | ✅ boolean | ✅ boolean | ✅ boolean | ✅ boolean | ✅ Aligned |
| **Features** |
| `features` | ✅ text[] | ✅ string[] | ✅ string[] | ✅ string[] | ✅ Aligned |
| `tags` | ✅ text[] | ✅ string[] (optional) | ✅ string[] (optional) | ✅ string[] | ✅ Aligned |
| `keywords` | ✅ string | ✅ string (optional) | ✅ string (optional) | ✅ string | ✅ Aligned |
| **Contact** |
| `contact_info` | ✅ jsonb | ✅ object (optional) | ✅ object (required) | ✅ object | ✅ Aligned |
| **DSS Fields** |
| `years_in_business` | ✅ integer | ✅ number (optional) | ✅ number (optional) | ✅ number | ✅ **NEW** ✨ |
| `service_tier` | ✅ string | ✅ 'premium' \| 'standard' \| 'basic' | ✅ 'premium' \| 'standard' \| 'basic' | ✅ enum | ✅ **NEW** ✨ |
| `wedding_styles` | ✅ text[] | ✅ string[] (optional) | ✅ string[] (optional) | ✅ string[] | ✅ **NEW** ✨ |
| `cultural_specialties` | ✅ text[] | ✅ string[] (optional) | ✅ string[] (optional) | ✅ string[] | ✅ **NEW** ✨ |
| `availability` | ✅ string | ✅ string (optional) | ✅ string (required) | ✅ string \| object | ✅ **NEW** ✨ |
| **Timestamps** |
| `created_at` | ✅ timestamp | ✅ string (optional) | ✅ string (required) | ✅ string | ✅ Aligned |
| `updated_at` | ✅ timestamp | ✅ string (optional) | ✅ string (required) | ✅ string | ✅ Aligned |

---

## What Changed? 🔄

### Before (Missing DSS Fields) ❌
```typescript
interface Service {
  id: string;
  vendor_id: string;
  title: string;
  category: string;
  price: number;
  images: string[];
  is_active: boolean;
  // ❌ Missing: years_in_business
  // ❌ Missing: service_tier
  // ❌ Missing: wedding_styles
  // ❌ Missing: cultural_specialties
  // ❌ Missing: availability (or wrong type)
}
```

### After (Complete with DSS Fields) ✅
```typescript
interface Service {
  id: string;
  vendor_id: string;
  title: string;
  category: string;
  price: number;
  images: string[];
  is_active: boolean;
  // ✅ NEW DSS Fields
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability: string;
}
```

---

## Service Tier Values Update 🎯

### Before (Capitalized) ❌
```typescript
service_tier: 'Basic' | 'Premium' | 'Luxury'
```
**Problem**: Didn't match backend lowercase values

### After (Lowercase) ✅
```typescript
service_tier: 'premium' | 'standard' | 'basic'
```
**Solution**: Matches backend exactly

### UI Display
```typescript
// Store lowercase, display capitalized
const tierDisplay = {
  'basic': 'Basic',
  'standard': 'Standard', 
  'premium': 'Premium'
};
```

---

## Availability Type Update 🔄

### Before (Boolean) ❌
```typescript
availability: boolean
```
**Problem**: Backend stores as string

### After (String) ✅
```typescript
availability: string  // 'available', 'limited', 'booked', 'seasonal'
```

### Conversion for Booking
```typescript
// Convert string to boolean when needed
const isAvailable = service.availability === 'available';
```

---

## How DSS Fields Are Used

### 1. years_in_business 📅
```typescript
// Display
{service.years_in_business && (
  <span className="badge">
    {service.years_in_business} years experience
  </span>
)}

// Filter
services.filter(s => s.years_in_business >= 5)

// Sort
services.sort((a, b) => 
  (b.years_in_business || 0) - (a.years_in_business || 0)
)
```

### 2. service_tier 💎
```typescript
// Display
const tierBadge = {
  'basic': { color: 'blue', icon: '⚡', label: 'Basic' },
  'standard': { color: 'purple', icon: '✨', label: 'Standard' },
  'premium': { color: 'amber', icon: '💎', label: 'Premium' }
};

// Filter
services.filter(s => s.service_tier === 'premium')

// Sort (premium first)
const tierRank = { 'premium': 3, 'standard': 2, 'basic': 1 };
services.sort((a, b) => 
  tierRank[b.service_tier] - tierRank[a.service_tier]
)
```

### 3. wedding_styles 🎨
```typescript
// Display
{service.wedding_styles?.map(style => (
  <span key={style} className="pill">
    {style}
  </span>
))}

// Filter
services.filter(s => 
  s.wedding_styles?.includes('modern')
)

// Search
services.filter(s =>
  s.wedding_styles?.some(style => 
    style.toLowerCase().includes(searchTerm)
  )
)
```

### 4. cultural_specialties 🌍
```typescript
// Display with icons
const culturalIcons = {
  'indian': '🇮🇳',
  'chinese': '🇨🇳',
  'jewish': '✡️',
  'muslim': '☪️',
  'western': '🌟'
};

// Filter
services.filter(s =>
  s.cultural_specialties?.includes('indian')
)
```

### 5. availability 📊
```typescript
// Display with color
const availabilityStyle = {
  'available': 'bg-green-100 text-green-800',
  'limited': 'bg-yellow-100 text-yellow-800',
  'booked': 'bg-red-100 text-red-800',
  'seasonal': 'bg-blue-100 text-blue-800'
};

// Filter
services.filter(s => s.availability === 'available')
```

---

## API Request/Response Examples

### Creating a Service with DSS Fields

**Request**:
```javascript
POST /api/services
{
  "vendor_id": "USR-00123",
  "title": "Premium Wedding Photography",
  "category": "Photography",
  "description": "Professional wedding photography",
  "price": 2500,
  "images": ["url1", "url2"],
  "years_in_business": 10,
  "service_tier": "premium",
  "wedding_styles": ["modern", "traditional", "rustic"],
  "cultural_specialties": ["indian", "chinese"],
  "availability": "available"
}
```

**Response**:
```javascript
{
  "success": true,
  "message": "Service created successfully",
  "service": {
    "id": "SRV-00456",
    "vendor_id": "USR-00123",
    "title": "Premium Wedding Photography",
    "category": "Photography",
    "price": 2500,
    "years_in_business": 10,
    "service_tier": "premium",
    "wedding_styles": ["modern", "traditional", "rustic"],
    "cultural_specialties": ["indian", "chinese"],
    "availability": "available",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Testing DSS Fields

### 1. Create Service
```javascript
// Test all DSS fields are saved
const service = await createService({
  title: "Test Service",
  category: "Photography",
  years_in_business: 10,
  service_tier: "premium",
  wedding_styles: ["modern"],
  cultural_specialties: ["indian"],
  availability: "available"
});

console.assert(service.years_in_business === 10);
console.assert(service.service_tier === "premium");
console.assert(Array.isArray(service.wedding_styles));
```

### 2. Display Service
```javascript
// Test DSS fields display correctly
const ServiceCard = ({ service }) => (
  <div>
    {service.years_in_business && (
      <Badge>{service.years_in_business} years</Badge>
    )}
    {service.service_tier && (
      <Badge>{tierLabels[service.service_tier]}</Badge>
    )}
  </div>
);
```

### 3. Filter Services
```javascript
// Test filtering by DSS fields
const premiumServices = services.filter(s => 
  s.service_tier === 'premium'
);

const experiencedVendors = services.filter(s =>
  s.years_in_business >= 10
);

const modernStyles = services.filter(s =>
  s.wedding_styles?.includes('modern')
);
```

---

## Troubleshooting

### Issue: "Type 'Basic' is not assignable to type 'basic'"
**Solution**: Update all hardcoded tier values to lowercase
```typescript
// ❌ Wrong
service_tier: 'Basic'

// ✅ Correct
service_tier: 'basic'
```

### Issue: "Property 'years_in_business' does not exist"
**Solution**: Update Service interface to include DSS fields
```typescript
interface Service {
  // ... existing fields
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability?: string;
}
```

### Issue: "Availability type mismatch"
**Solution**: Convert between string and boolean as needed
```typescript
// Database/API: string
availability: "available"

// Booking component: boolean
availability: service.availability === "available"
```

---

## Summary

✅ **All frontend files updated with DSS fields**
✅ **Service tier values standardized (lowercase)**
✅ **Availability type corrected (string)**
✅ **Type safety maintained throughout**
✅ **Backward compatibility preserved**
✅ **Ready for UI implementation and testing**

**Next Steps**:
1. Implement UI display for DSS fields
2. Add DSS field filters
3. Test end-to-end service creation
4. Test service display with DSS data

---

For detailed documentation, see:
- `FRONTEND_BACKEND_FIELD_MAPPING.md` - Complete field reference
- `FRONTEND_DSS_FIELDS_UPDATE_COMPLETE.md` - Detailed change log
- `POST_SERVICES_FIX_COMPLETE.md` - Backend API fixes
