# 🗄️ Wedding Bazaar: Current Itemization & Pricing Database State

**Date**: May 11, 2025  
**Analysis**: Complete database schema audit for itemization and pricing capabilities  
**Status**: ✅ Foundation exists, 🚧 Advanced features need implementation

---

## 📊 WHAT CURRENTLY EXISTS IN DATABASE

### 1. **`services` Table** (Main Service Listings)
**Purpose**: Stores vendor service offerings with basic pricing  
**Current Pricing Fields**:
```sql
- price (numeric)              -- Single base price
- max_price (numeric)          -- Maximum price for range
- price_range (varchar)        -- Text range (e.g., "₱10,000 - ₱25,000")
```

**Current Structure**:
```sql
CREATE TABLE services (
  id VARCHAR PRIMARY KEY,              -- SRV-PHO-xxxxx
  vendor_id VARCHAR,                   -- VEN-xxxxx or UUID
  title VARCHAR NOT NULL,              -- "Photo + Video Combo Package"
  description TEXT,
  category VARCHAR,                    -- Photography, Catering, etc.
  price NUMERIC,                       -- 90000.00
  max_price NUMERIC,                   -- 120000.00
  price_range VARCHAR,                 -- "₱60,000 - ₱120,000"
  images TEXT[],
  features TEXT[],
  -- DSS Fields --
  location TEXT,
  years_in_business INTEGER,
  service_tier VARCHAR,                -- basic/standard/premium
  wedding_styles TEXT[],
  cultural_specialties TEXT[],
  availability TEXT,
  location_data JSONB,
  contact_info JSONB,
  tags TEXT[],
  keywords TEXT,
  -- Status --
  is_active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**❌ MISSING**:
- No package breakdown (what's included in the ₱90,000?)
- No per-item pricing (photographer rate, videographer rate)
- No quantity tracking (2 photographers, 3 hours)
- No hourly/unit-based pricing (per pax, per hour)
- No add-ons or optional items
- No personnel breakdown (main photographer, assistant)
- No equipment itemization (cameras, drones, lights)

---

### 2. **`booking_items` Table** (Itemized Quotations)
**Purpose**: Stores itemized breakdown AFTER booking is created (quotation stage)  
**Current Structure**:
```sql
CREATE TABLE booking_items (
  id INTEGER PRIMARY KEY,
  booking_id INTEGER NOT NULL,         -- FK to bookings table
  service_id VARCHAR,                  -- FK to services.id
  service_name VARCHAR NOT NULL,       -- "Wedding Photography"
  service_category VARCHAR,            -- Photography
  vendor_id VARCHAR NOT NULL,
  vendor_name VARCHAR,
  quantity INTEGER,                    -- ⭐ Per-item quantity
  unit_price NUMERIC,                  -- ⭐ Price per unit
  total_price NUMERIC,                 -- quantity × unit_price
  dss_snapshot JSONB,                  -- Original DSS details snapshot
  item_notes TEXT,
  item_status VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

**✅ WHAT IT CAN DO**:
- Store itemized breakdowns per booking
- Track quantity × unit_price per line item
- Store multiple line items per booking (e.g., Main Package, Add-on 1, Add-on 2)
- Capture DSS snapshot (original service details at booking time)

**⚠️ LIMITATIONS**:
- Only populated AFTER booking created (not during service creation)
- No pre-defined package templates in `services` table
- No personnel breakdown (who's included per item?)
- No equipment details (what equipment per item?)
- No time-based pricing (hourly rates, overtime)

---

### 3. **Related Tables** (Support Itemization)

#### **`service_categories` Table**
```sql
CREATE TABLE service_categories (
  id INTEGER PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,       -- Photography, Catering, etc.
  display_name VARCHAR,
  description TEXT,
  icon VARCHAR,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE
);
```
**Purpose**: Define service categories for organizing services  
**Used for**: Categorizing services, filtering, navigation

#### **`service_subcategories` Table**
```sql
CREATE TABLE service_subcategories (
  id INTEGER PRIMARY KEY,
  category_id INTEGER,                -- FK to service_categories
  name VARCHAR NOT NULL,              -- "Wedding Photography", "Food Catering"
  display_name VARCHAR,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  FOREIGN KEY (category_id) REFERENCES service_categories(id)
);
```
**Purpose**: Sub-categorize services within main categories  
**Used for**: Granular service classification

#### **`service_features` Table**
```sql
CREATE TABLE service_features (
  id INTEGER PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,       -- "All-Day Coverage", "Same-Day Edit"
  display_name VARCHAR,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);
```
**Purpose**: Define reusable features/inclusions  
**Used for**: Feature tagging (stored as TEXT[] in services.features)

---

## 🚫 WHAT'S MISSING FOR FULL ITEMIZATION

### 1. **Package Breakdown Tables** (NOT IMPLEMENTED)
**Purpose**: Pre-define package contents in service listings

```sql
-- ❌ DOES NOT EXIST
CREATE TABLE service_packages (
  id UUID PRIMARY KEY,
  service_id VARCHAR REFERENCES services(id),
  package_name VARCHAR NOT NULL,       -- "Basic Package", "Premium Package"
  package_description TEXT,
  base_price NUMERIC,
  is_default BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  created_at TIMESTAMP
);

-- ❌ DOES NOT EXIST
CREATE TABLE package_items (
  id UUID PRIMARY KEY,
  package_id UUID REFERENCES service_packages(id),
  item_type VARCHAR NOT NULL,          -- 'personnel', 'equipment', 'deliverable'
  item_name VARCHAR NOT NULL,          -- "Lead Photographer"
  quantity INTEGER,
  unit_price NUMERIC,
  is_optional BOOLEAN DEFAULT FALSE,
  item_notes TEXT,
  created_at TIMESTAMP
);
```

**Why Needed**:
- Show customers EXACTLY what's included in ₱90,000 package
- Allow vendors to define multiple package tiers (Basic/Standard/Premium)
- Enable add-on pricing (extra hour = ₱5,000)

---

### 2. **Personnel Breakdown** (NOT IMPLEMENTED)
**Purpose**: Track who's included in service delivery

```sql
-- ❌ DOES NOT EXIST
CREATE TABLE service_personnel (
  id UUID PRIMARY KEY,
  service_id VARCHAR REFERENCES services(id),
  role VARCHAR NOT NULL,               -- 'photographer', 'videographer', 'assistant'
  personnel_name VARCHAR,              -- "John Doe" (optional)
  quantity INTEGER DEFAULT 1,
  hours_included NUMERIC,
  hourly_rate NUMERIC,
  notes TEXT,
  created_at TIMESTAMP
);
```

**Example**:
- Main Photographer (8 hours) - ₱15,000
- Second Photographer (4 hours) - ₱8,000
- Videographer (8 hours) - ₱18,000
- Assistant (8 hours) - ₱5,000

---

### 3. **Equipment Breakdown** (NOT IMPLEMENTED)
**Purpose**: Track equipment provided with service

```sql
-- ❌ DOES NOT EXIST
CREATE TABLE service_equipment (
  id UUID PRIMARY KEY,
  service_id VARCHAR REFERENCES services(id),
  equipment_name VARCHAR NOT NULL,     -- "DSLR Camera", "Drone"
  equipment_type VARCHAR,              -- 'camera', 'lighting', 'audio'
  quantity INTEGER DEFAULT 1,
  rental_cost NUMERIC,                 -- Cost to vendor (optional)
  is_included BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP
);
```

**Example**:
- 2× DSLR Cameras (Included)
- 1× DJI Mavic 3 Drone (Included)
- 3× Softbox Lighting (Included)
- 1× Gimbal Stabilizer (Add-on: ₱2,000)

---

### 4. **Time-Based Pricing** (NOT IMPLEMENTED)
**Purpose**: Support hourly, daily, per-pax pricing models

```sql
-- ❌ DOES NOT EXIST
CREATE TABLE service_pricing_rules (
  id UUID PRIMARY KEY,
  service_id VARCHAR REFERENCES services(id),
  pricing_type VARCHAR NOT NULL,       -- 'hourly', 'daily', 'per_pax', 'flat'
  base_unit INTEGER,                   -- 8 (hours), 1 (day), 100 (pax)
  base_price NUMERIC,
  additional_unit_price NUMERIC,       -- Per extra hour/pax
  minimum_units INTEGER,
  maximum_units INTEGER,
  created_at TIMESTAMP
);
```

**Example**:
- **Photography**: ₱50,000 for 8 hours, ₱5,000 per extra hour
- **Catering**: ₱800 per pax (minimum 100 pax, maximum 500 pax)
- **DJ**: ₱15,000 flat rate (4 hours), ₱3,000 per extra hour

---

### 5. **Add-Ons & Optional Items** (NOT IMPLEMENTED)
**Purpose**: Allow customers to customize packages

```sql
-- ❌ DOES NOT EXIST
CREATE TABLE service_addons (
  id UUID PRIMARY KEY,
  service_id VARCHAR REFERENCES services(id),
  addon_name VARCHAR NOT NULL,         -- "Same-Day Edit Video"
  addon_description TEXT,
  price NUMERIC,
  is_available BOOLEAN DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMP
);
```

**Example Add-Ons**:
- Same-Day Edit Video - ₱15,000
- Drone Coverage (1 hour) - ₱8,000
- Extra SD Card Set - ₱2,000
- Engagement Shoot - ₱20,000

---

## 🎯 WHAT YOU CAN DO RIGHT NOW (Without New Tables)

### ✅ Option 1: Use `features` Array (Quick & Dirty)
**Current Field**: `services.features TEXT[]`  
**Store Itemization as Text**:
```json
{
  "features": [
    "2 Professional Photographers (8 hours each)",
    "1 Lead Videographer (full day)",
    "All digital edited photos (500-700 images)",
    "Highlight video (5-7 minutes)",
    "Raw footage on USB drive",
    "Online gallery with download access"
  ]
}
```

**Pros**: ✅ No database changes needed, works today  
**Cons**: ❌ No quantity tracking, no pricing breakdown, text-only

---

### ✅ Option 2: Use `contact_info` JSONB (Hack for Now)
**Current Field**: `services.contact_info JSONB`  
**Store Structured Itemization**:
```json
{
  "pricing_breakdown": {
    "personnel": [
      {"role": "Lead Photographer", "quantity": 1, "hours": 8, "rate": 15000},
      {"role": "Second Shooter", "quantity": 1, "hours": 8, "rate": 8000}
    ],
    "equipment": [
      {"item": "DSLR Cameras", "quantity": 2, "included": true},
      {"item": "Drone", "quantity": 1, "included": true}
    ],
    "deliverables": [
      {"item": "Edited Photos", "quantity": 700, "format": "Digital"},
      {"item": "Highlight Video", "quantity": 1, "duration": "5-7 min"}
    ],
    "addons": [
      {"name": "Same-Day Edit", "price": 15000},
      {"name": "Drone Coverage", "price": 8000}
    ]
  }
}
```

**Pros**: ✅ Structured data, queryable, works today  
**Cons**: ⚠️ Misusing field, not relational, harder to query across services

---

### ✅ Option 3: Add New JSONB Column (Minimal Change)
**Add to `services` table**:
```sql
ALTER TABLE services 
ADD COLUMN pricing_details JSONB;
```

**Store Same Structure**:
```json
{
  "pricing_mode": "itemized",  // or "flat", "per_pax", "hourly"
  "packages": [
    {
      "name": "Basic Package",
      "price": 60000,
      "personnel": [...],
      "equipment": [...],
      "deliverables": [...]
    },
    {
      "name": "Premium Package",
      "price": 120000,
      "personnel": [...],
      "equipment": [...],
      "deliverables": [...]
    }
  ],
  "addons": [...]
}
```

**Pros**: ✅ Minimal DB change, structured, queryable, vendor-friendly  
**Cons**: ⚠️ Not fully normalized, limited querying across items

---

## 🏗️ RECOMMENDED: Phased Implementation Plan

### **Phase 1: JSONB Enhancement (1-2 days)** ⭐ RECOMMENDED NOW
1. ✅ Add `pricing_details JSONB` to `services` table
2. ✅ Update `AddServiceForm.tsx` to show itemization UI
3. ✅ Use your existing `PricingModeSelector` + `PackageBuilder` components
4. ✅ Store structured JSON in `pricing_details` column
5. ✅ Display itemization in service cards and booking flow

**SQL Migration**:
```sql
ALTER TABLE services 
ADD COLUMN pricing_details JSONB DEFAULT '{}'::jsonb;

CREATE INDEX idx_services_pricing_details 
ON services USING GIN (pricing_details);

COMMENT ON COLUMN services.pricing_details IS 
'Structured pricing breakdown: packages, personnel, equipment, addons';
```

**Result**: Vendors can create itemized packages TODAY without waiting for full relational schema.

---

### **Phase 2: Relational Tables (1-2 weeks)** 🚧 FUTURE
1. Create `service_packages`, `package_items`, `service_personnel`, `service_equipment` tables
2. Migrate data from JSONB to relational tables
3. Build advanced querying (filter by personnel count, equipment type)
4. Enable package comparison across vendors

**Why Later**:
- More complex database design
- Data migration required
- Harder to change once deployed
- Vendor feedback needed first

---

### **Phase 3: Advanced Pricing Engine (2-4 weeks)** 🔮 FUTURE
1. Time-based pricing rules (hourly, daily, per-pax)
2. Dynamic pricing (surge pricing, seasonal rates)
3. Bulk discount rules
4. Multi-currency support
5. Tax and fee calculations

---

## 📋 IMMEDIATE ACTION ITEMS (Today)

### 1. **Run Database Migration** (5 minutes)
```bash
node -e "
const {sql} = require('./backend-deploy/config/database.cjs');
(async () => {
  await sql\`
    ALTER TABLE services 
    ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '{}'::jsonb
  \`;
  await sql\`
    CREATE INDEX IF NOT EXISTS idx_services_pricing_details 
    ON services USING GIN (pricing_details)
  \`;
  console.log('✅ pricing_details column added');
  process.exit(0);
})();
"
```

### 2. **Update Backend API** (10 minutes)
**File**: `backend-deploy/routes/services.cjs`  
**Add to service creation/update**:
```javascript
// Accept pricing_details from frontend
const pricingDetails = req.body.pricing_details || {};

const service = await sql`
  INSERT INTO services (
    vendor_id, title, description, category,
    price, max_price, price_range,
    pricing_details,  -- NEW FIELD
    images, features, location, contact_info, tags, keywords,
    years_in_business, service_tier, wedding_styles, 
    cultural_specialties, availability,
    is_active, featured, created_at, updated_at
  ) VALUES (
    ${vendorId}, ${title}, ${description}, ${category},
    ${price}, ${maxPrice}, ${priceRange},
    ${JSON.stringify(pricingDetails)},  -- NEW VALUE
    ${images}, ${features}, ${location}, 
    ${contactInfo}, ${tags}, ${keywords},
    ${yearsInBusiness}, ${serviceTier}, ${weddingStyles},
    ${culturalSpecialties}, ${availability},
    ${isActive}, ${featured}, NOW(), NOW()
  )
  RETURNING *
`;
```

### 3. **Update Frontend Form** (30 minutes)
**File**: `src/pages/users/vendor/services/components/AddServiceForm.tsx`  
**Add pricing_details to form submission**:
```typescript
const handleSubmit = async () => {
  const serviceData = {
    // ...existing fields...
    pricing_details: showItemizedPricing ? {
      pricing_mode: selectedPricingMode,
      packages: buildPackages(),  // From PackageBuilder component
      addons: buildAddons(),
      notes: pricingNotes
    } : {}
  };
  
  await onSubmit(serviceData);
};
```

### 4. **Display Itemization in UI** (20 minutes)
**File**: `src/pages/users/vendor/services/components/ServiceCard.tsx`  
**Show package breakdown**:
```tsx
{service.pricing_details?.packages && (
  <div className="mt-4 space-y-2">
    <h4 className="font-semibold">Package Options:</h4>
    {service.pricing_details.packages.map((pkg, idx) => (
      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between">
          <span className="font-medium">{pkg.name}</span>
          <span className="text-pink-600">₱{pkg.price.toLocaleString()}</span>
        </div>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          {pkg.personnel?.map((p, i) => (
            <li key={i}>✓ {p.quantity}× {p.role} ({p.hours}h)</li>
          ))}
          {pkg.equipment?.map((e, i) => (
            <li key={i}>✓ {e.quantity}× {e.item}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)}
```

---

## ✅ SUMMARY: What You Have vs. What You Need

| Feature | Current Status | Implementation Path |
|---------|----------------|---------------------|
| **Basic Pricing** (min/max/range) | ✅ EXISTS | services.price, max_price, price_range |
| **Itemized Quotations** (post-booking) | ✅ EXISTS | booking_items table |
| **Package Templates** (pre-booking) | ❌ MISSING | Add pricing_details JSONB |
| **Personnel Breakdown** | ❌ MISSING | Add to pricing_details JSON |
| **Equipment Itemization** | ❌ MISSING | Add to pricing_details JSON |
| **Add-Ons/Optional Items** | ❌ MISSING | Add to pricing_details JSON |
| **Hourly/Per-Pax Pricing** | ❌ MISSING | Add pricing_rules to JSON |
| **Multi-Package Tiers** | ❌ MISSING | Add packages array to JSON |

---

## 🎯 RECOMMENDED NEXT STEP

**Use JSONB approach (Phase 1)** because:
1. ✅ No complex schema changes
2. ✅ Flexible structure (can change JSON easily)
3. ✅ Fast implementation (1-2 days)
4. ✅ Works with existing codebase
5. ✅ Can migrate to relational later if needed
6. ✅ Your `PackageBuilder` component already generates this JSON structure

**DO THIS NOW**:
```bash
# 1. Add column
node -e "const {sql}=require('./backend-deploy/config/database.cjs'); (async()=>{await sql\`ALTER TABLE services ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '{}'::jsonb\`; console.log('✅ Done'); process.exit(0);})();"

# 2. Update backend routes/services.cjs (accept pricing_details field)
# 3. Update AddServiceForm.tsx (submit pricing_details)
# 4. Update ServiceCard.tsx (display pricing_details)
# 5. Deploy!
```

**Time Estimate**: 2-3 hours for full implementation  
**Result**: Vendors can create itemized packages immediately! 🎉

---

**Questions? Ask me:**
1. "Show me the exact SQL migration"
2. "Show me the backend code changes"
3. "Show me the frontend form integration"
4. "Should I use JSONB or create new tables?"

I'm ready to implement whichever approach you choose! 🚀
