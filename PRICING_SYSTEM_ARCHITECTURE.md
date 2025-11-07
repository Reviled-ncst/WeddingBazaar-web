# 🏗️ Pricing Templates System Architecture

**Wedding Bazaar Platform - Visual Documentation**  
**Version**: 1.0  
**Last Updated**: November 7, 2025

---

## 📊 System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     WEDDING BAZAAR PLATFORM                          │
│                    Dynamic Pricing System                            │
└─────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   FRONTEND   │
                              │   (React)    │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
              │  Individual│   │  Vendor   │   │   Admin   │
              │    User    │   │   User    │   │   Panel   │
              └─────┬──────┘   └─────┬─────┘   └─────┬─────┘
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                              ┌──────▼───────┐
                              │  API Layer   │
                              │  (Express)   │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────▼────────┐  ┌───▼────┐  ┌────────▼────────┐
            │ Pricing        │  │ Auth   │  │  Bookings       │
            │ Templates API  │  │ API    │  │  API            │
            └───────┬────────┘  └───┬────┘  └────────┬────────┘
                    │               │                 │
                    └───────────────┼─────────────────┘
                                    │
                             ┌──────▼──────┐
                             │  PostgreSQL │
                             │   (Neon)    │
                             └─────────────┘
```

---

## 🗄️ Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│  service_categories      │         │  category_pricing        │
│  (EXISTING)              │◄───────┤│  _metadata               │
├──────────────────────────┤         ├──────────────────────────┤
│ • id (PK)                │         │ • id (PK)                │
│ • name                   │         │ • category_id (FK) ─────►│
│ • description            │         │ • default_currency       │
│ • icon                   │         │ • pricing_model          │
│ • is_active              │         │ • base_unit              │
└──────────────────────────┘         │ • notes                  │
            ▲                        └──────────────────────────┘
            │
            │ 1:N
            │
┌───────────┴──────────────┐
│  pricing_templates       │
├──────────────────────────┤         ┌──────────────────────────┐
│ • id (PK)                │         │  package_inclusions      │
│ • category_id (FK) ──────┤         ├──────────────────────────┤
│ • name                   │         │ • id (PK)                │
│ • package_tier           │◄────────│ • template_id (FK)       │
│ • base_price             │   1:N   │ • item_name              │
│ • description            │         │ • quantity               │
│ • currency               │         │ • unit                   │
│ • allows_customization   │         │ • unit_price             │
│ • is_active              │         │ • description            │
│ • created_at             │         │ • is_optional            │
│ • updated_at             │         │ • is_highlighted         │
└──────────┬───────────────┘         │ • display_order          │
           │                         └──────────────────────────┘
           │ 1:N
           │
┌──────────▼───────────────┐
│  template_customizations │
├──────────────────────────┤
│ • id (PK)                │
│ • template_id (FK) ──────┤
│ • user_id (FK)           │
│ • booking_id (FK)        │
│ • original_price         │
│ • customized_price       │
│ • customization_data     │
│ • status                 │
│ • created_at             │
│ • expires_at             │
└──────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### **Scenario 1: User Browses Pricing**

```
┌─────────┐
│  USER   │
└────┬────┘
     │
     │ 1. "Show me Photography packages"
     ▼
┌─────────────────┐
│   React App     │
└────┬────────────┘
     │
     │ 2. GET /api/pricing/categories/photography/templates
     ▼
┌─────────────────┐
│  Express API    │
└────┬────────────┘
     │
     │ 3. SELECT * FROM pricing_templates WHERE...
     ▼
┌─────────────────┐
│   PostgreSQL    │
└────┬────────────┘
     │
     │ 4. Returns: [Bronze, Silver, Gold, Platinum]
     ▼
┌─────────────────┐
│  Express API    │ 5. JSON Response with inclusions
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   React App     │ 6. Display pricing cards
└────┬────────────┘
     │
     ▼
┌─────────┐
│  USER   │ Sees: 4 packages with itemized details
└─────────┘
```

---

### **Scenario 2: User Customizes Package**

```
┌─────────┐
│  USER   │
└────┬────┘
     │
     │ 1. "I want Gold package, but remove videography"
     ▼
