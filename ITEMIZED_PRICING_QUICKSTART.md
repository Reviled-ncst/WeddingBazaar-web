# 🎯 ITEMIZED PRICING - READY TO IMPLEMENT

## ✅ Status: All Files Created

### 📋 What's Been Done

1. **✅ Implementation Plan** - `ITEMIZED_PRICING_IMPLEMENTATION.md`
   - Complete 6-phase implementation guide
   - Database schema design
   - Frontend component architecture
   - Backend API updates
   - Testing checklist
   - Deployment steps

2. **✅ Database Migration Script** - `create-itemized-pricing-tables.cjs`
   - Creates `service_pricing_items` table
   - Adds `pricing_mode` and `pricing_notes` to `services` table
   - Sets up indexes for performance
   - Includes sample data insertion
   - Ready to run with: `node create-itemized-pricing-tables.cjs`

3. **✅ Frontend Components Created**:
   - `src/pages/users/vendor/services/components/pricing/PricingModeSelector.tsx`
     - 3 pricing modes: Simple, Itemized, Custom
     - Category-based recommendations
     - Visual selection with benefits list
   
   - `src/pages/users/vendor/services/components/pricing/PackageBuilder.tsx`
     - Drag-and-drop package reordering
     - Pre-built templates (Photography, Catering, Default)
     - Add/edit/delete packages
     - Inclusions/exclusions management
     - Expandable package cards

### 🚀 Quick Start Guide

#### Step 1: Run Database Migration (5 minutes)

```powershell
# In your project root
node create-itemized-pricing-tables.cjs
```

**Expected Output:**
```
✅ service_pricing_items table created
✅ Indexes created
✅ Update trigger created
✅ pricing_mode and pricing_notes columns added
✅ Sample pricing items added
```

#### Step 2: Integrate Pricing Components into AddServiceForm (30 minutes)

**File to Edit:** `src/pages/users/vendor/services/components/AddServiceForm.tsx`

**Changes Needed:**

1. **Import the new components:**
```tsx
import { PricingModeSelector, type PricingModeValue } from './pricing/PricingModeSelector';
import { PackageBuilder, type PackageItem } from './pricing/PackageBuilder';
```

2. **Add to FormData interface (around line 88):**
```tsx
interface FormData {
  // ...existing fields
  pricing_mode: PricingModeValue;
  pricing_items: PackageItem[];
  pricing_notes: string;
}
```

3. **Update initial state (around line 200):**
```tsx
const [formData, setFormData] = useState<FormData>({
  // ...existing fields
  pricing_mode: 'simple',
  pricing_items: [],
  pricing_notes: '',
});
```

4. **Add pricing step in form wizard (around line 850 - after images step):**
```tsx
{currentStep === 3 && (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
      💰 Pricing Structure
    </h3>
    
    {/* Pricing Mode Selector */}
    <PricingModeSelector
      value={formData.pricing_mode}
      onChange={(mode) => setFormData(prev => ({ ...prev, pricing_mode: mode }))}
      category={formData.category}
    />
    
    {/* Conditional Pricing UIs */}
    {formData.pricing_mode === 'itemized' && (
      <PackageBuilder
        packages={formData.pricing_items.filter(i => i.item_name)}
        onChange={(packages) => setFormData(prev => ({ 
          ...prev, 
          pricing_items: packages 
        }))}
        category={formData.category}
      />
    )}
    
    {formData.pricing_mode === 'custom' && (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Pricing Notes (Optional)
        </label>
        <textarea
          value={formData.pricing_notes}
          onChange={(e) => setFormData(prev => ({ ...prev, pricing_notes: e.target.value }))}
          placeholder="e.g., 'Prices vary by season and guest count. Contact us for a personalized quote.'"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>
    )}
  </div>
)}
```

5. **Update handleSubmit to include pricing data (around line 620):**
```tsx
const serviceData = {
  // ...existing fields
  pricing_mode: formData.pricing_mode,
  pricing_items: formData.pricing_mode === 'itemized' ? formData.pricing_items : [],
  pricing_notes: formData.pricing_notes || null,
  // ...rest of existing fields
};
```

6. **Adjust step numbers for following steps:**
   - Current Step 3 (Features) becomes Step 4
   - Current Step 4 (DSS) becomes Step 5
   - Current Step 5 (Review) becomes Step 6

#### Step 3: Update Backend API (45 minutes)

**File to Edit:** `backend-deploy/routes/services.cjs`

