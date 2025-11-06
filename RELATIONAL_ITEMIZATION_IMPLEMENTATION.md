# 🚀 RELATIONAL ITEMIZATION: Complete Implementation Guide

**Status**: ✅ Ready to implement  
**Approach**: Full relational database (4 new tables)  
**Time**: 1-2 hours for implementation  
**Result**: Proper normalized database with full itemization support

---

## 📋 QUICK START (3 COMMANDS)

```bash
# Step 1: Create tables (2 minutes)
node create-itemization-tables.cjs

# Step 2: Add sample data (1 minute)
node add-sample-itemization-data.cjs

# Step 3: Verify data (30 seconds)
node query-itemization-data.cjs
```

**That's it! Your database is now enhanced with itemization!** ✅

---

## 🗄️ NEW DATABASE SCHEMA

### Tables Created:

1. **`service_packages`** - Package templates (Basic, Premium, etc.)
2. **`package_items`** - Package contents (personnel, equipment, deliverables)
3. **`service_addons`** - Optional add-ons
4. **`service_pricing_rules`** - Dynamic pricing (per-pax, hourly, etc.)

### Relationships:

```
services
  ↓ (one-to-many)
service_packages
  ↓ (one-to-many)
package_items

services
  ↓ (one-to-many)
service_addons

services
  ↓ (one-to-many)
service_pricing_rules
```

---

## 📖 DETAILED IMPLEMENTATION

### Phase 1: Create Tables ✅

**File**: `create-itemization-tables.cjs`

**What it does**:
- Creates 4 new tables
- Adds foreign key constraints
- Creates indexes for fast queries
- Adds table comments

**Run**:
```bash
node create-itemization-tables.cjs
```

**Expected output**:
```
✅ service_packages table created
✅ package_items table created
✅ service_addons table created
✅ service_pricing_rules table created
```

---

### Phase 2: Add Sample Data ✅

**File**: `add-sample-itemization-data.cjs`

**What it does**:
- Takes first 3 services from your database
- Creates 2 packages per service (Basic & Premium)
- Adds personnel, equipment, and deliverables
- Creates 5 add-ons per service
- Adds pricing rules (hourly, per-pax if catering)

**Run**:
```bash
node add-sample-itemization-data.cjs
```

**Expected output**:
```
📦 Creating packages...
  ✓ Basic Package - ₱60,000
  ✓ Premium Package - ₱120,000

👥 Adding personnel...
  ✓ 1× Lead Photographer (8 hours)
  ✓ 1× Videographer (6 hours)

📷 Adding equipment...
  ✓ 2× DSLR Cameras
  ✓ 1× Drone

🎁 Adding add-ons...
  ✓ Extra Hour - ₱5,000
  ✓ Engagement Shoot - ₱20,000
```

---

### Phase 3: Query Data ✅

**File**: `query-itemization-data.cjs`

**What it does**:
- Displays all services with itemization
- Shows packages with full breakdown
- Lists add-ons and pricing rules
- Provides summary statistics

**Run**:
```bash
node query-itemization-data.cjs
```

**Expected output**:
```
📸 SERVICE: Photo + Video Combo Package
═══════════════════════════════════════

📦 PACKAGES (2):

┌─ Basic Package - ₱60,000
│  Perfect for intimate weddings
│
│  👥 PERSONNEL:
│     • 1× Lead Photographer (8 hours)
│     • 1× Videographer (6 hours)
│
│  📷 EQUIPMENT:
│     • 2× DSLR Camera
│     • 1× Drone (DJI Mavic)
│
│  📦 DELIVERABLES:
│     • 700× Edited Photos
│     • 1× Highlight Video (3-5 min)
└─

🎁 ADD-ONS (5):
  ✅ Extra Hour - ₱5,000
  ✅ Engagement Shoot - ₱20,000
  ✅ Second Drone - ₱8,000

💰 PRICING RULES (1):
  ✅ HOURLY: Hourly Rate Pricing
     Base: ₱50,000 for 8 hours
     Additional: ₱5,000 per hour
```

---

## 🔌 BACKEND API IMPLEMENTATION

### Update `backend-deploy/routes/services.cjs`

#### 1. Get Service with Itemization