┌─────────────────┐
│   React App     │
└────┬────────────┘
     │
     │ 2. POST /api/pricing/templates/:id/customize
     │    Body: { excluded_items: ["videography-uuid"] }
     ▼
┌─────────────────┐
│  Express API    │
└────┬────────────┘
     │
     │ 3. Calculate new price
     │    Original: ₱85,000
     │    Remove videography: -₱30,000
     │    New Total: ₱55,000
     ▼
┌─────────────────┐
│   PostgreSQL    │ 4. INSERT INTO template_customizations
└────┬────────────┘
     │
     │ 5. Returns customization_id + new price
     ▼
┌─────────────────┐
│  Express API    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   React App     │ 6. Show updated pricing breakdown
└────┬────────────┘
     │
     ▼
┌─────────┐
│  USER   │ Sees: "Customized Gold Package - ₱55,000"
└─────────┘
```

---

### **Scenario 3: Admin Updates Pricing**

```
┌─────────┐
│  ADMIN  │
└────┬────┘
     │
     │ 1. "Update Bronze Photography to ₱40,000"
     ▼
┌─────────────────┐
│  Admin Panel    │
└────┬────────────┘
     │
     │ 2. PUT /api/pricing/templates/:id
     │    Body: { base_price: 40000 }
     │    Header: Authorization: Bearer [admin-token]
     ▼
┌─────────────────┐
│  Auth          │ 3. Verify admin role
│  Middleware    │
└────┬────────────┘
     │
     │ 4. Authorized ✓
     ▼
┌─────────────────┐
│  Express API    │
└────┬────────────┘
     │
     │ 5. UPDATE pricing_templates
     │    SET base_price = 40000,
     │        updated_at = NOW()
     │    WHERE id = :id
     ▼
┌─────────────────┐
│   PostgreSQL    │
└────┬────────────┘
     │
     │ 6. Trigger: updated_at auto-updated
     │ 7. Returns updated row
     ▼
┌─────────────────┐
│  Express API    │
└────┬────────────┘
     │
     │ 8. Log change to audit table
     ▼
┌─────────────────┐
│  Admin Panel    │ 9. Show success message
└────┬────────────┘
     │
     ▼
┌─────────┐
│  ADMIN  │ Sees: "Bronze Photography updated to ₱40,000"
└─────────┘
         │
         │ 10. Change immediately visible to all users
         ▼
   ┌─────────┐
   │  USERS  │ See new pricing without code deployment!
   └─────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   API REQUEST FLOW                            │
└──────────────────────────────────────────────────────────────┘

PUBLIC ENDPOINTS (No Auth)
───────────────────────────
Request: GET /api/pricing/templates
         ↓
    [No auth check]
         ↓
    Process Request
         ↓
    Return Data ✓


USER ENDPOINTS (Auth Required)
───────────────────────────────
Request: POST /api/pricing/templates/:id/customize
         ↓
    Check Authorization Header
         ↓
    Verify JWT Token
         ├─ Valid → Continue
         └─ Invalid → Return 401 ✗
         ↓
    Check User Exists
         ├─ Exists → Continue
         └─ Not Found → Return 404 ✗
         ↓
    Process Request
         ↓
    Return Data ✓


ADMIN ENDPOINTS (Admin Only)
─────────────────────────────
Request: PUT /api/pricing/templates/:id
         ↓
    Check Authorization Header
         ↓
    Verify JWT Token
         ├─ Valid → Continue
         └─ Invalid → Return 401 ✗
         ↓
    Check User Role
         ├─ Admin → Continue
         └─ Not Admin → Return 403 ✗
         ↓
    Process Request
         ↓
    Log to Audit Trail
         ↓
    Return Data ✓
```

---

## 📦 Package Structure Diagram

```
┌───────────────────────────────────────────────────────────────┐
│              PRICING TEMPLATE STRUCTURE                        │
└───────────────────────────────────────────────────────────────┘

