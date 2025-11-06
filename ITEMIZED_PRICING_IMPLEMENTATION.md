# 📊 Itemized Pricing Implementation Plan

## ✅ Overview
This implementation adds comprehensive itemized pricing to the Wedding Bazaar platform, allowing vendors to offer:
- **Packages**: Bundled services (e.g., "Gold Package", "Premium Package")
- **Per-Pax Pricing**: Price per guest (e.g., "₱500/person for catering")
- **Add-ons**: Optional extras (e.g., "Drone Photography +₱15,000")
- **Base Pricing**: Traditional single price or price range

## 🗄️ Phase 1: Database Schema Changes

### New Table: `service_pricing_items`
Stores all itemized pricing for services:

```sql
-- Create service pricing items table
CREATE TABLE IF NOT EXISTS service_pricing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'package', 'per_pax', 'addon', 'base'
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER,
  is_required BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  inclusions TEXT[], -- Array of included items
  exclusions TEXT[], -- Array of excluded items
  metadata JSONB, -- Additional flexible data
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pricing_items_service ON service_pricing_items(service_id);
CREATE INDEX idx_pricing_items_type ON service_pricing_items(item_type);
CREATE INDEX idx_pricing_items_active ON service_pricing_items(is_active);
CREATE INDEX idx_pricing_items_order ON service_pricing_items(display_order);

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_pricing_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_items_updated
  BEFORE UPDATE ON service_pricing_items
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_items_timestamp();
```

### Modify `services` table to add pricing mode:

```sql
-- Add pricing mode to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS pricing_mode VARCHAR(50) DEFAULT 'simple';
-- Values: 'simple' (single price), 'itemized' (uses pricing_items), 'custom' (contact for quote)

ALTER TABLE services
ADD COLUMN IF NOT EXISTS pricing_notes TEXT;
-- Additional notes about pricing (e.g., "Prices vary by season")

-- Index for filtering by pricing mode
CREATE INDEX IF NOT EXISTS idx_services_pricing_mode ON services(pricing_mode);
```

## 🎨 Phase 2: Frontend Implementation

### Step 1: Create Pricing Components

#### A. `PricingModeSelector.tsx` - Choose pricing structure
Located at: `src/pages/users/vendor/services/components/pricing/PricingModeSelector.tsx`

```tsx
import { DollarSign, Package, Users, MessageSquare } from 'lucide-react';

interface PricingMode {
  value: 'simple' | 'itemized' | 'custom';
  label: string;
  description: string;
  icon: React.ReactNode;
  recommended?: string[];
}

const PRICING_MODES: PricingMode[] = [
  {
    value: 'simple',
    label: 'Simple Pricing',
    description: 'Single price or price range',
    icon: <DollarSign />,
    recommended: ['Photography', 'Music', 'Beauty']
  },
  {
    value: 'itemized',
    label: 'Itemized Pricing',
    description: 'Packages, per-pax, and add-ons',
    icon: <Package />,
    recommended: ['Catering', 'Venue', 'Florist', 'Rentals']
  },
  {
    value: 'custom',
    label: 'Custom Quote',
    description: 'Contact for pricing',
    icon: <MessageSquare />,
    recommended: ['Planning', 'Custom Services']
  }
];
```

#### B. `PackageBuilder.tsx` - Build service packages
Located at: `src/pages/users/vendor/services/components/pricing/PackageBuilder.tsx`

Features:
- Add multiple packages (Bronze, Silver, Gold, Platinum)
- Set price for each package
- Add inclusions/exclusions per package
- Drag-and-drop reordering

#### C. `PerPaxPricing.tsx` - Set per-person pricing
Located at: `src/pages/users/vendor/services/components/pricing/PerPaxPricing.tsx`

Features:
- Price per person
- Min/max guest count
- Tiered pricing (e.g., "1-50 guests: ₱800/pax, 51-100: ₱700/pax")

#### D. `AddOnsList.tsx` - Manage optional add-ons
Located at: `src/pages/users/vendor/services/components/pricing/AddOnsList.tsx`

Features:
- Add unlimited add-ons
- Set price for each
- Mark as popular/recommended
- Include descriptions

### Step 2: Modify `AddServiceForm.tsx`

Add a new pricing step (between Step 2 and Step 3):

