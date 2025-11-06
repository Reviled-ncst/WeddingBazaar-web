# 🚀 ITEMIZED PRICING: 30-Minute Quick Start Guide

**Goal**: Add itemized pricing to Wedding Bazaar in ONE work session  
**Time**: 30 minutes  
**Result**: Vendors can create itemized packages with personnel, equipment, and add-ons

---

## 📋 CHECKLIST (Copy to your notes!)

- [ ] Step 1: Database Migration (5 min)
- [ ] Step 2: Backend API Update (5 min)
- [ ] Step 3: Frontend Form Integration (15 min)
- [ ] Step 4: Test & Deploy (5 min)

---

## ⚡ STEP 1: DATABASE MIGRATION (5 minutes)

### Run This Command NOW:
```bash
node add-pricing-details-column.cjs
```

### Create the Migration File First:
Create file: `c:\Games\WeddingBazaar-web\add-pricing-details-column.cjs`

```javascript
const { sql } = require('./backend-deploy/config/database.cjs');

(async () => {
  try {
    console.log('🔧 Adding pricing_details column to services table...');
    
    // Add column
    await sql`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '{}'::jsonb
    `;
    console.log('✅ Column added');
    
    // Add index for fast querying
    await sql`
      CREATE INDEX IF NOT EXISTS idx_services_pricing_details 
      ON services USING GIN (pricing_details)
    `;
    console.log('✅ Index created');
    
    // Add comment
    await sql`
      COMMENT ON COLUMN services.pricing_details IS 
      'Structured pricing breakdown: packages, personnel, equipment, addons'
    `;
    console.log('✅ Comment added');
    
    // Test it
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'pricing_details'
    `;
    
    if (result.length > 0) {
      console.log('✅ MIGRATION SUCCESSFUL!');
      console.log('   Column:', result[0].column_name);
      console.log('   Type:', result[0].data_type);
    } else {
      console.error('❌ Column not found after migration!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
})();
```

**Verify**:
```bash
node check-service-tables.cjs
# Should show: pricing_details (jsonb) NULL
```

---

## ⚡ STEP 2: BACKEND API UPDATE (5 minutes)

### File: `backend-deploy/routes/services.cjs`

### Find the `POST /api/vendor/services` route and UPDATE:

**BEFORE** (around line 80-150):
```javascript
const service = await sql`
  INSERT INTO services (
    vendor_id, title, description, category,
    price, max_price, price_range,
    images, features, ...
  ) VALUES (
    ${vendorId}, ${title}, ${description}, ${category},
    ${price}, ${maxPrice}, ${priceRange},
    ${images}, ${features}, ...
  )
  RETURNING *
`;
```

**AFTER** (add pricing_details):
```javascript
// Extract pricing_details from request
const pricingDetails = req.body.pricing_details || {};

