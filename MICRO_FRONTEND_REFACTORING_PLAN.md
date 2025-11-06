# 🏗️ Micro Frontend Refactoring Plan

## Executive Summary
This document outlines the comprehensive refactoring strategy for breaking down large, monolithic components into micro frontends and micro backend services.

## 🎯 Refactoring Targets (Files > 50KB)

### Priority 1: Critical Path Components (IMMEDIATE)

#### 1. **VendorServices.tsx** (122KB) - HIGHEST PRIORITY
**Current Issues:**
- Massive component with 2,500+ lines
- Mixed concerns: UI, API calls, state management, business logic
- Dual vendor ID system causing complexity
- Subscription validation embedded in component
- Service CRUD operations tightly coupled

**Refactoring Strategy:**
```
VendorServices.tsx (122KB)
├── Micro Frontend Components:
│   ├── VendorServicesMain.tsx (40KB) - Main container with layout
│   ├── ServiceListView.tsx (25KB) - Service display grid/list
│   ├── ServiceCard.tsx (15KB) - Individual service card
│   └── ServiceFilters.tsx (10KB) - Filter and search UI
│
├── Micro Backend Services:
│   ├── vendorServicesAPI.ts - API calls for services
│   ├── vendorIdResolver.ts - Vendor ID resolution logic
│   ├── subscriptionValidator.ts - Subscription checks
│   └── serviceImageHandler.ts - Image upload/management
│
└── Shared Utilities:
    ├── serviceDataNormalizer.ts - Data transformation
    └── serviceValidation.ts - Form validation
```

**Files to Create:**
1. `src/pages/users/vendor/services/components/VendorServicesMain.tsx`
2. `src/pages/users/vendor/services/components/ServiceListView.tsx`
3. `src/pages/users/vendor/services/components/ServiceCard.tsx`
4. `src/pages/users/vendor/services/components/ServiceFilters.tsx`
5. `src/pages/users/vendor/services/services/vendorServicesAPI.ts`
6. `src/pages/users/vendor/services/services/vendorIdResolver.ts`
7. `src/pages/users/vendor/services/services/subscriptionValidator.ts`
8. `src/pages/users/vendor/services/utils/serviceDataNormalizer.ts`

---

#### 2. **AddServiceForm.tsx** (121KB) - CRITICAL
**Current Issues:**
- 2,400+ lines of form logic
- Complex DSS field management
- Image upload logic embedded
- Category/subcategory cascade logic
- Pricing model complexity

**Refactoring Strategy:**
```
AddServiceForm.tsx (121KB)
├── Micro Frontend Components:
│   ├── AddServiceFormMain.tsx (30KB) - Form container
│   ├── BasicInfoSection.tsx (20KB) - Name, category, description
│   ├── PricingSection.tsx (25KB) - Pricing models and ranges
│   ├── DSSFieldsSection.tsx (25KB) - DSS-specific fields
│   └── ImageUploadSection.tsx (15KB) - Image management
│
├── Micro Backend Services:
│   ├── serviceFormAPI.ts - Create/update service endpoints
│   ├── categoryService.ts - Category/subcategory logic
│   ├── imageUploadService.ts - Image processing
│   └── dssFieldsService.ts - DSS field management
│
└── Form Utilities:
    ├── formValidation.ts - Validation schemas
    └── pricingCalculator.ts - Pricing logic
```

---

#### 3. **IntelligentWeddingPlanner_v2.tsx** (96KB) - HIGH PRIORITY
**Current Issues:**
- Complex DSS logic in one file
- Package generation mixed with UI
- Matching engine integration needs separation
- Result display and filtering coupled

**Refactoring Strategy:**
```
IntelligentWeddingPlanner_v2.tsx (96KB)
├── Micro Frontend Components:
│   ├── DSSFormWizard.tsx (30KB) - Multi-step form
│   ├── DSSResultsView.tsx (25KB) - Results display
│   ├── PackageComparison.tsx (20KB) - Side-by-side comparison
│   └── DSSFilters.tsx (15KB) - Result filtering
│
├── Micro Backend Services:
│   ├── dssMatchingAPI.ts - Matching engine calls
│   ├── packageGenerationService.ts - Package creation
│   └── dssPreferencesService.ts - Save/load preferences
│
└── DSS Utilities:
    ├── scoringCalculator.ts - Scoring logic
    └── packageOptimizer.ts - Package optimization
```

