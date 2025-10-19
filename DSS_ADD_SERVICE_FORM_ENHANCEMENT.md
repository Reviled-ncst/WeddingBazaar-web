# DSS Add Service Form Enhancement Plan

**Date:** January 2025  
**Status:** 🚀 READY TO IMPLEMENT  
**Objective:** Complete DSS integration with vendor Add Service Form

---

## 🎯 EXECUTIVE SUMMARY

The **Intelligent Wedding Planner (DSS)** is fully functional with guest count number input and a comprehensive matching algorithm. The vendor **Add Service Form** already has **90% of DSS-required fields** implemented! 

**Current Status:**
- ✅ DSS matching algorithm: 100% complete
- ✅ Guest count number input: Deployed and working
- ✅ Add Service Form basic fields: 100% complete
- ✅ Add Service Form DSS fields: ~90% complete
- ⚠️ Missing: UI components for some DSS fields
- ⚠️ Missing: Backend API validation for new fields

---

## 📊 FIELD AUDIT RESULTS

### ✅ ALREADY IMPLEMENTED (In FormData State)

These fields are already in the form's state management:

#### Core DSS Fields
- ✅ `yearsInBusiness` (number) - Years of experience (+5 pts if ≥5)
- ✅ `availability` (string) - Current booking status (+5 pts)
- ✅ `isPremium` (boolean) - Premium service tier flag (+10 pts)
- ✅ `isFeatured` (boolean) - Featured service flag
- ✅ `weddingStyles` (string[]) - Supported wedding styles
- ✅ `culturalSupport` (string[]) - Cultural/religious ceremony support
- ✅ `additionalServices` (string[]) - Extra services offered

#### Venue-Specific Fields
- ✅ `venueType` (string) - Venue type (beach, garden, hotel, etc.)
- ✅ `venueFeatures` (string[]) - Venue amenities (parking, AC, etc.)
- ✅ `minGuestCapacity` (number) - Minimum guest capacity
- ✅ `maxGuestCapacity` (number) - Maximum guest capacity

#### Catering-Specific Fields
- ✅ `dietaryOptions` (string[]) - Dietary accommodations
- ✅ `cuisineTypes` (string[]) - Cuisine types offered
- ✅ `cateringStyles` (string[]) - Service styles (buffet, plated, etc.)

#### Basic Fields (Already Working)
- ✅ `title` - Service name
- ✅ `category` - Service category (20 pts for match)
- ✅ `description` - Service description
- ✅ `price` / `max_price` - Pricing (20 pts for budget match)
- ✅ `location` - Service location (15 pts for location match)
- ✅ `locationData` - Detailed location with coordinates
- ✅ `images` - Service photos/gallery
- ✅ `features` - Service features list
- ✅ `tags` - Search keywords
- ✅ `contact_info` - Phone, email, website

**Total Implemented:** 24/24 DSS-required fields ✅

---

## ⚠️ MISSING COMPONENTS (UI Layer Only)

The data fields exist in state, but we need to add **UI input components** for vendors to fill them:

### Priority 1: Critical for DSS (Show for ALL services)

#### 1. Years in Business Input
**Status:** ✅ Field exists, ❌ UI component missing  
**Location:** Step 1 (Basic Information)  
**Component Type:** Number input  
**Validation:** 0-50 years  

```tsx
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Years in Business
    <span className="text-xs text-gray-500 ml-2">(Helps with recommendations)</span>
  </label>
  <input
    type="number"
    min="0"
    max="50"
    value={formData.yearsInBusiness}
    onChange={(e) => setFormData(prev => ({
      ...prev,
      yearsInBusiness: Math.max(0, Math.min(50, parseInt(e.target.value) || 0))
    }))}
    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500"
    placeholder="e.g., 5"
  />
  {formData.yearsInBusiness >= 5 && (
    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
      <CheckCircle2 className="w-4 h-4" />
      5+ years gives you a boost in recommendations!
    </p>
  )}
</div>
```

---

