# 🔌 Pricing Templates API Specification

**Version**: 1.0  
**Last Updated**: November 7, 2025  
**Base URL**: `https://weddingbazaar-web.onrender.com/api`

---

## 📋 Overview

This document defines the RESTful API endpoints for managing and retrieving dynamic pricing templates after the database migration is complete. All endpoints return JSON responses and require proper authentication where indicated.

---

## 🔐 Authentication

Most endpoints require JWT authentication. Include token in header:

```http
Authorization: Bearer <jwt_token>
```

**Public Endpoints** (No Auth Required):
- `GET /api/pricing/templates`
- `GET /api/pricing/templates/:id`
- `GET /api/pricing/categories/:categoryId/templates`

**Protected Endpoints** (Auth Required):
- All `POST`, `PUT`, `DELETE` operations
- Admin-only endpoints

---

## 📍 Endpoints

### **1. Get All Pricing Templates**

**Endpoint:** `GET /api/pricing/templates`  
**Auth:** Public  
**Description:** Retrieve all active pricing templates with optional filtering

**Query Parameters:**
```typescript
{
  category?: string;           // Filter by category ID
  tier?: 'basic' | 'premium' | 'luxury'; // Filter by tier
  min_price?: number;          // Minimum price filter
  max_price?: number;          // Maximum price filter
  search?: string;             // Search in name/description
  include_inclusions?: boolean; // Include package inclusions (default: false)
  page?: number;               // Pagination (default: 1)
  limit?: number;              // Items per page (default: 20)
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    templates: [
      {
        id: "uuid",
        category_id: "uuid",
        category_name: "Photography",
        name: "Essential Planning",
        package_tier: "basic",
        base_price: 45000.00,
        description: "Partial planning assistance for organized couples",
        currency: "PHP",
        is_active: true,
        created_at: "2025-11-07T10:00:00Z",
        updated_at: "2025-11-07T10:00:00Z",
        inclusions?: [ // If include_inclusions=true
          {
            id: "uuid",
            item_name: "Planning consultation sessions",
            quantity: 3,
            unit: "sessions",
            unit_price: 5000.00,
            description: null,
            is_optional: false,
            display_order: 1
          }
        ]
      }
    ],
    pagination: {
      current_page: 1,
      total_pages: 3,
      total_items: 49,
      items_per_page: 20
    }
  }
}
```

**Example Request:**
```bash
curl "https://weddingbazaar-web.onrender.com/api/pricing/templates?category=photography&tier=premium&include_inclusions=true"
```

---

### **2. Get Single Template by ID**

**Endpoint:** `GET /api/pricing/templates/:id`  
**Auth:** Public  
**Description:** Retrieve detailed information for a specific pricing template

**URL Parameters:**
- `id` (string, required): Template UUID

**Query Parameters:**
```typescript
{
  include_inclusions?: boolean; // Include package inclusions (default: true)
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    category_id: "uuid",
    category_name: "Photography",
    name: "Premium Planning",
    package_tier: "premium",
    base_price: 85000.00,
    description: "Comprehensive wedding planning with dedicated coordinator",
    currency: "PHP",
    pricing_model: "package",
    base_unit: "event",
    allows_customization: true,
    is_active: true,
    created_at: "2025-11-07T10:00:00Z",
    updated_at: "2025-11-07T10:00:00Z",
    inclusions: [
      {
        id: "uuid",
        item_name: "Unlimited planning consultations",
        quantity: 1,
        unit: "service",
        unit_price: 15000.00,
        description: null,
        is_optional: false,
        is_highlighted: true,
        display_order: 1
      },
      // ... more inclusions
    ],
    calculated_total: 85000.00 // Sum of all inclusions
  }
}
```

**Error Responses:**
```typescript
// 404 Not Found
{
  success: false,
  error: "Template not found",
  code: "TEMPLATE_NOT_FOUND"
}
```

---

### **3. Get Templates by Category**

**Endpoint:** `GET /api/pricing/categories/:categoryId/templates`  
**Auth:** Public  
**Description:** Get all pricing templates for a specific service category

**URL Parameters:**
- `categoryId` (string, required): Category UUID or slug

**Query Parameters:**
```typescript
{
  tier?: 'basic' | 'premium' | 'luxury';
  include_inclusions?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'name' | 'tier'; // default: 'price_asc'
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    category: {
      id: "uuid",
      name: "Photography",
      pricing_model: "package",
      base_unit: "event",
      default_currency: "PHP",
      notes: "Full-service wedding planning and coordination packages"
    },
    templates: [
      // Array of template objects
    ],
    statistics: {
      total_templates: 3,
      price_range: {
        min: 45000,
        max: 150000
      },
      tiers_available: ["basic", "premium", "luxury"]
    }
  }
}
```