---

#### 4. **IndividualBookings.tsx** (91KB) - HIGH PRIORITY
**Current Issues:**
- All booking management in one file
- Payment, cancellation, completion mixed
- Receipt viewing embedded
- Status management complex

**Refactoring Strategy:**
```
IndividualBookings.tsx (91KB)
├── Micro Frontend Components:
│   ├── BookingListView.tsx (30KB) - Main booking list
│   ├── BookingCard.tsx (20KB) - Individual booking card
│   ├── BookingActions.tsx (15KB) - Action buttons
│   └── BookingFilters.tsx (10KB) - Filter UI
│
├── Micro Backend Services:
│   ├── bookingActionsAPI.ts - Cancel, complete, etc.
│   ├── bookingReceiptService.ts - Receipt operations
│   └── bookingStatusService.ts - Status management
│
└── Booking Utilities:
    ├── bookingDataMapper.ts - Data transformation
    └── statusCalculator.ts - Status logic
```

---

### Priority 2: Supporting Components (SECONDARY)

#### 5. **Services_Centralized.tsx** (128KB)
**Status:** Already has alternative implementations (Services.tsx)
**Action:** Deprecate or merge with smaller Services.tsx

#### 6. **DecisionSupportSystem.tsx** (108KB)
**Status:** Replaced by IntelligentWeddingPlanner_v2.tsx
**Action:** Archive after confirming no dependencies

#### 7. **VendorBookingDetailsModal.tsx** (88KB)
**Action:** Split into BookingDetailsView + QuoteManagement + Actions

#### 8. **SendQuoteModal.tsx** (86KB)
**Action:** Split into QuoteFormWizard + PricingCalculator + QuotePreview

---

## 🏭 Backend Service Refactoring

### Current Backend Structure
```
backend-deploy/routes/
├── bookings.cjs (Large, mixed concerns)
├── services.cjs (Mixed CRUD and DSS)
├── payments.cjs (Receipt + PayMongo)
└── vendors.cjs (Vendor + Services)
```

### Proposed Micro Backend Services
```
backend-deploy/
├── microservices/
│   ├── vendor-management/
│   │   ├── vendor-id-resolution.cjs
│   │   ├── vendor-profile.cjs
│   │   └── vendor-subscription.cjs
│   │
│   ├── service-management/
│   │   ├── service-crud.cjs
│   │   ├── service-dss-fields.cjs
│   │   └── service-images.cjs
│   │
│   ├── booking-management/
│   │   ├── booking-crud.cjs
│   │   ├── booking-actions.cjs
│   │   ├── booking-completion.cjs
│   │   └── booking-quotes.cjs
│   │
│   ├── dss-engine/
│   │   ├── dss-matching.cjs
│   │   ├── dss-package-generation.cjs
│   │   └── dss-scoring.cjs
│   │
│   └── payment-processing/
│       ├── paymongo-integration.cjs
│       ├── receipt-generation.cjs
│       └── payment-webhooks.cjs
│
└── routes/ (Lightweight route handlers)
```

---

## 📋 Implementation Phases

### Phase 1: VendorServices Refactoring (2-3 hours)
1. ✅ Create folder structure
2. ✅ Extract vendorIdResolver service
3. ✅ Extract subscriptionValidator service
4. ✅ Create ServiceCard component
5. ✅ Create ServiceListView component
6. ✅ Create ServiceFilters component
7. ✅ Create VendorServicesMain container
8. ✅ Test and validate
9. ✅ Update imports in router

### Phase 2: AddServiceForm Refactoring (2-3 hours)
1. Create section components
2. Extract form services
3. Move DSS logic to service layer
4. Implement image upload service
5. Test form submission flow