**Add new endpoint**:
```javascript
// GET /api/services/:id/itemization
router.get('/:id/itemization', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get service
    const service = await sql`SELECT * FROM services WHERE id = ${id}`;
    if (service.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Get packages
    const packages = await sql`
      SELECT * FROM service_packages 
      WHERE service_id = ${id}
      ORDER BY display_order, package_name
    `;
    
    // Get items for each package
    for (const pkg of packages) {
      pkg.items = await sql`
        SELECT * FROM package_items 
        WHERE package_id = ${pkg.id}
        ORDER BY display_order, item_type, item_name
      `;
    }
    
    // Get add-ons
    const addons = await sql`
      SELECT * FROM service_addons 
      WHERE service_id = ${id} AND is_available = true
      ORDER BY display_order
    `;
    
    // Get pricing rules
    const pricingRules = await sql`
      SELECT * FROM service_pricing_rules 
      WHERE service_id = ${id} AND is_active = true
      ORDER BY rule_type
    `;
    
    res.json({
      service: service[0],
      packages,
      addons,
      pricingRules
    });
    
  } catch (error) {
    console.error('Error getting itemization:', error);
    res.status(500).json({ error: 'Failed to get itemization' });
  }
});
```

#### 2. Create Service with Itemization

**Update POST `/api/vendor/services`**:
```javascript
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { packages, addons, pricingRules, ...serviceData } = req.body;
    
    // 1. Create service (existing code)
    const service = await sql`INSERT INTO services (...) VALUES (...) RETURNING *`;
    const serviceId = service[0].id;
    
    // 2. Create packages
    if (packages && packages.length > 0) {
      for (const pkg of packages) {
        const packageResult = await sql`
          INSERT INTO service_packages (
            service_id, package_name, package_description, 
            base_price, is_default, display_order
          ) VALUES (
            ${serviceId}, ${pkg.name}, ${pkg.description},
            ${pkg.price}, ${pkg.isDefault || false}, ${pkg.order || 0}
          ) RETURNING id
        `;
        
        const packageId = packageResult[0].id;
        
        // 3. Create package items
        if (pkg.items && pkg.items.length > 0) {
          for (const item of pkg.items) {
            await sql`
              INSERT INTO package_items (
                package_id, item_type, item_name, item_description,
                quantity, unit_type, unit_value, display_order
              ) VALUES (
                ${packageId}, ${item.type}, ${item.name}, ${item.description || null},
                ${item.quantity || 1}, ${item.unitType || null}, 
                ${item.unitValue || null}, ${item.order || 0}
              )
            `;
          }
        }
      }
    }
    
    // 4. Create add-ons
    if (addons && addons.length > 0) {
      for (const addon of addons) {
        await sql`
          INSERT INTO service_addons (
            service_id, addon_name, addon_description, 
            addon_price, addon_type, display_order
          ) VALUES (
            ${serviceId}, ${addon.name}, ${addon.description || null},
            ${addon.price}, ${addon.type || null}, ${addon.order || 0}
          )
        `;
      }
    }
    
    // 5. Create pricing rules
    if (pricingRules && pricingRules.length > 0) {
      for (const rule of pricingRules) {
        await sql`
          INSERT INTO service_pricing_rules (
            service_id, rule_type, rule_name,
            base_unit, base_price, additional_unit_price,
            minimum_units, maximum_units
          ) VALUES (
            ${serviceId}, ${rule.type}, ${rule.name || null},
            ${rule.baseUnit || null}, ${rule.basePrice || null},
            ${rule.additionalUnitPrice || null},
            ${rule.minUnits || null}, ${rule.maxUnits || null}
          )
        `;
      }
    }
    
    res.status(201).json({ 
      success: true, 
      service,
      message: 'Service created with itemization' 
    });
    
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});
```

---

## 🎨 FRONTEND IMPLEMENTATION

### Update `AddServiceForm.tsx`

**Add state for relational data**:
```typescript
const [packages, setPackages] = useState<Package[]>([]);
const [addons, setAddons] = useState<Addon[]>([]);
const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

interface Package {
  name: string;
  description: string;
  price: number;
  isDefault: boolean;
  items: PackageItem[];
}

interface PackageItem {
  type: 'personnel' | 'equipment' | 'deliverable';
  name: string;
  description?: string;
  quantity: number;
  unitType?: string;
  unitValue?: number;
}

interface Addon {
  name: string;
  description?: string;
  price: number;
  type?: string;
}

interface PricingRule {
  type: 'hourly' | 'per_pax' | 'daily';
  name?: string;
  baseUnit?: number;
  basePrice?: number;
  additionalUnitPrice?: number;
  minUnits?: number;
  maxUnits?: number;
}
```