**Example Request:**
```bash
curl "https://weddingbazaar-web.onrender.com/api/pricing/categories/photography/templates?include_inclusions=true&sort_by=price_asc"
```

---

### **4. Get Package Inclusions**

**Endpoint:** `GET /api/pricing/templates/:id/inclusions`  
**Auth:** Public  
**Description:** Get itemized inclusions for a specific pricing template

**URL Parameters:**
- `id` (string, required): Template UUID

**Response:**
```typescript
{
  success: true,
  data: {
    template_id: "uuid",
    template_name: "Premium Planning",
    base_price: 85000.00,
    inclusions: [
      {
        id: "uuid",
        item_name: "Unlimited planning consultations",
        quantity: 1,
        unit: "service",
        unit_price: 15000.00,
        line_total: 15000.00,
        description: null,
        is_optional: false,
        is_highlighted: true,
        display_order: 1
      }
    ],
    summary: {
      total_items: 8,
      total_price: 85000.00,
      optional_items: 0,
      highlighted_items: 3
    }
  }
}
```

---

### **5. Create New Template (Admin)**

**Endpoint:** `POST /api/pricing/templates`  
**Auth:** Admin Only  
**Description:** Create a new pricing template with inclusions

**Request Body:**
```typescript
{
  category_id: "uuid",
  name: "Custom Planning Package",
  package_tier: "premium",
  base_price: 95000.00,
  description: "Tailored planning for unique celebrations",
  currency: "PHP",
  allows_customization: true,
  is_active: true,
  inclusions: [
    {
      item_name: "Custom consultation sessions",
      quantity: 5,
      unit: "sessions",
      unit_price: 8000.00,
      description: "One-on-one planning sessions",
      is_optional: false,
      is_highlighted: true,
      display_order: 1
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  message: "Pricing template created successfully",
  data: {
    id: "uuid",
    // ... full template object with inclusions
  }
}
```

**Validation Errors:**
```typescript
{
  success: false,
  error: "Validation failed",
  details: [
    {
      field: "base_price",
      message: "Base price must be greater than 0"
    }
  ]
}
```

---

### **6. Update Template (Admin)**

**Endpoint:** `PUT /api/pricing/templates/:id`  
**Auth:** Admin Only  
**Description:** Update existing pricing template

**URL Parameters:**
- `id` (string, required): Template UUID

**Request Body:**
```typescript
{
  name?: string,
  base_price?: number,
  description?: string,
  is_active?: boolean,
  // Other updatable fields
}
```

**Response:**
```typescript
{
  success: true,
  message: "Template updated successfully",
  data: {
    // Updated template object
  }
}
```

---

### **7. Delete Template (Admin)**

**Endpoint:** `DELETE /api/pricing/templates/:id`  
**Auth:** Admin Only  
**Description:** Soft delete a pricing template (sets is_active to false)

**URL Parameters:**
- `id` (string, required): Template UUID

**Query Parameters:**
```typescript
{
  hard_delete?: boolean; // Permanently delete (default: false)
}
```

**Response:**
```typescript
{
  success: true,
  message: "Template deleted successfully"
}
```

---

### **8. Add Inclusion to Template (Admin)**

**Endpoint:** `POST /api/pricing/templates/:id/inclusions`  
**Auth:** Admin Only  
**Description:** Add a new inclusion item to existing template

**URL Parameters:**
- `id` (string, required): Template UUID

**Request Body:**
```typescript
{
  item_name: "Additional service",
  quantity: 2,
  unit: "hours",
  unit_price: 3000.00,
  description: "Extra coverage time",
  is_optional: false,
  is_highlighted: false,
  display_order: 10
}
```

**Response:**
```typescript
{
  success: true,
  message: "Inclusion added successfully",
  data: {
    // New inclusion object
  }
}
```

---

### **9. Update Inclusion (Admin)**

**Endpoint:** `PUT /api/pricing/templates/:templateId/inclusions/:inclusionId`  
**Auth:** Admin Only  
**Description:** Update an existing package inclusion

**URL Parameters:**
- `templateId` (string, required): Template UUID
- `inclusionId` (string, required): Inclusion UUID

**Request Body:**
```typescript
{
  quantity?: number,
  unit_price?: number,
  is_optional?: boolean,
  // Other updatable fields
}
```

**Response:**
```typescript
{
  success: true,
  message: "Inclusion updated successfully",
  data: {
    // Updated inclusion object
  }
}
```