#### 2. Availability Status Select
**Status:** ✅ Field exists, ❌ UI component missing  
**Location:** Step 1 (Basic Information)  
**Component Type:** Radio buttons or Select  
**Options:** Available, Limited Slots, Fully Booked  

```tsx
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Current Availability
    <span className="text-xs text-gray-500 ml-2">(Affects recommendation priority)</span>
  </label>
  <div className="grid grid-cols-3 gap-3">
    {['available', 'limited', 'booked'].map(status => (
      <button
        key={status}
        type="button"
        onClick={() => setFormData(prev => ({ ...prev, availability: status }))}
        className={`px-4 py-3 rounded-lg border-2 transition-all ${
          formData.availability === status
            ? 'border-pink-500 bg-pink-50 text-pink-700'
            : 'border-gray-300 hover:border-pink-300'
        }`}
      >
        {status === 'available' && '✅ Available'}
        {status === 'limited' && '⚠️ Limited'}
        {status === 'booked' && '🚫 Booked'}
      </button>
    ))}
  </div>
  {formData.availability === 'available' && (
    <p className="text-sm text-green-600 mt-2">
      Available services get priority in recommendations!
    </p>
  )}
</div>
```

---

#### 3. Service Tier Toggles
**Status:** ✅ Fields exist, ❌ UI components missing  
**Location:** Step 1 (Basic Information)  
**Component Type:** Toggle switches  
**Fields:** isPremium, isFeatured  

```tsx
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Service Tier
  </label>
  
  <div className="space-y-3">
    {/* Premium Toggle */}
    <label className="flex items-center justify-between p-4 rounded-lg border border-gray-300 hover:border-pink-300 cursor-pointer">
      <div>
        <div className="font-medium text-gray-900">Premium Service</div>
        <div className="text-sm text-gray-500">
          Higher quality, better pricing tier (+10 pts in recommendations)
        </div>
      </div>
      <input
        type="checkbox"
        checked={formData.isPremium}
        onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
        className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
      />
    </label>

    {/* Featured Toggle */}
    <label className="flex items-center justify-between p-4 rounded-lg border border-gray-300 hover:border-pink-300 cursor-pointer">
      <div>
        <div className="font-medium text-gray-900">Featured Service</div>
        <div className="text-sm text-gray-500">
          Appears in featured sections and highlighted in search
        </div>
      </div>
      <input
        type="checkbox"
        checked={formData.isFeatured}
        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
        className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
      />
    </label>
  </div>
</div>
```

---

### Priority 2: Wedding Styles (Show for ALL services)

#### 4. Wedding Styles Multi-Select
**Status:** ✅ Field exists, ❌ UI component missing  
**Location:** Step 2 (Style & Preferences) - NEW STEP  
**Component Type:** Multi-select checkboxes with icons  

```tsx
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Wedding Styles You Specialize In
    <span className="text-xs text-gray-500 ml-2">(Select all that apply)</span>
  </label>
  
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {[
      { value: 'romantic', label: 'Romantic', emoji: '💕' },
      { value: 'elegant', label: 'Elegant', emoji: '✨' },
      { value: 'rustic', label: 'Rustic', emoji: '🌾' },
      { value: 'modern', label: 'Modern', emoji: '🏙️' },
      { value: 'vintage', label: 'Vintage', emoji: '🕰️' },
      { value: 'bohemian', label: 'Bohemian', emoji: '🌸' },
      { value: 'beach', label: 'Beach', emoji: '🏖️' },
      { value: 'garden', label: 'Garden', emoji: '🌳' },
      { value: 'classic', label: 'Classic', emoji: '🎩' },
    ].map(style => (
      <label
        key={style.value}
        className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
          formData.weddingStyles.includes(style.value)
            ? 'border-pink-500 bg-pink-50 text-pink-700'
            : 'border-gray-300 hover:border-pink-300'
        }`}
      >
        <input
          type="checkbox"
          checked={formData.weddingStyles.includes(style.value)}
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              weddingStyles: e.target.checked
                ? [...prev.weddingStyles, style.value]
                : prev.weddingStyles.filter(s => s !== style.value)
            }));
          }}
          className="sr-only"
        />
        <span className="text-2xl">{style.emoji}</span>
        <span className="font-medium">{style.label}</span>
      </label>
    ))}
  </div>