const service = await sql`
  INSERT INTO services (
    vendor_id, title, description, category,
    price, max_price, price_range,
    pricing_details,  -- NEW FIELD
    images, features, ...
  ) VALUES (
    ${vendorId}, ${title}, ${description}, ${category},
    ${price}, ${maxPrice}, ${priceRange},
    ${JSON.stringify(pricingDetails)},  -- NEW VALUE
    ${images}, ${features}, ...
  )
  RETURNING *
`;
```

### Do the SAME for `PUT /api/vendor/services/:id` route (around line 200-250)

**Add before UPDATE query**:
```javascript
const pricingDetails = req.body.pricing_details || {};
```

**Add to UPDATE query**:
```javascript
await sql`
  UPDATE services SET
    title = ${title},
    description = ${description},
    category = ${category},
    price = ${price},
    max_price = ${maxPrice},
    price_range = ${priceRange},
    pricing_details = ${JSON.stringify(pricingDetails)},  -- NEW FIELD
    images = ${images},
    ...
    updated_at = NOW()
  WHERE id = ${serviceId} AND vendor_id = ${vendorId}
`;
```

**Save file. Done! No need to deploy backend yet.**

---

## ⚡ STEP 3: FRONTEND FORM INTEGRATION (15 minutes)

### 3.1: Update AddServiceForm.tsx (10 minutes)

**File**: `src/pages/users/vendor/services/components/AddServiceForm.tsx`

#### A. Add State for Pricing Details (around line 300-350)
```typescript
// After existing useState declarations
const [pricingMode, setPricingMode] = useState<'simple' | 'itemized'>('simple');
const [packages, setPackages] = useState<any[]>([]);
const [addons, setAddons] = useState<any[]>([]);
```

#### B. Update handleSubmit Function (around line 600-700)
**Find this section**:
```typescript
const serviceData = {
  vendor_id: vendorId,
  title: formData.title.trim(),
  description: formData.description.trim(),
  category: formData.category,
  price_range: !showCustomPricing && formData.price_range ? formData.price_range : null,
  price: showCustomPricing && formData.price ? parseFloat(formData.price) : null,
  max_price: showCustomPricing && formData.max_price ? parseFloat(formData.max_price) : null,
  // ... rest of fields
};
```

**ADD this after the existing fields**:
```typescript
const serviceData = {
  // ...existing fields...
  
  // NEW: Pricing details
  pricing_details: pricingMode === 'itemized' ? {
    pricing_mode: pricingMode,
    packages: packages.filter(p => p.name && p.price),
    addons: addons.filter(a => a.name && a.price),
    generated_at: new Date().toISOString()
  } : {}
};
```

#### C. Add Itemized Pricing UI to Step 2 (Pricing Step)

**Find the Step 2 rendering** (around line 1000-1200, look for `{currentStep === 2 && (`):

**ADD THIS after the existing pricing mode toggle**:
```tsx
{currentStep === 2 && (
  <div className="space-y-6">
    {/* Existing pricing mode selector */}
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => setPricingMode('simple')}
        className={/* ... */}
      >
        Simple Pricing
      </button>
      <button
        type="button"
        onClick={() => setPricingMode('itemized')}
        className={/* ... */}
      >
        Itemized Pricing ⭐ NEW!
      </button>
    </div>

    {/* NEW: Show itemized pricing form */}
    {pricingMode === 'itemized' && (
      <div className="space-y-6 bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl">
        <h3 className="text-xl font-bold text-gray-800">📦 Build Your Packages</h3>
        
        {/* Package Builder */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setPackages([...packages, { 
              name: '', 
              price: '', 
              personnel: [], 
              equipment: [], 
              deliverables: [] 
            }])}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            + Add Package
          </button>
          
          {packages.map((pkg, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Package Name (e.g., Basic Package)"
                  value={pkg.name || ''}
                  onChange={(e) => {
                    const updated = [...packages];
                    updated[idx].name = e.target.value;
                    setPackages(updated);
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={pkg.price || ''}
                  onChange={(e) => {
                    const updated = [...packages];
                    updated[idx].price = parseFloat(e.target.value);
                    setPackages(updated);
                  }}
                  className="w-32 px-3 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setPackages(packages.filter((_, i) => i !== idx))}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              {/* Add Personnel/Equipment buttons here */}
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...packages];
                    if (!updated[idx].personnel) updated[idx].personnel = [];
                    updated[idx].personnel.push({ role: '', quantity: 1, hours: 8 });
                    setPackages(updated);
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
                >
                  + Add Personnel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...packages];
                    if (!updated[idx].equipment) updated[idx].equipment = [];
                    updated[idx].equipment.push({ item: '', quantity: 1 });
                    setPackages(updated);
                  }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded"
                >
                  + Add Equipment
                </button>
              </div>
              
              {/* Display personnel */}
              {pkg.personnel?.map((p, pIdx) => (
                <div key={pIdx} className="flex gap-2 ml-4">
                  <input
                    type="text"
                    placeholder="Role (e.g., Lead Photographer)"
                    value={p.role || ''}
                    onChange={(e) => {
                      const updated = [...packages];
                      updated[idx].personnel[pIdx].role = e.target.value;
                      setPackages(updated);
                    }}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={p.quantity || 1}
                    onChange={(e) => {
                      const updated = [...packages];
                      updated[idx].personnel[pIdx].quantity = parseInt(e.target.value);
                      setPackages(updated);
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Hours"
                    value={p.hours || 8}
                    onChange={(e) => {
                      const updated = [...packages];
                      updated[idx].personnel[pIdx].hours = parseInt(e.target.value);
                      setPackages(updated);
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                </div>
              ))}
              
              {/* Display equipment */}
              {pkg.equipment?.map((e, eIdx) => (
                <div key={eIdx} className="flex gap-2 ml-4">
                  <input
                    type="text"
                    placeholder="Equipment (e.g., DSLR Camera)"
                    value={e.item || ''}
                    onChange={(ev) => {
                      const updated = [...packages];
                      updated[idx].equipment[eIdx].item = ev.target.value;
                      setPackages(updated);
                    }}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={e.quantity || 1}
                    onChange={(ev) => {
                      const updated = [...packages];
                      updated[idx].equipment[eIdx].quantity = parseInt(ev.target.value);
                      setPackages(updated);
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Add-Ons Section */}
        <div className="space-y-3">
          <h4 className="font-semibold">🎁 Add-Ons (Optional)</h4>
          <button
            type="button"
            onClick={() => setAddons([...addons, { name: '', price: '' }])}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg"
          >
            + Add Add-On
          </button>
          
          {addons.map((addon, idx) => (
            <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg">
              <input
                type="text"
                placeholder="Add-on Name (e.g., Same-Day Edit)"
                value={addon.name || ''}
                onChange={(e) => {
                  const updated = [...addons];
                  updated[idx].name = e.target.value;
                  setAddons(updated);
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Price"
                value={addon.price || ''}
                onChange={(e) => {
                  const updated = [...addons];
                  updated[idx].price = parseFloat(e.target.value);
                  setAddons(updated);
                }}
                className="w-32 px-3 py-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => setAddons(addons.filter((_, i) => i !== idx))}
                className="px-3 py-2 bg-red-500 text-white rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Existing simple pricing UI */}
    {pricingMode === 'simple' && (
      {/* ...your existing price range selector... */}
    )}
  </div>
)}
```

**Save file.**

---

### 3.2: Display Itemization in Service Card (5 minutes)

**File**: `src/pages/users/vendor/services/components/ServiceCard.tsx`

**Find the pricing display section** (around line 100-150):

**ADD this AFTER the existing price display**:
```tsx
{/* Existing price display */}
<div className="flex justify-between items-center">
  <span className="text-2xl font-bold text-pink-600">
    {service.price_range || `₱${service.price?.toLocaleString()}`}
  </span>
</div>

{/* NEW: Show itemized pricing if available */}
{service.pricing_details?.packages && service.pricing_details.packages.length > 0 && (
  <div className="mt-4 space-y-3">
    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
      <span>📦</span> Package Options
    </h4>
    {service.pricing_details.packages.slice(0, 2).map((pkg: any, idx: number) => (
      <div key={idx} className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-200">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-gray-800">{pkg.name}</span>
          <span className="text-pink-600 font-bold">
            ₱{pkg.price?.toLocaleString()}
          </span>
        </div>
        
        {/* Personnel */}
        {pkg.personnel && pkg.personnel.length > 0 && (
          <ul className="text-sm text-gray-600 space-y-1">
            {pkg.personnel.map((p: any, pIdx: number) => (
              <li key={pIdx} className="flex items-start gap-2">
                <span className="text-pink-500">👤</span>
                <span>{p.quantity}× {p.role} ({p.hours}h)</span>
              </li>
            ))}
          </ul>
        )}
        
        {/* Equipment */}
        {pkg.equipment && pkg.equipment.length > 0 && (
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            {pkg.equipment.map((e: any, eIdx: number) => (
              <li key={eIdx} className="flex items-start gap-2">
                <span className="text-purple-500">📷</span>
                <span>{e.quantity}× {e.item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
    
    {service.pricing_details.packages.length > 2 && (
      <p className="text-sm text-gray-500 text-center">
        +{service.pricing_details.packages.length - 2} more packages
      </p>
    )}
  </div>
)}

{/* Add-ons */}
{service.pricing_details?.addons && service.pricing_details.addons.length > 0 && (
  <div className="mt-3">
    <h5 className="text-sm font-semibold text-gray-600 mb-2">🎁 Add-Ons Available:</h5>
    <div className="flex flex-wrap gap-2">
      {service.pricing_details.addons.map((addon: any, idx: number) => (
        <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {addon.name} (+₱{addon.price?.toLocaleString()})
        </span>
      ))}
    </div>
  </div>
)}
```

**Save file.**

---

## ⚡ STEP 4: TEST & DEPLOY (5 minutes)

### Test Locally:
```bash
# 1. Start dev server
npm run dev

# 2. Login as vendor
# 3. Go to "My Services"
# 4. Click "Add Service"
# 5. Fill Step 1 (Basic Info)
# 6. On Step 2, click "Itemized Pricing"
# 7. Add a package with personnel and equipment
# 8. Add an add-on
# 9. Complete remaining steps
# 10. Submit!
```

### Deploy:
```bash
# 1. Commit changes
git add .
git commit -m "feat: Add itemized pricing support with packages, personnel, and addons"
git push origin main

# 2. Deploy backend
cd backend-deploy
git add .
git commit -m "feat: Accept pricing_details field in services API"
git push origin main
# Render auto-deploys

# 3. Deploy frontend
firebase deploy
```

### Verify in Production:
1. Go to https://weddingbazaarph.web.app/vendor/services
2. Create a test service with itemized pricing
3. Check database: `SELECT pricing_details FROM services WHERE id = 'your-service-id'`
4. Verify JSON structure is saved correctly

---

## ✅ SUCCESS CHECKLIST

After completing all steps, you should have:
- [ ] `pricing_details` column exists in `services` table
- [ ] Backend accepts and saves `pricing_details` JSON
- [ ] Vendor can toggle between "Simple" and "Itemized" pricing
- [ ] Vendor can add multiple packages with personnel/equipment
- [ ] Vendor can add optional add-ons
- [ ] Service cards display itemized pricing beautifully
- [ ] Data persists to database in structured JSON format

---

## 🎉 WHAT YOU'VE ACHIEVED

Vendors can now:
1. ✅ Create packages (Basic, Standard, Premium)
2. ✅ Specify personnel per package (2 photographers, 1 videographer)
3. ✅ List equipment included (cameras, drones, lights)
4. ✅ Offer add-ons (Same-Day Edit, Extra Hours)
5. ✅ Show transparent pricing breakdown to customers

Customers can now:
1. ✅ See exactly what's included in each package
2. ✅ Compare package tiers easily
3. ✅ Understand what they're paying for
4. ✅ Choose add-ons to customize their booking

---

## 🚀 NEXT STEPS (Optional Future Enhancements)

### Week 2: Advanced Features
- [ ] Drag-and-drop package builder UI
- [ ] Pre-built package templates per category
- [ ] Package comparison table
- [ ] Deliverables section (photos, videos, prints)

### Week 3: Dynamic Pricing
- [ ] Hourly rate calculator (e.g., 8 hours base, ₱5k per extra hour)
- [ ] Per-pax pricing for catering (₱800/pax)
- [ ] Seasonal pricing (peak vs off-peak)
- [ ] Bulk discount rules

### Week 4: Customer Experience
- [ ] Package selector in booking flow
- [ ] Add-on checkbox list during booking
- [ ] Dynamic total price calculator
- [ ] Package comparison side-by-side

---

## ❓ TROUBLESHOOTING

### "Column already exists" error:
- Safe to ignore, `IF NOT EXISTS` handles it
- Run: `node check-service-tables.cjs` to verify

### Backend not accepting pricing_details:
- Check `services.cjs` has `pricing_details` in INSERT/UPDATE
- Check you're parsing: `const pricingDetails = req.body.pricing_details || {}`
- Check you're stringifying: `${JSON.stringify(pricingDetails)}`

### Frontend not showing itemized pricing:
- Check `pricingMode === 'itemized'` condition
- Check `packages` state is being updated
- Check `pricing_details` is in `serviceData` object
- Console.log the data before submit: `console.log('Submitting:', serviceData)`

### ServiceCard not displaying packages:
- Check `service.pricing_details` exists
- Check `service.pricing_details.packages` is array
- Check packages have `name` and `price` properties

---

## 📞 NEED HELP?

If stuck, run diagnostics:
```bash
# Check database
node check-service-tables.cjs

# Check sample service data
node -e "const {sql}=require('./backend-deploy/config/database.cjs'); (async()=>{const r=await sql\`SELECT id,title,pricing_details FROM services LIMIT 1\`; console.log(JSON.stringify(r,null,2));})();"

# Check backend logs
# Go to Render dashboard > Logs tab

# Check frontend console
# Open browser DevTools > Console tab
```

**Ready to implement?** Let's go! 🚀

Copy-paste the code blocks above and you'll have itemized pricing working in 30 minutes!