---

### **10. Delete Inclusion (Admin)**

**Endpoint:** `DELETE /api/pricing/templates/:templateId/inclusions/:inclusionId`  
**Auth:** Admin Only  
**Description:** Remove an inclusion from a template

**URL Parameters:**
- `templateId` (string, required): Template UUID
- `inclusionId` (string, required): Inclusion UUID

**Response:**
```typescript
{
  success: true,
  message: "Inclusion removed successfully"
}
```

---

### **11. Get Category Pricing Summary**

**Endpoint:** `GET /api/pricing/categories/:categoryId/summary`  
**Auth:** Public  
**Description:** Get pricing statistics and summary for a category

**URL Parameters:**
- `categoryId` (string, required): Category UUID or slug

**Response:**
```typescript
{
  success: true,
  data: {
    category_id: "uuid",
    category_name: "Photography",
    pricing_model: "package",
    base_unit: "event",
    statistics: {
      total_templates: 3,
      price_range: {
        min: 45000,
        max: 150000,
        average: 93333
      },
      tiers: {
        basic: {
          count: 1,
          avg_price: 45000
        },
        premium: {
          count: 1,
          avg_price: 85000
        },
        luxury: {
          count: 1,
          avg_price: 150000
        }
      },
      total_inclusions: 24,
      avg_inclusions_per_template: 8
    }
  }
}
```

---

### **12. Customize Template (User)**

**Endpoint:** `POST /api/pricing/templates/:id/customize`  
**Auth:** Authenticated User  
**Description:** Create a customized version of a template for booking

**URL Parameters:**
- `id` (string, required): Template UUID

**Request Body:**
```typescript
{
  user_id: "uuid",
  booking_id?: "uuid",
  customizations: {
    included_items: ["inclusion-uuid-1", "inclusion-uuid-2"],
    excluded_items: ["inclusion-uuid-3"],
    additional_items: [
      {
        item_name: "Extra hour of coverage",
        quantity: 1,
        unit: "hour",
        unit_price: 5000.00
      }
    ],
    notes: "Please prioritize candid shots"
  }
}
```

**Response:**
```typescript
{
  success: true,
  message: "Template customized successfully",
  data: {
    customization_id: "uuid",
    template_id: "uuid",
    original_price: 85000.00,
    customized_price: 92000.00,
    price_difference: 7000.00,
    summary: {
      included_items: 7,
      excluded_items: 1,
      additional_items: 1,
      total_items: 8
    },
    inclusions: [
      // Customized inclusions list
    ]
  }
}
```

---

### **13. Get User Customizations**

**Endpoint:** `GET /api/pricing/customizations`  
**Auth:** Authenticated User  
**Description:** Get all pricing customizations by the authenticated user

**Query Parameters:**
```typescript
{
  status?: 'draft' | 'confirmed' | 'expired';
  booking_id?: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    customizations: [
      {
        id: "uuid",
        template_id: "uuid",
        template_name: "Premium Planning",
        category_name: "Planning",
        original_price: 85000.00,
        customized_price: 92000.00,
        status: "draft",
        created_at: "2025-11-07T10:00:00Z",
        expires_at: "2025-11-14T10:00:00Z"
      }
    ]
  }
}
```

---

### **14. Search Templates**

**Endpoint:** `GET /api/pricing/search`  
**Auth:** Public  
**Description:** Full-text search across templates and inclusions

**Query Parameters:**
```typescript
{
  q: string;                   // Search query
  categories?: string[];       // Filter by categories
  min_price?: number;
  max_price?: number;
  tier?: 'basic' | 'premium' | 'luxury';
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    results: [
      {
        type: "template",
        template_id: "uuid",
        category_name: "Photography",
        name: "Premium Planning",
        match_type: "name", // or "description", "inclusion"
        match_text: "...highlighted text...",
        relevance_score: 0.95
      }
    ],
    pagination: { /* ... */ }
  }
}
```

---

## 🧪 Testing Endpoints

### **Base Test URL:**
```
https://weddingbazaar-web.onrender.com/api/pricing
```

### **Test Credentials (Development):**
```
Admin User:
  Email: admin@weddingbazaar.ph
  Token: [Get from /api/auth/login]

Regular User:
  Email: test@example.com
  Token: [Get from /api/auth/login]
```

### **Sample Test Sequence:**