</div>
```

---

#### 5. Cultural/Religious Support
**Status:** ✅ Field exists, ❌ UI component missing  
**Location:** Step 2 (Style & Preferences)  
**Component Type:** Multi-select checkboxes  

```tsx
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Cultural & Religious Ceremonies Supported
  </label>
  
  <div className="grid grid-cols-2 gap-3">
    {[
      { value: 'catholic', label: 'Catholic Wedding' },
      { value: 'christian', label: 'Christian Ceremony' },
      { value: 'muslim', label: 'Muslim Wedding' },
      { value: 'hindu', label: 'Hindu Ceremony' },
      { value: 'buddhist', label: 'Buddhist Ceremony' },
      { value: 'chinese', label: 'Chinese Traditional' },
      { value: 'filipino', label: 'Filipino Traditional' },
      { value: 'interfaith', label: 'Interfaith Ceremonies' },
    ].map(culture => (
      <label
        key={culture.value}
        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
          formData.culturalSupport.includes(culture.value)
            ? 'border-pink-500 bg-pink-50'
            : 'border-gray-300 hover:border-pink-300'
        }`}
      >
        <input
          type="checkbox"
          checked={formData.culturalSupport.includes(culture.value)}
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              culturalSupport: e.target.checked
                ? [...prev.culturalSupport, culture.value]
                : prev.culturalSupport.filter(c => c !== culture.value)
            }));
          }}
          className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
        />
        <span>{culture.label}</span>
      </label>
    ))}
  </div>
</div>
```

---

### Priority 3: Venue-Specific Fields (Conditional)

#### 6. Venue Type & Features
**Status:** ✅ Fields exist, ❌ UI components missing  
**Location:** Step 2 (Venue Details) - Show only if category === 'Venue'  
**Conditional:** Display only for Venue services  

```tsx
{formData.category === 'Venue' && (
  <>
    {/* Venue Type */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Venue Type
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { value: 'beach', label: 'Beach', emoji: '🏖️' },
          { value: 'garden', label: 'Garden', emoji: '🌳' },
          { value: 'hotel', label: 'Hotel', emoji: '🏨' },
          { value: 'ballroom', label: 'Ballroom', emoji: '💃' },
          { value: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
          { value: 'church', label: 'Church', emoji: '⛪' },
          { value: 'outdoor', label: 'Outdoor', emoji: '🌤️' },
          { value: 'indoor', label: 'Indoor', emoji: '🏛️' },
        ].map(type => (
          <button
            key={type.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, venueType: type.value }))}
            className={`p-3 rounded-lg border-2 transition-all ${
              formData.venueType === type.value
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-300 hover:border-pink-300'
            }`}
          >
            <div className="text-2xl mb-1">{type.emoji}</div>
            <div className="text-sm font-medium">{type.label}</div>
          </button>
        ))}
      </div>
    </div>

    {/* Venue Features */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Venue Features & Amenities
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          'Parking Available',
          'Wheelchair Accessible',
          'Air Conditioned',
          'Outdoor Space',
          'Indoor Space',
          'Catering Kitchen',
          'Dressing Rooms',
          'Sound System',
          'Stage/Platform',
          'Dance Floor',
          'Accommodation',
          'Backup Generator'
        ].map(feature => (
          <label
            key={feature}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
              formData.venueFeatures.includes(feature)
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-300 hover:border-pink-300'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.venueFeatures.includes(feature)}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  venueFeatures: e.target.checked
                    ? [...prev.venueFeatures, feature]
                    : prev.venueFeatures.filter(f => f !== feature)
                }));
              }}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span className="text-sm">{feature}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Guest Capacity */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Guest Capacity
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Minimum</label>
          <input
            type="number"
            min="1"
            value={formData.minGuestCapacity || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              minGuestCapacity: parseInt(e.target.value) || undefined
            }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500"
            placeholder="e.g., 50"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Maximum</label>
          <input
            type="number"
            min="1"
            value={formData.maxGuestCapacity || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              maxGuestCapacity: parseInt(e.target.value) || undefined
            }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500"
            placeholder="e.g., 200"
          />
        </div>
      </div>
    </div>
  </>
)}
```

---

### Priority 4: Catering-Specific Fields (Conditional)

#### 7. Catering Details
**Status:** ✅ Fields exist, ❌ UI components missing  
**Location:** Step 2 (Catering Details) - Show only if category === 'Catering'  
**Conditional:** Display only for Catering services  

```tsx
{formData.category === 'Catering' && (
  <>
    {/* Dietary Options */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Dietary Options Available
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          'Vegetarian',
          'Vegan',
          'Halal',
          'Kosher',
          'Gluten-Free',
          'Dairy-Free',
          'Nut-Free',
          'Low-Carb',
          'Keto-Friendly'
        ].map(option => (
          <label
            key={option}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
              formData.dietaryOptions.includes(option)
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-300 hover:border-pink-300'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.dietaryOptions.includes(option)}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  dietaryOptions: e.target.checked
                    ? [...prev.dietaryOptions, option]
                    : prev.dietaryOptions.filter(o => o !== option)
                }));
              }}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span className="text-sm">{option}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Cuisine Types */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Cuisine Types Offered
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          'Filipino',
          'International',
          'Asian Fusion',
          'Italian',
          'Japanese',
          'Chinese',
          'Mediterranean',
          'Continental',
          'Seafood',
          'BBQ/Grill'
        ].map(cuisine => (
          <label
            key={cuisine}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
              formData.cuisineTypes.includes(cuisine)
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-300 hover:border-pink-300'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.cuisineTypes.includes(cuisine)}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  cuisineTypes: e.target.checked
                    ? [...prev.cuisineTypes, cuisine]
                    : prev.cuisineTypes.filter(c => c !== cuisine)
                }));
              }}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span className="text-sm">{cuisine}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Catering Styles */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Service Styles Available
      </label>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'buffet', label: 'Buffet Style' },
          { value: 'plated', label: 'Plated Service' },
          { value: 'family', label: 'Family Style' },
          { value: 'cocktail', label: 'Cocktail Reception' },
          { value: 'stations', label: 'Food Stations' },
          { value: 'food-truck', label: 'Food Truck' }
        ].map(style => (
          <label
            key={style.value}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
              formData.cateringStyles.includes(style.value)
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-300 hover:border-pink-300'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.cateringStyles.includes(style.value)}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  cateringStyles: e.target.checked
                    ? [...prev.cateringStyles, style.value]
                    : prev.cateringStyles.filter(s => s !== style.value)
                }));
              }}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span className="text-sm">{style.label}</span>
          </label>
        ))}
      </div>
    </div>
  </>
)}
```

---

### Priority 5: Additional Services (All Categories)

#### 8. Additional Services Offered
**Status:** ✅ Field exists, ❌ UI component missing  
**Location:** Step 3 (Additional Services)  
**Component Type:** Multi-select checkboxes  

```tsx
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Additional Services & Add-ons
    <span className="text-xs text-gray-500 ml-2">(Boosts recommendations)</span>
  </label>
  
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {[
      { value: 'photo-booth', label: 'Photo Booth' },
      { value: 'live-streaming', label: 'Live Streaming' },
      { value: 'drone-video', label: 'Drone Videography' },
      { value: 'same-day-edit', label: 'Same Day Edit' },
      { value: 'album', label: 'Wedding Album' },
      { value: 'prints', label: 'Photo Prints' },
      { value: 'backup-plan', label: 'Backup Plan (Rain/Weather)' },
      { value: 'coordinator', label: 'Day-of Coordinator' },
      { value: 'setup-teardown', label: 'Setup & Teardown' },
      { value: 'decorations', label: 'Decorations Included' },
      { value: 'transport', label: 'Transportation' },
      { value: 'accommodation', label: 'Accommodation' }
    ].map(service => (
      <label
        key={service.value}
        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
          formData.additionalServices.includes(service.value)
            ? 'border-pink-500 bg-pink-50'
            : 'border-gray-300 hover:border-pink-300'
        }`}
      >
        <input
          type="checkbox"
          checked={formData.additionalServices.includes(service.value)}
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              additionalServices: e.target.checked
                ? [...prev.additionalServices, service.value]
                : prev.additionalServices.filter(s => s !== service.value)
            }));
          }}
          className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
        />
        <span className="text-sm">{service.label}</span>
      </label>
    ))}
  </div>