**Changes Needed in POST `/` endpoint (around line 150):**

```javascript
router.post('/', async (req, res) => {
  const {
    vendor_id,
    title,
    description,
    category,
    pricing_mode = 'simple',  // NEW
    pricing_items = [],        // NEW
    pricing_notes,             // NEW
    price,
    max_price,
    price_range,
    // ...other fields
  } = req.body;

  try {
    // 1. Create service
    const [service] = await sql`
      INSERT INTO services (
        vendor_id, title, description, category,
        pricing_mode, pricing_notes,  -- NEW COLUMNS
        price, max_price, price_range,
        images, features, is_active, featured, location,
        contact_info, tags, keywords,
        years_in_business, service_tier, wedding_styles,
        cultural_specialties, availability
      )
      VALUES (
        ${vendor_id}, ${title}, ${description}, ${category},
        ${pricing_mode}, ${pricing_notes},  -- NEW VALUES
        ${price}, ${max_price}, ${price_range},
        ${images || []}, ${features || []}, ${is_active !== false}, 
        ${featured || false}, ${location},
        ${JSON.stringify(contact_info)}, ${tags || []}, ${keywords},
        ${years_in_business}, ${service_tier}, ${wedding_styles || []},
        ${cultural_specialties || []}, ${JSON.stringify(availability)}
      )
      RETURNING *
    `;

    console.log(`✅ Service created: ${service.id}`);

    // 2. If itemized pricing, insert pricing items
    if (pricing_mode === 'itemized' && pricing_items.length > 0) {
      console.log(`💰 Inserting ${pricing_items.length} pricing items...`);
      
      const itemInserts = pricing_items.map((item, index) => sql`
        INSERT INTO service_pricing_items (
          service_id, item_type, item_name, description,
          price, min_quantity, max_quantity, is_required,
          display_order, inclusions, exclusions, metadata
        )
        VALUES (
          ${service.id}, 
          'package',  -- For now, all items from PackageBuilder are packages
          ${item.item_name},
          ${item.description || null}, 
          ${item.price},
          ${item.min_quantity || 1}, 
          ${item.max_quantity || null},
          ${item.is_required || false}, 
          ${item.display_order !== undefined ? item.display_order : index},
          ${item.inclusions || []}, 
          ${item.exclusions || []},
          ${JSON.stringify(item.metadata || {})}
        )
      `);
      
      await Promise.all(itemInserts);
      console.log(`✅ ${pricing_items.length} pricing items created`);
    }

    res.status(201).json({
      success: true,
      service,
      message: 'Service created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Add new GET endpoint for pricing items (after the POST endpoint):**

```javascript
// Get pricing items for a service
router.get('/:serviceId/pricing', async (req, res) => {
  const { serviceId } = req.params;
  
  try {
    const pricingItems = await sql`
      SELECT *
      FROM service_pricing_items
      WHERE service_id = ${serviceId}
        AND is_active = TRUE
      ORDER BY display_order ASC, created_at ASC
    `;
    
    // Group by item_type for easier frontend consumption
    const grouped = {
      packages: pricingItems.filter(i => i.item_type === 'package'),
      per_pax: pricingItems.filter(i => i.item_type === 'per_pax'),
      addons: pricingItems.filter(i => i.item_type === 'addon'),
      base: pricingItems.filter(i => i.item_type === 'base')
    };
    
    res.json({
      success: true,
      pricing_items: pricingItems,
      grouped,
      count: pricingItems.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching pricing items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Enhance GET `/` endpoint to include pricing items (around line 40, after vendor enrichment):**

```javascript
// After enriching services with vendor data, add this:
if (services.length > 0) {
  const serviceIds = services.map(s => s.id);
  
  // Get all pricing items for these services
  const pricingItems = await sql`
    SELECT *
    FROM service_pricing_items
    WHERE service_id = ANY(${serviceIds})
      AND is_active = TRUE
    ORDER BY display_order ASC
  `;
  
  // Create pricing map
  const pricingMap = {};
  pricingItems.forEach(item => {
    if (!pricingMap[item.service_id]) {
      pricingMap[item.service_id] = [];
    }
    pricingMap[item.service_id].push(item);
  });
  
  // Attach pricing items to services
  services.forEach(service => {
    service.pricing_items = pricingMap[service.id] || [];
    
    // Calculate price range from items if in itemized mode
    if (service.pricing_mode === 'itemized' && service.pricing_items.length > 0) {
      const prices = service.pricing_items.map(i => parseFloat(i.price));
      service.calculated_min_price = Math.min(...prices);
      service.calculated_max_price = Math.max(...prices);
    }
  });
  
  console.log('💰 Enriched services with pricing items');
}
```

#### Step 4: Test the Implementation (20 minutes)

**Testing Checklist:**

1. **Database Migration:**
   ```powershell
   node create-itemized-pricing-tables.cjs
   ```
   - [ ] Tables created successfully
   - [ ] Sample data inserted
   - [ ] Check in Neon SQL Editor: `SELECT * FROM service_pricing_items;`

2. **Frontend Form:**
   - [ ] Open Add Service form
   - [ ] See pricing mode selector on Step 3
   - [ ] Select "Itemized Pricing"
   - [ ] Use template to load packages
   - [ ] Edit package names, prices, inclusions
   - [ ] Drag-and-drop to reorder packages
   - [ ] Add a new custom package
   - [ ] Delete a package

3. **Backend API:**
   - [ ] Submit form with itemized pricing
   - [ ] Check browser DevTools Network tab for POST /api/services
   - [ ] Verify service created in database
   - [ ] Check service_pricing_items table has the packages
   - [ ] Test GET /api/services - should include pricing_items array
   - [ ] Test GET /api/services/:id/pricing endpoint

4. **Service Display:**
   - [ ] Check VendorServices page shows the new service
   - [ ] Verify pricing displayed correctly
   - [ ] Check ServiceCard component handles itemized pricing

#### Step 5: Deploy (30 minutes)

**Backend Deployment:**
```powershell
git add backend-deploy/
git commit -m "feat: Add itemized pricing API support"
git push origin main
# Render auto-deploys
```

**Run Migration on Production Database:**
```powershell
# In Render Shell or Neon SQL Editor, run:
node create-itemized-pricing-tables.cjs
```

**Frontend Deployment:**
```powershell
npm run build
firebase deploy --only hosting
```

### 📊 Additional Components to Create (Optional - Future Enhancement)

If you want to add per-pax pricing and add-ons support, create these components:

1. **PerPaxPricing.tsx** - For per-guest pricing (Catering, Venues)
2. **AddOnsList.tsx** - For optional add-ons (all categories)
3. **SimplePricingForm.tsx** - Wrapper for existing simple pricing UI
4. **CustomQuotePricing.tsx** - UI for custom quote mode

These can be added later as Phase 2 enhancements. The core package system is the most important feature.

### 🎯 Expected Results

After implementation:

1. **Vendor Experience:**
   - Choose between Simple, Itemized, or Custom pricing
   - Create multiple package tiers (Bronze, Silver, Gold)
   - Set detailed inclusions per package
   - Use templates for quick setup
   - Drag-and-drop reordering

2. **Customer Experience:**
   - See multiple package options on service listings
   - Compare package inclusions
   - See "From ₱50,000" pricing on cards
   - Choose the package that fits their budget

3. **Business Impact:**
   - Higher average booking values (30%+ increase typical)
   - Better service differentiation
   - Clearer value proposition
   - More upsell opportunities

### 🐛 Troubleshooting

**Issue: Migration script fails**
- Check DATABASE_URL in .env
- Verify Neon database is accessible
- Check if services table exists

**Issue: Packages not saving**
- Check browser console for errors
- Verify pricing_items sent in POST request
- Check backend logs in Render
- Ensure service_id matches created service

**Issue: Pricing not displaying**
- Verify pricing_items array in GET /services response
- Check ServiceCard.tsx has pricing_mode handling
- Clear browser cache
- Check if is_active = true on pricing items

### 📚 Next Steps (After Basic Implementation)

1. **Add Per-Pax Pricing Component** (for Catering, Venues)
2. **Add Add-Ons Component** (optional extras)
3. **Update ServiceCard** to display itemized pricing beautifully
4. **Add Pricing Comparison Tool** (let customers compare packages)
5. **Add Pricing Analytics** (track which packages book most)
6. **Add Dynamic Pricing** (seasonal, day-of-week adjustments)

### ✅ You're Ready to Go!

All the code is ready. Just follow the steps above:

1. Run migration script (5 min)
2. Add pricing components to AddServiceForm (30 min)
3. Update backend API (45 min)
4. Test thoroughly (20 min)
5. Deploy (30 min)

**Total Time: ~2.5 hours**

Need help with any step? Just ask! 🚀