```bash
# 1. Get all templates
curl https://weddingbazaar-web.onrender.com/api/pricing/templates

# 2. Get Photography templates with inclusions
curl "https://weddingbazaar-web.onrender.com/api/pricing/categories/photography/templates?include_inclusions=true"

# 3. Get single template details
curl https://weddingbazaar-web.onrender.com/api/pricing/templates/[uuid]

# 4. Search for "planning" packages
curl "https://weddingbazaar-web.onrender.com/api/pricing/search?q=planning&min_price=40000&max_price=100000"

# 5. Get category summary
curl https://weddingbazaar-web.onrender.com/api/pricing/categories/photography/summary
```

---

## 📊 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

---

## 🔒 Rate Limiting

**Public Endpoints:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

**Authenticated Endpoints:**
- 200 requests per minute per user
- 2000 requests per hour per user

**Admin Endpoints:**
- Unlimited

---

## 📝 TypeScript Interfaces

```typescript
// Core Types
interface PricingTemplate {
  id: string;
  category_id: string;
  name: string;
  package_tier: 'basic' | 'premium' | 'luxury';
  base_price: number;
  description: string;
  currency: string;
  allows_customization: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PackageInclusion {
  id: string;
  template_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  description?: string;
  is_optional: boolean;
  is_highlighted: boolean;
  display_order: number;
}

interface CategoryPricingMetadata {
  category_id: string;
  default_currency: string;
  pricing_model: 'package' | 'hourly' | 'per_pax' | 'custom';
  base_unit: string;
  notes?: string;
}

interface TemplateCustomization {
  id: string;
  template_id: string;
  user_id: string;
  booking_id?: string;
  original_price: number;
  customized_price: number;
  customization_data: object;
  status: 'draft' | 'confirmed' | 'expired';
  created_at: string;
  expires_at: string;
}

// API Response Types
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}
```

---

## 🛠️ Implementation Checklist

### **Backend Routes (Express.js)**
```javascript
// backend-deploy/routes/pricing-templates.cjs

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth.cjs');

// Public routes
router.get('/templates', getTemplates);
router.get('/templates/:id', getTemplateById);
router.get('/categories/:categoryId/templates', getTemplatesByCategory);
router.get('/templates/:id/inclusions', getTemplateInclusions);
router.get('/categories/:categoryId/summary', getCategorySummary);
router.get('/search', searchTemplates);

// Protected user routes
router.post('/templates/:id/customize', authenticate, customizeTemplate);
router.get('/customizations', authenticate, getUserCustomizations);

// Admin routes
router.post('/templates', authenticate, requireAdmin, createTemplate);
router.put('/templates/:id', authenticate, requireAdmin, updateTemplate);
router.delete('/templates/:id', authenticate, requireAdmin, deleteTemplate);
router.post('/templates/:id/inclusions', authenticate, requireAdmin, addInclusion);
router.put('/templates/:templateId/inclusions/:inclusionId', authenticate, requireAdmin, updateInclusion);
router.delete('/templates/:templateId/inclusions/:inclusionId', authenticate, requireAdmin, deleteInclusion);

module.exports = router;
```

### **Database Query Examples**

```sql
-- Get templates with inclusions
SELECT 
  pt.*,
  json_agg(
    json_build_object(
      'id', pi.id,
      'item_name', pi.item_name,
      'quantity', pi.quantity,
      'unit', pi.unit,
      'unit_price', pi.unit_price,
      'line_total', pi.quantity * pi.unit_price
    ) ORDER BY pi.display_order
  ) AS inclusions
FROM pricing_templates pt
LEFT JOIN package_inclusions pi ON pi.template_id = pt.id
WHERE pt.is_active = TRUE
GROUP BY pt.id;

-- Search templates
SELECT DISTINCT ON (pt.id)
  pt.*,
  ts_rank(
    to_tsvector('english', pt.name || ' ' || COALESCE(pt.description, '')),
    plainto_tsquery('english', $1)
  ) AS rank
FROM pricing_templates pt
WHERE to_tsvector('english', pt.name || ' ' || COALESCE(pt.description, '')) @@ plainto_tsquery('english', $1)
ORDER BY pt.id, rank DESC;
```

---

## 📚 Documentation Links

- **Migration Guide**: `PRICING_TEMPLATES_MIGRATION_GUIDE.md`
- **Pricing Reference**: `REALISTIC_WEDDING_PACKAGES_PRICING.md`
- **Database Schema**: `backend-deploy/migrations/create-pricing-templates-tables.sql`
- **Execution Checklist**: `PRICING_MIGRATION_EXECUTION_CHECKLIST.md`

---

**API Spec Version**: 1.0  
**Last Updated**: November 7, 2025  
**Status**: Ready for Implementation