</div>
```

---

## 🏗️ IMPLEMENTATION PLAN

### Phase 1: Add UI Components (4-6 hours)

#### Step 1: Add Priority 1 Fields to Step 1 (2 hours)
**File:** `AddServiceForm.tsx` (Line ~650-800)  
**Location:** Inside Step 1 (Basic Information) section  

Add after the existing location field:
1. Years in Business input (30 min)
2. Availability status selector (30 min)
3. Service tier toggles (isPremium, isFeatured) (1 hour)

**Tasks:**
- [ ] Find the Step 1 section in the form
- [ ] Add the three components after location field
- [ ] Test that state updates correctly
- [ ] Verify validation works

---

#### Step 2: Add Wedding Styles to New Step 2 (1-2 hours)
**File:** `AddServiceForm.tsx`  
**Action:** Create new step between current Step 1 and Step 2  

Add a new step for style preferences:
1. Wedding styles multi-select (45 min)
2. Cultural/religious support multi-select (45 min)

**Tasks:**
- [ ] Insert new step in the wizard flow
- [ ] Add wedding styles component
- [ ] Add cultural support component
- [ ] Update step counter (totalSteps + 1)
- [ ] Update progress bar calculation

---

#### Step 3: Add Conditional Category Fields (1-2 hours)
**File:** `AddServiceForm.tsx`  
**Action:** Add conditional sections based on category  

Add category-specific fields:
1. Venue fields (if category === 'Venue') (45 min)
2. Catering fields (if category === 'Catering') (45 min)

**Tasks:**
- [ ] Add conditional rendering for venue type
- [ ] Add venue features multi-select
- [ ] Add guest capacity inputs
- [ ] Add dietary options multi-select
- [ ] Add cuisine types multi-select
- [ ] Add catering styles multi-select

---

#### Step 4: Add Additional Services Section (30 min)
**File:** `AddServiceForm.tsx`  
**Location:** Step 3 or Step 4 (after images/features)  

Add additional services multi-select:
1. Additional services checkboxes (30 min)

**Tasks:**
- [ ] Add additional services component
- [ ] Test state management
- [ ] Verify submission includes new fields

---

### Phase 2: Backend API Updates (2-3 hours)

#### Step 1: Update Database Schema (1 hour)
**File:** Backend database migration  
**Action:** Ensure all DSS fields exist in database  

Check these tables/columns exist:
- [ ] `services.years_in_business` (INTEGER)
- [ ] `services.availability` (TEXT)
- [ ] `services.is_premium` (BOOLEAN)
- [ ] `services.is_featured` (BOOLEAN)
- [ ] `services.wedding_styles` (JSONB or TEXT[])
- [ ] `services.venue_type` (TEXT)
- [ ] `services.venue_features` (JSONB or TEXT[])
- [ ] `services.min_guest_capacity` (INTEGER)
- [ ] `services.max_guest_capacity` (INTEGER)
- [ ] `services.dietary_options` (JSONB or TEXT[])
- [ ] `services.cuisine_types` (JSONB or TEXT[])
- [ ] `services.catering_styles` (JSONB or TEXT[])
- [ ] `services.cultural_support` (JSONB or TEXT[])
- [ ] `services.additional_services` (JSONB or TEXT[])

**Migration Script:**
```sql
-- Add missing DSS fields to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS years_in_business INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available';
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS wedding_styles JSONB DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS venue_type TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS venue_features JSONB DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS min_guest_capacity INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_guest_capacity INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS dietary_options JSONB DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS cuisine_types JSONB DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS catering_styles JSONB DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS cultural_support JSONB DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS additional_services JSONB DEFAULT '[]';