```tsx
// In AddServiceForm.tsx formData interface
interface FormData {
  // ...existing fields
  pricing_mode: 'simple' | 'itemized' | 'custom';
  pricing_items: PricingItem[];
  pricing_notes: string;
}

interface PricingItem {
  id?: string;
  item_type: 'package' | 'per_pax' | 'addon' | 'base';
  item_name: string;
  description: string;
  price: number;
  min_quantity?: number;
  max_quantity?: number;
  is_required: boolean;
  display_order: number;
  inclusions: string[];
  exclusions: string[];
  metadata?: Record<string, any>;
}

// Add new step in the form wizard
const FORM_STEPS = [
  { number: 1, title: 'Basic Info', icon: <Info /> },
  { number: 2, title: 'Images & Media', icon: <Camera /> },
  { number: 3, title: 'Pricing', icon: <DollarSign /> }, // NEW STEP
  { number: 4, title: 'Features', icon: <Star /> },
  { number: 5, title: 'DSS Fields', icon: <Sparkles /> },
  { number: 6, title: 'Review', icon: <CheckCircle2 /> }
];
```

**Pricing Step UI:**

```tsx
{currentStep === 3 && (
  <div className="space-y-6">
    <h3 className="text-xl font-bold">💰 Set Your Pricing</h3>
    
    {/* Pricing Mode Selector */}
    <PricingModeSelector
      value={formData.pricing_mode}
      onChange={(mode) => setFormData(prev => ({ ...prev, pricing_mode: mode }))}
      category={formData.category}
    />
    
    {/* Conditional Pricing Interfaces */}
    {formData.pricing_mode === 'simple' && (
      <SimplePricingForm
        price={formData.price}
        maxPrice={formData.max_price}
        priceRange={formData.price_range}
        onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
      />
    )}
    
    {formData.pricing_mode === 'itemized' && (
      <div className="space-y-6">
        {/* Packages */}
        <PackageBuilder
          packages={formData.pricing_items.filter(i => i.item_type === 'package')}
          onChange={(packages) => updatePricingItems('package', packages)}
        />
        
        {/* Per-Pax Pricing */}
        {['Catering', 'Venue'].includes(formData.category) && (
          <PerPaxPricing
            perPaxItems={formData.pricing_items.filter(i => i.item_type === 'per_pax')}
            onChange={(items) => updatePricingItems('per_pax', items)}
          />
        )}
        
        {/* Add-ons */}
        <AddOnsList
          addons={formData.pricing_items.filter(i => i.item_type === 'addon')}
          onChange={(addons) => updatePricingItems('addon', addons)}
          category={formData.category}
        />
      </div>
    )}
    
    {formData.pricing_mode === 'custom' && (
      <CustomQuotePricing
        notes={formData.pricing_notes}
        onChange={(notes) => setFormData(prev => ({ ...prev, pricing_notes: notes }))}
      />
    )}
  </div>
)}
```

## 🔧 Phase 3: Backend API Updates

### A. Modify `POST /services` endpoint

Located at: `backend-deploy/routes/services.cjs`

