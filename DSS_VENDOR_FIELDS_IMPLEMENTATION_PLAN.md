# DSS Vendor Data Requirements - Implementation Plan

**Date:** December 27, 2024  
**Status:** 📋 PLANNING PHASE  
**Objective:** Add required fields to vendor Add Service Form for DSS matching algorithm

---

## 🎯 PROBLEM STATEMENT

The **Intelligent Wedding Planner (DSS)** matching algorithm requires specific data fields from vendors to generate accurate recommendations. Currently, the **Add Service Form** may be missing some of these critical fields.

### Current DSS Scoring Factors (100 points):
1. **Category Match** (20 pts) - Service category
2. **Budget Match** (20 pts) - Base price / minimum price
3. **Location Match** (15 pts) - Service location
4. **Rating & Reviews** (15 pts) - Service rating (system-generated)
5. **Verification Status** (10 pts) - Vendor verification (admin-controlled)
6. **Service Tier Match** (10 pts) - isPremium, isFeatured flags
7. **Years of Experience** (5 pts) - yearsInBusiness
8. **Availability** (5 pts) - availability status

---

## 📋 REQUIRED FIELDS AUDIT

### Phase 1: Identify Missing Fields

#### Current Add Service Form Fields (Need to Check)
Let's audit what's already in `AddServiceForm.tsx`:

**Expected to Have:**
- [ ] Service name ✓ (likely exists)
- [ ] Service category ✓ (likely exists)
- [ ] Description ✓ (likely exists)
- [ ] Images/gallery ✓ (likely exists)

**Need to Verify:**
- [ ] Base price / pricing structure
- [ ] Minimum price
- [ ] Location (city/region/province)
- [ ] Years in business
- [ ] Availability toggle
- [ ] Service tier (premium/featured flags)

**Likely Missing (DSS-Specific):**
- [ ] Wedding styles supported (romantic, elegant, rustic, etc.)
- [ ] Venue types served (beach, garden, hotel, etc.) - for venue services
- [ ] Venue features (parking, catering, AC, etc.) - for venue services
- [ ] Guest capacity (min/max) - for venue/catering services
- [ ] Dietary options (vegetarian, vegan, halal, etc.) - for catering services
- [ ] Cultural/religious ceremony support - for all services
- [ ] Backup plan availability - for outdoor services
- [ ] Additional services offered (photo booth, live streaming, etc.)

---

## 🗂️ FIELD CATEGORIES

### Category A: CRITICAL (Required for Basic Matching)
**Impact:** Without these, services won't appear in recommendations at all

1. **Service Category** 
   - Current field: `category`
   - Type: Dropdown/Select
   - Options: photography, videography, catering, venue, dj, music, flowers, decor, makeup, hair, planning
   - Status: ⬜ TO CHECK

2. **Location**
   - Current field: `location`
   - Type: Text input or Region selector
   - Format: "Metro Manila", "Luzon (North)", etc.
   - Status: ⬜ TO CHECK

3. **Pricing**
   - Current fields: `basePrice`, `minimumPrice`, or `price`
   - Type: Number (currency)
   - Format: Philippine Peso (₱)
   - Status: ⬜ TO CHECK

---

### Category B: IMPORTANT (Affects Match Score)
**Impact:** Without these, match scores will be lower but services still appear

4. **Years in Business**
   - Field: `yearsInBusiness`
   - Type: Number
   - Range: 0-50
   - Points Impact: +5 if ≥5 years
   - Status: ⬜ TO CHECK

5. **Availability Status**
   - Field: `availability`
   - Type: Boolean or Select
   - Options: "Available", "Limited", "Booked"
   - Points Impact: +5 if available
   - Status: ⬜ TO CHECK

6. **Service Tier Flags**
   - Fields: `isPremium`, `isFeatured`
   - Type: Boolean (admin may control)
   - Points Impact: +10 for tier matching
   - Status: ⬜ TO CHECK

---

### Category C: ENHANCED MATCHING (DSS-Specific)
**Impact:** Enables style/theme/preference matching

7. **Wedding Styles Supported** (Multi-select)
   - Field: `weddingStyles[]` or `styles[]`
   - Type: Checkbox array
   - Options: romantic, elegant, rustic, boho, vintage, minimalist, luxurious, eclectic
   - DSS Usage: Matches user's style preferences
   - Status: ⬜ LIKELY MISSING

8. **Color Schemes** (Optional, Multi-select)
   - Field: `colorSchemes[]`
   - Type: Checkbox array or free text
   - Options: Pastels, Bold Colors, Neutrals, Metallics, etc.
   - DSS Usage: Advanced style matching
   - Status: ⬜ LIKELY MISSING

---

### Category D: VENUE-SPECIFIC FIELDS
**Impact:** Critical for venue category services only