**Update form submission**:
```typescript
const handleSubmit = async () => {
  const serviceData = {
    // ...existing fields...
    packages: packages.map((pkg, idx) => ({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      isDefault: pkg.isDefault,
      order: idx,
      items: pkg.items.map((item, itemIdx) => ({
        type: item.type,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitType: item.unitType,
        unitValue: item.unitValue,
        order: itemIdx
      }))
    })),
    addons: addons.map((addon, idx) => ({
      name: addon.name,
      description: addon.description,
      price: addon.price,
      type: addon.type,
      order: idx
    })),
    pricingRules: pricingRules.map(rule => ({
      type: rule.type,
      name: rule.name,
      baseUnit: rule.baseUnit,
      basePrice: rule.basePrice,
      additionalUnitPrice: rule.additionalUnitPrice,
      minUnits: rule.minUnits,
      maxUnits: rule.maxUnits
    }))
  };
  
  await onSubmit(serviceData);
};
```

---

### Display Itemization in `ServiceCard.tsx`

**Fetch itemization data**:
```typescript
const [itemization, setItemization] = useState(null);

useEffect(() => {
  const fetchItemization = async () => {
    const res = await fetch(`/api/services/${service.id}/itemization`);
    const data = await res.json();
    setItemization(data);
  };
  
  fetchItemization();
}, [service.id]);
```

**Display packages**:
```tsx
{itemization?.packages && (
  <div className="mt-4 space-y-3">
    <h4 className="font-semibold">📦 Package Options:</h4>
    {itemization.packages.map(pkg => (
      <div key={pkg.id} className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="font-bold">{pkg.package_name}</span>
          <span className="text-pink-600 font-bold">
            ₱{parseFloat(pkg.base_price).toLocaleString()}
          </span>
        </div>
        
        {/* Personnel */}
        {pkg.items.filter(i => i.item_type === 'personnel').length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-600">👥 Personnel:</p>
            <ul className="text-sm text-gray-600 ml-4">
              {pkg.items.filter(i => i.item_type === 'personnel').map(item => (
                <li key={item.id}>
                  • {item.quantity}× {item.item_name} 
                  {item.unit_value && ` (${item.unit_value} ${item.unit_type})`}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Equipment */}
        {pkg.items.filter(i => i.item_type === 'equipment').length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-600">📷 Equipment:</p>
            <ul className="text-sm text-gray-600 ml-4">
              {pkg.items.filter(i => i.item_type === 'equipment').map(item => (
                <li key={item.id}>• {item.quantity}× {item.item_name}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Deliverables */}
        {pkg.items.filter(i => i.item_type === 'deliverable').length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-600">📦 Deliverables:</p>
            <ul className="text-sm text-gray-600 ml-4">
              {pkg.items.filter(i => i.item_type === 'deliverable').map(item => (
                <li key={item.id}>• {item.quantity}× {item.item_name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ))}
  </div>
)}

{/* Add-ons */}
{itemization?.addons && itemization.addons.length > 0 && (
  <div className="mt-3">
    <h5 className="text-sm font-semibold mb-2">🎁 Add-Ons:</h5>
    <div className="flex flex-wrap gap-2">
      {itemization.addons.map(addon => (
        <span key={addon.id} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
          {addon.addon_name} (+₱{parseFloat(addon.addon_price).toLocaleString()})
        </span>
      ))}
    </div>
  </div>
)}
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] **Step 1**: Run `node create-itemization-tables.cjs`
- [ ] **Step 2**: Run `node add-sample-itemization-data.cjs`
- [ ] **Step 3**: Run `node query-itemization-data.cjs` to verify
- [ ] **Step 4**: Update `backend-deploy/routes/services.cjs`
- [ ] **Step 5**: Test backend endpoints with Postman
- [ ] **Step 6**: Update `AddServiceForm.tsx`
- [ ] **Step 7**: Update `ServiceCard.tsx`
- [ ] **Step 8**: Test locally
- [ ] **Step 9**: Commit changes
- [ ] **Step 10**: Deploy backend (Render)
- [ ] **Step 11**: Deploy frontend (Firebase)
- [ ] **Step 12**: Test in production

---

## 🎉 RESULT

After implementation, vendors can:
- ✅ Create multiple package tiers (Basic, Premium, etc.)
- ✅ Define personnel per package with hours
- ✅ List equipment included
- ✅ Specify deliverables
- ✅ Offer optional add-ons
- ✅ Set dynamic pricing rules (hourly, per-pax)

Customers can:
- ✅ See exactly what's included in each package
- ✅ Compare packages side-by-side
- ✅ Choose add-ons
- ✅ Understand pricing structure

---

## 📞 READY TO IMPLEMENT?

```bash
# Start now!
node create-itemization-tables.cjs
```

**All scripts are ready. Documentation is complete. Let's build!** 🚀