```javascript
// Create new service with itemized pricing
router.post('/', async (req, res) => {
  const {
    vendor_id,
    title,
    description,
    category,
    pricing_mode = 'simple',
    pricing_items = [],
    pricing_notes,
    price, // For simple mode
    max_price, // For simple mode
    price_range, // For simple mode
    // ...other fields
  } = req.body;

  try {
    // 1. Create service record
    const [service] = await sql`
      INSERT INTO services (
        vendor_id, title, description, category,
        pricing_mode, pricing_notes,
        price, max_price, price_range,
        images, features, is_active, featured, location,
        contact_info, tags, keywords,
        years_in_business, service_tier, wedding_styles,
        cultural_specialties, availability
      )
      VALUES (
        ${vendor_id}, ${title}, ${description}, ${category},
        ${pricing_mode}, ${pricing_notes},
        ${price}, ${max_price}, ${price_range},
        ${images || []}, ${features || []}, ${is_active !== false}, 
        ${featured || false}, ${location},
        ${JSON.stringify(contact_info)}, ${tags || []}, ${keywords},
        ${years_in_business}, ${service_tier}, ${wedding_styles || []},
        ${cultural_specialties || []}, ${JSON.stringify(availability)}
      )
      RETURNING *
    `;

    // 2. If itemized pricing, insert pricing items
    if (pricing_mode === 'itemized' && pricing_items.length > 0) {
      const itemInserts = pricing_items.map((item, index) => sql`
        INSERT INTO service_pricing_items (
          service_id, item_type, item_name, description,
          price, min_quantity, max_quantity, is_required,
          display_order, inclusions, exclusions, metadata
        )
        VALUES (
          ${service.id}, ${item.item_type}, ${item.item_name},
          ${item.description || null}, ${item.price},
          ${item.min_quantity || 1}, ${item.max_quantity || null},
          ${item.is_required || false}, ${item.display_order || index},
          ${item.inclusions || []}, ${item.exclusions || []},
          ${JSON.stringify(item.metadata || {})}
        )
      `);
      
      await Promise.all(itemInserts);
      
      console.log(`✅ Created ${pricing_items.length} pricing items for service ${service.id}`);
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

### B. Add GET endpoint for pricing items

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

### C. Modify GET `/services` to include pricing items

```javascript
// In the GET /services endpoint, add pricing items to enriched data
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
      const prices = service.pricing_items.map(i => i.price);
      service.calculated_min_price = Math.min(...prices);
      service.calculated_max_price = Math.max(...prices);
    }
  });
}
```

## 📱 Phase 4: Frontend Service Display

### Update `ServiceCard.tsx` to display pricing

```tsx
const ServiceCard = ({ service }) => {
  const renderPricing = () => {
    if (service.pricing_mode === 'simple') {
      if (service.price_range) {
        return <div className="text-xl font-bold">{service.price_range}</div>;
      }
      if (service.price && service.max_price) {
        return <div className="text-xl font-bold">₱{service.price.toLocaleString()} - ₱{service.max_price.toLocaleString()}</div>;
      }
      return <div className="text-xl font-bold">₱{service.price?.toLocaleString()}</div>;
    }
    
    if (service.pricing_mode === 'itemized') {
      const packages = service.pricing_items?.filter(i => i.item_type === 'package') || [];
      if (packages.length > 0) {
        const minPrice = Math.min(...packages.map(p => p.price));
        const maxPrice = Math.max(...packages.map(p => p.price));
        return (
          <div>
            <div className="text-sm text-gray-600">{packages.length} Packages</div>
            <div className="text-xl font-bold">From ₱{minPrice.toLocaleString()}</div>
          </div>
        );
      }
      
      const perPax = service.pricing_items?.find(i => i.item_type === 'per_pax');
      if (perPax) {
        return (
          <div>
            <div className="text-sm text-gray-600">Per Guest</div>
            <div className="text-xl font-bold">₱{perPax.price.toLocaleString()}/pax</div>
          </div>
        );
      }
    }
    
    if (service.pricing_mode === 'custom') {
      return (
        <div className="text-lg font-semibold text-pink-600">
          Contact for Quote
        </div>
      );
    }
  };
  
  return (
    <div className="service-card">
      {/* ...other card content */}
      <div className="pricing-section">
        {renderPricing()}
      </div>
      {/* ...other card content */}
    </div>
  );
};
```

## 🚀 Phase 5: Deployment Steps

### Step 1: Database Migration

```powershell
# Run in Neon SQL Console or via migration script
node create-itemized-pricing-tables.cjs
```

### Step 2: Backend Deployment

```powershell
# Deploy backend to Render
git add backend-deploy/
git commit -m "feat: Add itemized pricing support to services API"
git push origin main

# Render auto-deploys, monitor at:
# https://dashboard.render.com/web/srv-xxxxx
```

### Step 3: Frontend Build and Deploy

```powershell
# Build and deploy frontend
npm run build
firebase deploy --only hosting