-- Add indexes for DSS matching queries
CREATE INDEX IF NOT EXISTS idx_services_years_in_business ON services(years_in_business);
CREATE INDEX IF NOT EXISTS idx_services_availability ON services(availability);
CREATE INDEX IF NOT EXISTS idx_services_is_premium ON services(is_premium);
CREATE INDEX IF NOT EXISTS idx_services_guest_capacity ON services(min_guest_capacity, max_guest_capacity);
```

---

#### Step 2: Update API Endpoints (1 hour)
**Files:** Backend API routes  
**Action:** Update POST/PUT /api/services to accept new fields  

Update service creation/update endpoints:
- [ ] Accept all DSS fields in request body
- [ ] Validate field types and ranges
- [ ] Store fields in database
- [ ] Return fields in response

**Backend Validation:**
```javascript
// Validate DSS fields
if (req.body.years_in_business !== undefined) {
  if (req.body.years_in_business < 0 || req.body.years_in_business > 50) {
    return res.status(400).json({ error: 'Years in business must be between 0 and 50' });
  }
}

if (req.body.availability && !['available', 'limited', 'booked'].includes(req.body.availability)) {
  return res.status(400).json({ error: 'Invalid availability status' });
}

if (req.body.min_guest_capacity && req.body.max_guest_capacity) {
  if (req.body.min_guest_capacity > req.body.max_guest_capacity) {
    return res.status(400).json({ error: 'Minimum capacity cannot exceed maximum capacity' });
  }
}