TEMPLATE: "Premium Planning Package"
├─ ID: uuid-1234
├─ Category: Planning & Coordination
├─ Tier: Premium
├─ Base Price: ₱85,000
├─ Currency: PHP
├─ Description: "Comprehensive wedding planning..."
├─ Allows Customization: TRUE
├─ Is Active: TRUE
│
└─ INCLUSIONS: [8 items]
    │
    ├─ [1] Unlimited planning consultations
    │      ├─ Quantity: 1
    │      ├─ Unit: service
    │      ├─ Unit Price: ₱15,000
    │      ├─ Line Total: ₱15,000
    │      ├─ Is Optional: FALSE
    │      ├─ Is Highlighted: TRUE
    │      └─ Display Order: 1
    │
    ├─ [2] Vendor sourcing and negotiations
    │      ├─ Quantity: 1
    │      ├─ Unit: service
    │      ├─ Unit Price: ₱12,000
    │      └─ Line Total: ₱12,000
    │
    ├─ [3] Complete budget management
    │      └─ ... (similar structure)
    │
    ├─ [4-8] ... (6 more inclusions)
    │
    └─ CALCULATED TOTAL: ₱85,000
       (Sum of all line totals)
```

---

## 🌊 Migration Flow Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                    MIGRATION PROCESS                           │
└───────────────────────────────────────────────────────────────┘

START
  │
  ├─ PHASE 1: Schema Creation (5 min)
  │   ├─ Connect to Neon PostgreSQL
  │   ├─ Execute create-pricing-templates-tables.sql
  │   │   ├─ CREATE TABLE pricing_templates
  │   │   ├─ CREATE TABLE package_inclusions
  │   │   ├─ CREATE TABLE category_pricing_metadata
  │   │   ├─ CREATE TABLE template_customizations
  │   │   ├─ CREATE VIEW vw_complete_pricing_templates
  │   │   └─ CREATE VIEW vw_category_pricing_summary
  │   └─ Verify tables exist ✓
  │
  ├─ PHASE 2: Initial Categories (7 min)
  │   ├─ Run migrate-pricing-templates.cjs
  │   │   ├─ Photography (4 templates, 28 inclusions)
  │   │   ├─ Catering (4 templates, 22 inclusions)
  │   │   ├─ Venue (4 templates, 32 inclusions)
  │   │   └─ Music (4 templates, 30 inclusions)
  │   └─ Verify data ✓
  │
  ├─ PHASE 3: Remaining Categories (8 min)
  │   ├─ Run migrate-remaining-categories.cjs
  │   │   ├─ Planning (3 templates, 24 inclusions)
  │   │   ├─ Florist (3 templates, 18 inclusions)
  │   │   ├─ Beauty (3 templates, 18 inclusions)
  │   │   ├─ Officiant (3 templates, 12 inclusions)
  │   │   ├─ Rentals (3 templates, 15 inclusions)
  │   │   ├─ Cake (3 templates, 9 inclusions)
  │   │   ├─ Fashion (3 templates, 9 inclusions)
  │   │   ├─ Security (3 templates, 9 inclusions)
  │   │   ├─ AV Equipment (3 templates, 24 inclusions)
  │   │   ├─ Stationery (3 templates, 12 inclusions)
  │   │   └─ Transportation (3 templates, 12 inclusions)
  │   └─ Verify data ✓
  │
  ├─ PHASE 4: Validation (5 min)
  │   ├─ Run verification queries
  │   ├─ Check data integrity
  │   ├─ Validate pricing calculations
  │   └─ Test views ✓
  │
  └─ COMPLETE ✓
      │
      └─ RESULTS:
          ├─ 15 categories with pricing
          ├─ 49 templates created
          ├─ 376+ inclusions added
          └─ 0 errors
```

---

## 🎨 UI Component Hierarchy

```
┌───────────────────────────────────────────────────────────────┐
│                  FRONTEND COMPONENTS                           │
└───────────────────────────────────────────────────────────────┘

ServiceCreationFlow
├─ CategorySelector
│   └─ ServiceCategoryCard (15 categories)
│
├─ PricingTemplateSelector
│   ├─ usePricingTemplates() [API Hook]
│   │   └─ GET /api/pricing/categories/:id/templates
│   │
│   └─ TemplateCard (3-4 per category)
│       ├─ TemplateHeader
│       │   ├─ Package Name
│       │   ├─ Tier Badge (Basic/Premium/Luxury)
│       │   └─ Base Price
│       │
│       ├─ TemplateInclusions
│       │   └─ InclusionItem[] (itemized list)
│       │       ├─ Item Name
│       │       ├─ Quantity + Unit
│       │       └─ Line Price
│       │
│       └─ TemplateActions
│           ├─ Select Button
│           └─ Customize Button
│
└─ CustomizationModal (if user clicks "Customize")
    ├─ InclusionChecklist
    │   ├─ Checkbox for each inclusion
    │   └─ Optional items highlighted
    │
    ├─ AdditionalItems
    │   └─ Form to add custom items
    │
    ├─ PriceCalculator
    │   ├─ Original Price: ₱85,000
    │   ├─ Adjustments: -₱10,000
    │   └─ New Total: ₱75,000
    │
    └─ Actions
        ├─ Save Customization
        └─ Apply to Booking
```