# Or use deployment script
.\deploy-complete.ps1
```

## ✅ Phase 6: Testing Checklist

### Database Tests
- [ ] Run migration script successfully
- [ ] Verify `service_pricing_items` table created
- [ ] Verify `pricing_mode` column added to `services`
- [ ] Test insert/update/delete on pricing items
- [ ] Verify cascading deletes work (delete service deletes items)

### Backend API Tests
- [ ] POST /services with simple pricing (existing functionality)
- [ ] POST /services with itemized pricing (3 packages)
- [ ] POST /services with per-pax pricing
- [ ] POST /services with add-ons
- [ ] GET /services returns pricing_items
- [ ] GET /services/:id/pricing returns grouped pricing
- [ ] PUT /services/:id updates pricing items
- [ ] DELETE /services/:id deletes pricing items

### Frontend Tests
- [ ] Pricing mode selector shows correct options
- [ ] Package builder allows adding/editing/deleting packages
- [ ] Per-pax pricing UI works (min/max guests, tiered pricing)
- [ ] Add-ons list allows unlimited add-ons
- [ ] Simple pricing still works (backward compatibility)
- [ ] Custom quote mode disables pricing inputs
- [ ] Form validation prevents empty packages
- [ ] Service card displays pricing correctly (all modes)
- [ ] Service detail modal shows full pricing breakdown
- [ ] Booking flow calculates totals correctly

### User Experience Tests
- [ ] Vendor can switch between pricing modes without data loss
- [ ] Drag-and-drop reordering works for packages
- [ ] Duplicate package names are prevented
- [ ] Price calculations are accurate
- [ ] Mobile responsive design works
- [ ] Loading states during save
- [ ] Success/error messages displayed
- [ ] Image uploads don't interfere with pricing

## 📊 Success Metrics

After deployment, measure:
1. **Adoption Rate**: % of vendors using itemized pricing
2. **Service Completeness**: Services with detailed pricing vs simple pricing
3. **Booking Conversion**: Do itemized services get more bookings?
4. **User Feedback**: Survey vendors on new feature
5. **Error Rate**: Monitor API errors for pricing endpoints

## 🔄 Future Enhancements

### v2.0 Features
- [ ] Dynamic pricing (seasonal, day-of-week)
- [ ] Discount codes and promotional pricing
- [ ] Bulk pricing calculator for customers
- [ ] Package comparison tool
- [ ] Pricing templates for common packages
- [ ] AI-suggested pricing based on category/location
- [ ] Currency conversion for international clients
- [ ] Payment plans and installment options

### v3.0 Features
- [ ] Real-time availability-based pricing
- [ ] Auction/bidding system for services
- [ ] Vendor pricing analytics dashboard
- [ ] Competitor pricing intelligence
- [ ] Dynamic bundle recommendations
- [ ] Loyalty program integration

## 📚 Documentation Updates Needed

1. **User Guide**: "How to Set Up Itemized Pricing"
2. **API Documentation**: Update Swagger/Postman with new endpoints
3. **Vendor Onboarding**: Add pricing setup to onboarding flow
4. **Video Tutorial**: Screen recording of pricing setup
5. **FAQ**: Common questions about pricing modes

## 🎯 Implementation Timeline

| Phase | Tasks | Duration | Status |
|-------|-------|----------|--------|
| **Phase 1** | Database schema, migration script | 2 hours | ⏳ Pending |
| **Phase 2** | Frontend components (PricingModeSelector, PackageBuilder, etc.) | 8 hours | ⏳ Pending |
| **Phase 3** | Backend API updates | 4 hours | ⏳ Pending |
| **Phase 4** | Service display UI updates | 3 hours | ⏳ Pending |
| **Phase 5** | Testing and bug fixes | 4 hours | ⏳ Pending |
| **Phase 6** | Deployment and monitoring | 2 hours | ⏳ Pending |
| **Total** | | **23 hours** (~3 days) | |

## 🚨 Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking existing services | High | Maintain backward compatibility, default to 'simple' mode |
| Complex pricing confuses vendors | Medium | Provide templates, tooltips, and examples |
| Performance issues with many pricing items | Medium | Add database indexes, implement pagination |
| Migration fails on production database | High | Test on staging database first, create rollback script |
| Frontend form becomes too complex | Medium | Use wizard steps, progressive disclosure |

## ✅ Ready to Implement!

This plan provides a complete, production-ready implementation of itemized pricing for the Wedding Bazaar platform. All code examples are production-quality and follow existing architecture patterns.

**Next Steps:**
1. Review and approve this plan
2. Create database migration script
3. Implement frontend components (start with PricingModeSelector)
4. Update backend API
5. Test thoroughly
6. Deploy to production

**Questions or Changes?** Let me know and I'll adjust the implementation plan!