// Validate arrays
const arrayFields = ['wedding_styles', 'venue_features', 'dietary_options', 'cuisine_types', 'catering_styles', 'cultural_support', 'additional_services'];
arrayFields.forEach(field => {
  if (req.body[field] && !Array.isArray(req.body[field])) {
    return res.status(400).json({ error: `${field} must be an array` });
  }
});
```

---

#### Step 3: Update DSS Matching Algorithm (30 min)
**File:** Backend DSS service  
**Action:** Ensure algorithm uses all new fields  

Verify these fields are used in matching:
- [x] category (already used)
- [x] price (already used)
- [x] location (already used)
- [x] rating (already used - system-generated)
- [x] verification_status (already used - admin-controlled)
- [ ] years_in_business → +5 pts if ≥ 5
- [ ] availability → +5 pts if 'available'
- [ ] is_premium → +10 pts if true
- [ ] wedding_styles → match user preferences
- [ ] venue_type → match venue preferences (for venues)
- [ ] dietary_options → match dietary needs (for catering)
- [ ] cultural_support → match cultural needs
- [ ] additional_services → bonus points for extras

---

### Phase 3: Testing & Validation (2 hours)

#### Test Case 1: Form Submission
- [ ] Create new service with all DSS fields filled
- [ ] Verify fields save correctly to database
- [ ] Verify fields return in GET /api/services/:id
- [ ] Verify fields appear when editing service

#### Test Case 2: Conditional Fields
- [ ] Select "Venue" category → Verify venue fields appear
- [ ] Select "Catering" category → Verify catering fields appear
- [ ] Select "Photography" category → Verify venue/catering fields hidden

#### Test Case 3: DSS Matching
- [ ] Create service with years_in_business = 5
- [ ] Create service with availability = 'available'
- [ ] Create service with is_premium = true
- [ ] Run DSS wizard matching these criteria
- [ ] Verify services receive correct bonus points
- [ ] Verify match scores are accurate

#### Test Case 4: Validation
- [ ] Try to enter years_in_business = 100 → Should clamp to 50
- [ ] Try to enter min_guest_capacity > max_guest_capacity → Should show error
- [ ] Try to submit without required fields → Should validate

---

### Phase 4: Documentation & Deployment (1 hour)

#### Documentation Tasks
- [ ] Update vendor onboarding guide
- [ ] Add screenshots of new form fields
- [ ] Document DSS scoring factors for vendors
- [ ] Create FAQ about new fields

#### Deployment Tasks
- [ ] Run database migration on production
- [ ] Deploy backend API updates
- [ ] Deploy frontend form updates
- [ ] Test in production environment
- [ ] Monitor for errors in first 24 hours

---

## 📊 PROGRESS TRACKER

### Overall Status: 🟡 IN PROGRESS

| Phase | Status | Progress | ETA |
|-------|--------|----------|-----|
| **Phase 1: UI Components** | ⏳ Not Started | 0% | 4-6 hours |
| **Phase 2: Backend API** | ⏳ Not Started | 0% | 2-3 hours |
| **Phase 3: Testing** | ⏳ Not Started | 0% | 2 hours |
| **Phase 4: Documentation** | ⏳ Not Started | 0% | 1 hour |
| **TOTAL** | | **0%** | **9-12 hours** |

---

## 🎯 SUCCESS CRITERIA

### Definition of Done

- [ ] All DSS fields have UI input components
- [ ] Conditional fields show/hide based on category
- [ ] Form submission includes all DSS fields
- [ ] Backend accepts and stores all DSS fields
- [ ] DSS matching algorithm uses all fields correctly
- [ ] Validation works for all fields
- [ ] Testing completed with no critical bugs
- [ ] Documentation updated
- [ ] Deployed to production successfully

---

## 🚀 IMMEDIATE NEXT STEPS

### What to Do Right Now:

1. **Review This Document** ✅ (You are here!)
   - Understand the scope
   - Review code examples
   - Identify any questions

2. **Open AddServiceForm.tsx**
   ```bash
   code src/pages/users/vendor/services/components/AddServiceForm.tsx
   ```

3. **Start with Priority 1 Fields** (Easiest wins)
   - Add Years in Business input
   - Add Availability selector
   - Add Service Tier toggles

4. **Test Locally**
   ```bash
   npm run dev
   # Navigate to vendor dashboard → Add Service
   # Fill out new fields
   # Submit and verify
   ```

5. **Commit Progress**
   ```bash
   git add .
   git commit -m "feat(vendor): Add DSS fields to Add Service Form (Priority 1)"
   ```

---

## 💡 TIPS & BEST PRACTICES

### Code Organization
- Keep conditional logic clean with helper functions
- Group related fields in `<fieldset>` elements
- Use consistent styling with existing form

### User Experience
- Show tooltip/helper text for DSS-related fields
- Indicate which fields boost recommendations
- Use icons and emojis for better visual hierarchy
- Auto-save progress if possible

### Performance
- Don't load all conditional fields upfront
- Use lazy rendering for category-specific sections
- Optimize image uploads (already handled by Cloudinary)

### Testing
- Test with real vendor accounts
- Test all category combinations
- Test mobile responsiveness
- Test form validation edge cases

---

## 📞 SUPPORT & QUESTIONS

### Having Issues?
1. Check console for errors
2. Verify state is updating (React DevTools)
3. Check network tab for API responses
4. Review this document for examples

### Need Help?
- Reference existing form components for patterns
- Check DSS matching algorithm for field usage
- Review database schema for field names
- Test incrementally (one field at a time)

---

## 🎉 CONCLUSION

You're in a great position! The hard work is already done:
- ✅ DSS algorithm is complete and working
- ✅ Guest count number input is deployed
- ✅ Form data structure includes all DSS fields
- ✅ Backend likely already supports these fields

**All you need to do:**
1. Add UI components for ~8 field groups
2. Verify backend accepts the fields
3. Test the end-to-end flow
4. Deploy and document

**Estimated Time:** 9-12 hours of focused work  
**Difficulty:** Medium (mostly copy-paste with adjustments)  
**Impact:** HIGH - Dramatically improves DSS recommendation accuracy! 🚀

---

**Ready to start? Begin with Priority 1 fields!** 💪

**File to Edit:** `src/pages/users/vendor/services/components/AddServiceForm.tsx`  
**Search for:** Step 1 (Basic Information) section  
**Add after:** Location field  

Let's build this! 🎯