---

## 🔄 State Management Flow

```
┌───────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                             │
└───────────────────────────────────────────────────────────────┘

React Query (API State)
├─ useTemplates(categoryId)
│   ├─ Query Key: ['templates', categoryId]
│   ├─ Fetch: GET /api/pricing/categories/:id/templates
│   ├─ Cache: 5 minutes
│   └─ Refetch: on window focus
│
├─ useTemplateDetails(templateId)
│   ├─ Query Key: ['template', templateId]
│   ├─ Fetch: GET /api/pricing/templates/:id
│   └─ Include: inclusions
│
└─ useCustomization()
    ├─ Mutation: POST /api/pricing/templates/:id/customize
    ├─ On Success: Invalidate ['templates']
    └─ On Error: Show error toast

Local State (UI)
├─ selectedCategory: string
├─ selectedTemplate: string | null
├─ customizationModal: boolean
├─ selectedInclusions: string[]
├─ additionalItems: Item[]
└─ calculatedPrice: number
```

---

## 📊 Performance Metrics

```
┌───────────────────────────────────────────────────────────────┐
│                   PERFORMANCE TARGETS                          │
└───────────────────────────────────────────────────────────────┘

API Response Times:
├─ GET /api/pricing/templates
│   └─ Target: < 100ms (with 100 templates)
│
├─ GET /api/pricing/templates/:id
│   └─ Target: < 50ms (single template + inclusions)
│
└─ POST /api/pricing/templates/:id/customize
    └─ Target: < 200ms (complex calculation)

Database Query Performance:
├─ Index on category_id: ✓ Automatic (foreign key)
├─ Index on package_tier: ✓ Common filter
└─ Index on is_active: ✓ Default filter

Query Optimization:
├─ View vw_complete_pricing_templates
│   └─ Pre-joins templates + inclusions + categories
│
└─ JSON aggregation for inclusions
    └─ Single query instead of N+1
```

---

## 🧪 Testing Strategy Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     TESTING LAYERS                             │
└───────────────────────────────────────────────────────────────┘

Unit Tests
├─ Database Migrations
│   ├─ Test schema creation
│   ├─ Test data insertion
│   └─ Test rollback procedures
│
└─ API Endpoints
    ├─ Test request validation
    ├─ Test response formatting
    └─ Test error handling

Integration Tests
├─ Database + API
│   ├─ Test full CRUD operations
│   ├─ Test foreign key constraints
│   └─ Test transaction handling
│
└─ API + Frontend
    ├─ Test data fetching
    ├─ Test customization flow
    └─ Test price calculations

End-to-End Tests
└─ Full User Journey
    ├─ Browse categories
    ├─ View pricing templates
    ├─ Customize package
    ├─ Create booking
    └─ Verify in database
```

---

## 📱 Mobile Responsive Design

```
┌───────────────────────────────────────────────────────────────┐
│                  RESPONSIVE BREAKPOINTS                        │
└───────────────────────────────────────────────────────────────┘

Desktop (1024px+)
├─ 3 template cards per row
├─ Full inclusion details visible
└─ Sticky sidebar for filters

Tablet (768px - 1023px)
├─ 2 template cards per row
├─ Collapsed inclusion details
└─ Hamburger menu for filters

Mobile (< 768px)
├─ 1 template card per row
├─ Swipeable cards
└─ Bottom sheet for filters
```

---

**END OF ARCHITECTURE DOCUMENTATION**

---

For implementation details, see:
- **README_PRICING_MIGRATION.md** - Getting started
- **PRICING_MIGRATION_COMPLETE_SUMMARY.md** - Overview
- **PRICING_TEMPLATES_API_SPECIFICATION.md** - API reference