9. **Venue Type** (For venue services only)
   - Field: `venueType`
   - Type: Select
   - Options: indoor, outdoor, beach, garden, hotel, church, ballroom, rooftop, historic
   - DSS Usage: Matches user's venue type preference
   - Status: ⬜ LIKELY MISSING

10. **Venue Features** (Multi-select)
    - Field: `venueFeatures[]`
    - Type: Checkbox array
    - Options: parking, catering, accommodation, ac, backup_venue, sound_system, lighting, stage, dressing_rooms
    - DSS Usage: Matches user's must-have features
    - Status: ⬜ LIKELY MISSING

11. **Guest Capacity**
    - Fields: `minGuestCapacity`, `maxGuestCapacity`
    - Type: Number
    - Range: 20-1000+
    - DSS Usage: Matches user's guest count (20-500)
    - Status: ⬜ LIKELY MISSING

---

### Category E: CATERING-SPECIFIC FIELDS
**Impact:** Critical for catering category services

12. **Dietary Options** (Multi-select)
    - Field: `dietaryOptions[]`
    - Type: Checkbox array
    - Options: vegetarian, vegan, halal, kosher, gluten_free, allergy_specific
    - DSS Usage: Matches user's dietary requirements
    - Status: ⬜ LIKELY MISSING

13. **Cuisine Types** (Multi-select)
    - Field: `cuisineTypes[]`
    - Type: Checkbox array
    - Options: filipino, international, asian, western, fusion, buffet, plated, cocktail
    - DSS Usage: Advanced matching
    - Status: ⬜ LIKELY MISSING

---

### Category F: CULTURAL/SPECIAL REQUIREMENTS
**Impact:** Matches special user requirements

14. **Cultural/Religious Support** (Multi-select)
    - Field: `culturalSupport[]`
    - Type: Checkbox array
    - Options: catholic, christian, muslim, hindu, buddhist, traditional_filipino, chinese, korean
    - DSS Usage: Matches user's cultural requirements
    - Status: ⬜ LIKELY MISSING

15. **Ceremony Types Served** (Multi-select)
    - Field: `ceremonyTypes[]`
    - Type: Checkbox array
    - Options: civil, religious, traditional, destination, intimate, grand
    - DSS Usage: Matches user's wedding type
    - Status: ⬜ LIKELY MISSING

---

### Category G: ADDITIONAL SERVICES
**Impact:** Bonus features for premium matching

16. **Additional Services Offered** (Multi-select)
    - Field: `additionalServices[]`
    - Type: Checkbox array
    - Options: photo_booth, live_streaming, drone_coverage, guest_transport, rehearsal_dinner, day_coordinator
    - DSS Usage: Matches user's special requests
    - Status: ⬜ LIKELY MISSING

17. **Backup Plan Available** (Boolean)
    - Field: `hasBackupPlan`
    - Type: Boolean
    - DSS Usage: Important for outdoor venues/services
    - Status: ⬜ LIKELY MISSING

---

## 📊 IMPLEMENTATION PRIORITY

### Priority 1: CRITICAL (Week 1)
**Must-have for DSS to work at all**

- [ ] **Verify/Fix Pricing Fields** (basePrice, minimumPrice)
- [ ] **Verify/Fix Location Field** (location text or region selector)
- [ ] **Verify/Fix Category Field** (dropdown with all service types)

**Estimated Time:** 2-4 hours

---

### Priority 2: IMPORTANT (Week 1-2)
**Significantly improves match quality**

- [ ] **Add Years in Business** (simple number input)
- [ ] **Add Availability Status** (toggle or dropdown)
- [ ] **Add Guest Capacity** (min/max number inputs) - for venues/catering
- [ ] **Add Wedding Styles** (multi-select checkboxes)

**Estimated Time:** 4-6 hours

---

### Priority 3: ENHANCED (Week 2-3)
**Category-specific improvements**

- [ ] **Add Venue Type** (dropdown) - for venue services
- [ ] **Add Venue Features** (multi-select) - for venue services
- [ ] **Add Dietary Options** (multi-select) - for catering services
- [ ] **Add Cultural Support** (multi-select) - all services

**Estimated Time:** 6-8 hours

---

### Priority 4: ADVANCED (Week 3-4)
**Nice-to-have features**

- [ ] **Add Cuisine Types** - for catering
- [ ] **Add Ceremony Types** - all services
- [ ] **Add Additional Services** - all services
- [ ] **Add Backup Plan Toggle** - outdoor services
- [ ] **Add Color Schemes** - all services

**Estimated Time:** 4-6 hours

---

## 🛠️ TECHNICAL IMPLEMENTATION PLAN

### Step 1: Audit Current Form (30 minutes)
**File:** `src/pages/users/vendor/services/components/AddServiceForm.tsx`