### Phase 3: DSS Components (2 hours)
1. Split IntelligentWeddingPlanner_v2
2. Create wizard steps
3. Move matching to service
4. Integrate PackageDetailsModal
5. Test end-to-end flow

### Phase 4: Booking Components (2 hours)
1. Split IndividualBookings
2. Extract booking actions
3. Create status management service
4. Test payment/completion flows

### Phase 5: Backend Services (3-4 hours)
1. Create microservices folders
2. Extract vendor ID logic
3. Split booking routes
4. Create DSS matching service
5. Test all endpoints

---

## 🎨 Folder Structure Standards

### Frontend Micro Frontends
```
src/pages/users/[userType]/[feature]/
├── components/           # UI components (< 300 lines each)
│   ├── [Feature]Main.tsx       # Container component
│   ├── [Feature]List.tsx       # List/grid view
│   ├── [Feature]Card.tsx       # Card component
│   ├── [Feature]Filters.tsx    # Filters
│   └── [Feature]Actions.tsx    # Action buttons
│
├── services/            # API and business logic (< 200 lines each)
│   ├── [feature]API.ts         # API calls
│   ├── [feature]Service.ts     # Business logic
│   └── [feature]Validator.ts   # Validation
│
├── hooks/               # Custom hooks (< 100 lines each)
│   └── use[Feature].ts
│
├── types/               # TypeScript types
│   └── [feature].types.ts
│
└── utils/               # Utility functions (< 150 lines each)
    └── [feature]Utils.ts
```

### Backend Micro Services
```
backend-deploy/microservices/
├── [domain]/
│   ├── [feature].cjs           # Feature logic (< 300 lines)
│   ├── [feature].test.js       # Unit tests
│   └── README.md               # Service documentation
│
└── shared/
    ├── database.cjs            # DB utilities
    ├── validation.cjs          # Shared validation
    └── auth.cjs                # Auth helpers
```

---

## 📊 Success Metrics

### Component Size Goals
- ✅ No component > 500 lines
- ✅ Average component size: 200-300 lines
- ✅ No file > 50KB

### Code Quality Goals
- ✅ Single Responsibility Principle
- ✅ Loose coupling between modules
- ✅ High cohesion within modules
- ✅ Easy to test and maintain

### Performance Goals
- ✅ Lazy loading for all micro frontends
- ✅ Code splitting at route level
- ✅ Tree shaking optimization
- ✅ Bundle size reduction: 40%+ target

---

## 🚀 Deployment Strategy

### Frontend Deployment
1. Deploy micro frontends independently
2. Use lazy loading for route-based code splitting
3. Firebase hosting with CDN caching
4. Monitor bundle sizes with Vite analyzer

### Backend Deployment
1. Keep monolithic server for now
2. Microservices as internal modules
3. Future: Split to separate services on Render
4. Use API gateway pattern

---

## ✅ Current Status

### Completed
- ✅ DSS Priority System (EnhancedMatchingEngine.ts)
- ✅ PackageDetailsModal micro frontend
- ✅ packageBookingService micro backend
- ✅ Comprehensive documentation

### In Progress
- 🚧 VendorServices refactoring (Phase 1)
- 🚧 Integration planning for PackageDetailsModal

### Pending
- ⏳ AddServiceForm refactoring
- ⏳ IntelligentWeddingPlanner_v2 refactoring
- ⏳ IndividualBookings refactoring
- ⏳ Backend microservices extraction

---

## 📚 Related Documentation
- `PRIORITY_BASED_DSS_SYSTEM.md` - DSS matching engine
- `DSS_DEPLOYMENT_COMPLETE.md` - DSS deployment guide
- `VENDOR_ID_FORMAT_CONFIRMED.md` - Vendor ID system
- `ADD_SERVICE_BUTTON_ROOT_CAUSE_FOUND.md` - Subscription issues

---

**Last Updated:** 2025-10-30
**Status:** 🟢 Active Development
**Next Action:** Start VendorServices Phase 1 refactoring