**Tasks:**
- [ ] Read entire AddServiceForm.tsx file
- [ ] Document all existing fields
- [ ] Identify which DSS fields are present
- [ ] Identify which DSS fields are missing
- [ ] Create detailed field checklist

**Deliverable:** `DSS_FIELD_AUDIT_REPORT.md`

---

### Step 2: Database Schema Review (30 minutes)
**Check if database supports new fields**

**Tasks:**
- [ ] Check services table schema
- [ ] Identify if new columns needed
- [ ] Check if JSONB fields can store arrays (styles, features, etc.)
- [ ] Determine migration requirements

**Deliverable:** `DSS_DATABASE_SCHEMA_CHANGES.sql`

---

### Step 3: API Endpoint Review (30 minutes)
**Check if API accepts/returns new fields**

**Tasks:**
- [ ] Review POST `/api/services` endpoint
- [ ] Review PUT `/api/services/:id` endpoint
- [ ] Review GET `/api/services` response format
- [ ] Identify backend changes needed

**Deliverable:** `DSS_API_CHANGES_REQUIRED.md`

---

### Step 4: Form UI Design (1-2 hours)
**Design the new form sections**

**Tasks:**
- [ ] Design conditional sections (venue fields, catering fields)
- [ ] Design multi-select checkbox groups
- [ ] Design number range inputs (guest capacity)
- [ ] Create wireframes/mockups

**Deliverable:** Form section designs

---

### Step 5: Frontend Implementation (8-12 hours)
**Add fields to AddServiceForm.tsx**

**Tasks:**
- [ ] Add new state variables
- [ ] Add form sections with conditional rendering
- [ ] Add validation logic
- [ ] Add tooltips/help text
- [ ] Update form submission logic
- [ ] Test form functionality

**Deliverable:** Updated AddServiceForm.tsx

---

### Step 6: Backend Implementation (4-6 hours)
**Update API to handle new fields**

**Tasks:**
- [ ] Add database migration (if needed)
- [ ] Update service model/schema
- [ ] Update POST/PUT endpoints
- [ ] Update GET endpoint response
- [ ] Add validation
- [ ] Test API endpoints

**Deliverable:** Updated backend service endpoints

---

### Step 7: DSS Algorithm Update (2-4 hours)
**Ensure algorithm uses new fields**

**Tasks:**
- [ ] Update calculateServiceMatch() function
- [ ] Add style matching logic
- [ ] Add venue feature matching logic
- [ ] Add dietary option matching logic
- [ ] Test matching accuracy

**Deliverable:** Updated IntelligentWeddingPlanner_v2.tsx

---

### Step 8: Testing & QA (4-6 hours)
**Comprehensive testing**

**Tasks:**
- [ ] Test adding service with all new fields
- [ ] Test DSS matching with new fields
- [ ] Test backward compatibility (old services without new fields)
- [ ] Test mobile responsiveness
- [ ] Test validation errors
- [ ] Test edge cases

**Deliverable:** Test report

---

### Step 9: Documentation (2-3 hours)
**User and developer docs**

**Tasks:**
- [ ] Vendor guide: "How to optimize your service for recommendations"
- [ ] Developer API documentation
- [ ] Database schema documentation
- [ ] Migration guide for existing services

**Deliverable:** Documentation set

---

### Step 10: Deployment (1-2 hours)
**Deploy to production**

**Tasks:**
- [ ] Run database migrations (if any)
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Monitor for errors
- [ ] Gather initial feedback

**Deliverable:** Production deployment

---

## 📋 DETAILED FIELD CHECKLIST

### ✅ = Exists | ⚠️ = Partial | ❌ = Missing | ⬜ = Unknown

| Field | Priority | Current Status | DSS Impact | Implementation Effort |
|-------|----------|----------------|------------|---------------------|
| **CRITICAL FIELDS** |
| Service Name | Critical | ⬜ | 0 pts | N/A |
| Service Category | Critical | ⬜ | 20 pts | Low (likely exists) |
| Location | Critical | ⬜ | 15 pts | Low-Medium |
| Base Price | Critical | ⬜ | 20 pts | Low (likely exists) |
| Minimum Price | Critical | ⬜ | 20 pts | Low (likely exists) |
| **IMPORTANT FIELDS** |
| Years in Business | Important | ⬜ | 5 pts | Low (1 input field) |
| Availability Status | Important | ⬜ | 5 pts | Low (1 toggle/select) |
| isPremium Flag | Important | ⬜ | 10 pts | Low (1 checkbox) |
| isFeatured Flag | Important | ⬜ | 10 pts | Low (admin only?) |
| **ENHANCED MATCHING** |
| Wedding Styles | Enhanced | ⬜ | Style match | Medium (multi-select) |
| Color Schemes | Enhanced | ⬜ | Advanced match | Medium (multi-select) |
| **VENUE-SPECIFIC** |
| Venue Type | Venue Only | ⬜ | Venue match | Low (1 select) |
| Venue Features | Venue Only | ⬜ | Feature match | Medium (multi-select) |
| Min Guest Capacity | Venue/Catering | ⬜ | Capacity match | Low (1 number input) |
| Max Guest Capacity | Venue/Catering | ⬜ | Capacity match | Low (1 number input) |
| **CATERING-SPECIFIC** |
| Dietary Options | Catering Only | ⬜ | Dietary match | Medium (multi-select) |
| Cuisine Types | Catering Only | ⬜ | Advanced match | Medium (multi-select) |
| **CULTURAL/SPECIAL** |
| Cultural Support | All Services | ⬜ | Cultural match | Medium (multi-select) |
| Ceremony Types | All Services | ⬜ | Type match | Medium (multi-select) |
| **ADDITIONAL** |
| Additional Services | All Services | ⬜ | Bonus match | Medium (multi-select) |
| Backup Plan | Outdoor Services | ⬜ | Safety match | Low (1 checkbox) |

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Success (Critical Fields)
- [ ] Vendors can enter location
- [ ] Vendors can enter pricing
- [ ] Vendors can select category
- [ ] DSS generates recommendations based on these 3 factors

### Phase 2 Success (Important Fields)
- [ ] Vendors can enter years in business
- [ ] Vendors can set availability
- [ ] Match scores include experience and availability
- [ ] Services with 5+ years get higher scores

### Phase 3 Success (Enhanced Fields)
- [ ] Venue vendors see venue-specific fields
- [ ] Catering vendors see catering-specific fields
- [ ] Vendors can select wedding styles
- [ ] DSS matches styles between users and vendors

### Phase 4 Success (Complete)
- [ ] All 17 fields implemented
- [ ] Conditional form sections work
- [ ] DSS matching uses all available data
- [ ] Vendor guide published
- [ ] Documentation complete

---

## ⏱️ ESTIMATED TIMELINE

| Week | Focus | Hours | Deliverables |
|------|-------|-------|--------------|
| **Week 1** | Audit + Critical Fields | 12-16h | Audit report, Priority 1 fields added |
| **Week 2** | Important + Enhanced Fields | 16-20h | Priority 2-3 fields added |
| **Week 3** | Category-Specific Fields | 12-16h | Venue/catering fields added |
| **Week 4** | Testing + Documentation | 8-12h | Tests pass, docs complete |

**Total Estimated Time:** 48-64 hours (6-8 working days)

---

## 🚦 DECISION POINTS

### Decision 1: Mandatory vs Optional
**Question:** Which fields should be required vs optional?

**Recommendation:**
- **Required:** Category, Location, Pricing (critical for matching)
- **Optional:** All others (allows vendors to add services quickly, improve later)

### Decision 2: Admin vs Vendor Control
**Question:** Which fields should vendors control vs admins?

**Recommendation:**
- **Vendor Control:** All except verification flags
- **Admin Control:** isPremium, isFeatured, verificationStatus

### Decision 3: Backward Compatibility
**Question:** What about existing services without new fields?

**Recommendation:**
- **Graceful Degradation:** DSS works with whatever data is available
- **Encourage Updates:** Notify vendors to add missing fields
- **Admin Bulk Edit:** Tool to help populate common fields

### Decision 4: Database Storage
**Question:** New columns or JSONB field?

**Recommendation:**
- **Simple fields:** New columns (location, yearsInBusiness, etc.)
- **Array fields:** JSONB (styles, features, dietaryOptions, etc.)
- **Reason:** JSONB allows flexibility without schema changes

---

## 📝 NEXT STEPS

### Immediate Actions (Today):
1. ✅ **Read AddServiceForm.tsx** - Audit current fields
2. ✅ **Create Field Audit Report** - Document what exists
3. ✅ **Review Database Schema** - Check services table

### This Week:
4. ⬜ **Implement Critical Fields** - Ensure basic matching works
5. ⬜ **Test Basic Matching** - Verify recommendations appear

### Next Week:
6. ⬜ **Implement Enhanced Fields** - Add style/venue/catering fields
7. ⬜ **Update DSS Algorithm** - Use new fields in matching
8. ⬜ **Test Complete Flow** - End-to-end testing

---

## 🎯 LET'S START!

**Ready to begin the audit?**

I'll:
1. Read the current AddServiceForm.tsx file
2. Document all existing fields
3. Create a detailed audit report
4. Generate a prioritized implementation checklist

**Shall I proceed with Step 1: Audit Current Form?** 📋

---

**End of Plan**
