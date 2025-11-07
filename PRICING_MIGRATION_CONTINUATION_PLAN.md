# Pricing Migration - Continuation Plan

## ✅ COMPLETED AND DEPLOYED (6 Categories)

### Phase 1-6: LIVE IN PRODUCTION ✅
1. **Photography** ✅ - 3 packages fully itemized
2. **Planning** ✅ - 3 packages fully itemized
3. **Florist** ✅ - 3 packages fully itemized  
4. **Beauty** ✅ - 3 packages fully itemized
5. **Catering** ✅ - 3 packages fully itemized
6. **Music** ✅ - 3 packages fully itemized
7. **Officiant** ✅ - 3 packages fully itemized

**All deployed to**: https://weddingbazaarph.web.app

---

## 🚧 REMAINING CATEGORIES (10 Categories)

Based on file analysis, the following categories still need conversion:

### Phase 7-16: Pending Conversion
8. **Venue** - 3 packages (Intimate Garden, Grand Ballroom, Luxury Estate)
9. **Rentals** (Event Rentals) - 3 packages (Basic Setup, Premium Setup, Luxury Event Package)
10. **Invitations** - 3 packages 
11. **Cake** - 3 packages
12. **Bridal Shop** - 3 packages
13. **Transportation** - 3 packages
14. **Bar Service** - 3 packages
15. **Favors** - 3 packages
16. **Decor** - 3 packages
17. **Lighting** - 3 packages

---

## 📝 CONVERSION TEMPLATE

For each remaining category, follow this exact pattern:

```typescript
CategoryName: [
  {
    item_name: 'Basic Package Name',
    description: 'Package description',
    price: TOTAL_PRICE,
    tier: 'basic',
    inclusions: [
      { name: 'Item name', quantity: X, unit: 'unit', unit_price: PRICE, description: 'Description' },
      // ... more items
    ],
    exclusions: ['Item 1', 'Item 2'],
    display_order: 0,
    is_active: true
  },
  {
    item_name: 'Standard Package Name',
    description: 'Package description',
    price: TOTAL_PRICE,
    tier: 'standard',
    inclusions: [
      { name: 'Item name', quantity: X, unit: 'unit', unit_price: PRICE, description: 'Description' },
      // ... more items
    ],
    exclusions: ['Item 1', 'Item 2'],
    display_order: 1,
    is_active: true
  },
  {
    item_name: 'Premium Package Name',
    description: 'Package description',
    price: TOTAL_PRICE,
    tier: 'premium',
    inclusions: [
      { name: 'Item name', quantity: X, unit: 'unit', unit_price: PRICE, description: 'Description' },
      // ... more items
    ],
    exclusions: [],
    display_order: 2,
    is_active: true
  }
]
```

---

## ⚡ RAPID DEPLOYMENT STRATEGY

To complete the remaining 10 categories quickly:

### Option A: Batch Conversion (Recommended)
Convert all 10 remaining categories in ONE session, then:
```powershell
npm run build
firebase deploy --only hosting
```

**Advantage**: Single deployment, all categories live at once
**Time Estimate**: 45-60 minutes for all conversions + 1 deployment

### Option B: Phased Deployment
Convert 2-3 categories at a time, deploy after each batch:
```powershell
# After each batch of 2-3 categories:
npm run build
firebase deploy --only hosting
```

**Advantage**: Incremental progress, test after each batch
**Time Estimate**: 60-90 minutes total (10 min per category + deployment time)

---

## 🎯 PRICING GUIDELINES (Per Category)

### Venue Pricing
- **Basic**: ₱50,000-₱100,000 (venue rental, basic setup)
- **Standard**: ₱150,000-₱250,000 (with A/V, furniture, coordinator)
- **Premium**: ₱300,000+ (full estate, luxury amenities, overnight stay)

**Unit Prices**:
- Venue rental: ₱5,000-₱15,000 per hour
- Tables/chairs: ₱200-₱800 per unit
- A/V equipment: ₱5,000-₱20,000 per setup
- Coordinator: ₱5,000-₱10,000 per service

### Rentals Pricing
- **Basic**: ₱30,000-₱50,000 (tables, chairs, basic linens)
- **Standard**: ₱75,000-₱120,000 (premium furniture, dance floor, décor)
- **Premium**: ₱150,000+ (tents, luxury furniture, generators, lighting)

**Unit Prices**:
- Tables: ₱500-₱1,500 per table
- Chairs: ₱100-₱500 per chair
- Dance floor: ₱3,000-₱8,000 per sq meter
- Tent: ₱10,000-₱50,000 per setup

### Invitations Pricing
- **Basic**: ₱15,000-₱30,000 (100-150 pcs, simple design)
- **Standard**: ₱40,000-₱60,000 (150-200 pcs, premium paper)
- **Premium**: ₱80,000+ (200+ pcs, luxury materials, custom design)

**Unit Prices**:
- Invitation cards: ₱100-₱500 per piece
- Design service: ₱5,000-₱15,000
- Printing: ₱50-₱200 per card
- Delivery: ₱2,000-₱5,000

### Cake Pricing
- **Basic**: ₱8,000-₱15,000 (3-tier, serves 80-100)
- **Standard**: ₱20,000-₱35,000 (4-tier, custom design, serves 150)
- **Premium**: ₱50,000+ (5+ tiers, luxury design, sugar flowers)

**Unit Prices**:
- Cake per tier: ₱3,000-₱15,000 per tier
- Custom design: ₱5,000-₱20,000
- Sugar flowers: ₱500-₱2,000 per flower
- Delivery/setup: ₱1,500-₱3,000

### Bridal Shop Pricing
- **Basic**: ₱25,000-₱40,000 (wedding gown rental)
- **Standard**: ₱60,000-₱100,000 (custom gown, alterations)
- **Premium**: ₱150,000+ (designer gown, full bridal package)

**Unit Prices**:
- Gown rental: ₱20,000-₱35,000
- Custom gown: ₱40,000-₱120,000
- Alterations: ₱3,000-₱10,000
- Accessories: ₱2,000-₱15,000

### Transportation Pricing
- **Basic**: ₱15,000-₱25,000 (bridal car, 5 hours)
- **Standard**: ₱35,000-₱60,000 (limo + 2 cars, 8 hours)
- **Premium**: ₱100,000+ (fleet of luxury cars, full day, drivers)

**Unit Prices**:
- Luxury car: ₱3,000-₱8,000 per hour
- Limousine: ₱5,000-₱12,000 per hour
- Vintage car: ₱4,000-₱10,000 per hour
- Driver: ₱1,000-₱2,000 per hour

### Bar Service Pricing
- **Basic**: ₱20,000-₱35,000 (100 pax, beer/wine/soft drinks)
- **Standard**: ₱50,000-₱80,000 (150 pax, cocktails, bartender)
- **Premium**: ₱120,000+ (open bar, premium spirits, mixologists)

**Unit Prices**:
- Beer per person: ₱100-₱200
- Wine per person: ₱150-₱400
- Cocktails: ₱200-₱500 per drink
- Bartender: ₱3,000-₱8,000 per person

### Favors Pricing
- **Basic**: ₱8,000-₱15,000 (100 pcs, simple favors)
- **Standard**: ₱20,000-₱35,000 (150 pcs, custom packaging)
- **Premium**: ₱50,000+ (200+ pcs, luxury favors, personalized)

**Unit Prices**:
- Favor per guest: ₱80-₱500
- Custom packaging: ₱50-₱200 per unit
- Personalization: ₱20-₱100 per favor

### Decor Pricing
- **Basic**: ₱35,000-₱60,000 (ceremony/reception basics)
- **Standard**: ₱80,000-₱150,000 (full venue styling, florals)
- **Premium**: ₱250,000+ (luxury styling, installations, themed)

**Unit Prices**:
- Centerpieces: ₱1,000-₱5,000 per table
- Backdrop: ₱5,000-₱20,000 per setup
- Floral arch: ₱5,000-₱15,000
- Draping: ₱3,000-₱10,000 per area

### Lighting Pricing
- **Basic**: ₱20,000-₱35,000 (uplighting, dance floor)
- **Standard**: ₱50,000-₱80,000 (intelligent lights, gobos, pinspots)
- **Premium**: ₱120,000+ (full production lighting, video walls)

**Unit Prices**:
- Uplighting: ₱500-₱1,500 per fixture
- Pinspots: ₱300-₱800 per light
- Intelligent lights: ₱2,000-₱5,000 per fixture
- Lighting tech: ₱5,000-₱10,000 per person

---

## ✅ QUALITY CHECKLIST

After completing all conversions, verify:

- [ ] All `inclusions` arrays are `PackageInclusion[]` (not `string[]`)
- [ ] Each inclusion has: `name`, `quantity`, `unit`, `unit_price`, `description`
- [ ] All packages have `tier` field ('basic', 'standard', 'premium')
- [ ] Unit prices are realistic for Philippine market
- [ ] Package total price ≈ sum of (quantity × unit_price) for all items
- [ ] TypeScript compilation succeeds (`npm run build`)
- [ ] Firebase deployment completes successfully
- [ ] AddServiceForm opens without errors in production
- [ ] PackageBuilder displays itemization correctly
- [ ] Auto-calculation works for all categories

---

## 📊 COMPLETION STATUS

| Category | Status | Packages | Deployment |
|----------|--------|----------|------------|
| Photography | ✅ DONE | 3 | LIVE |
| Planning | ✅ DONE | 3 | LIVE |
| Florist | ✅ DONE | 3 | LIVE |
| Beauty | ✅ DONE | 3 | LIVE |
| Catering | ✅ DONE | 3 | LIVE |
| Music | ✅ DONE | 3 | LIVE |
| Officiant | ✅ DONE | 3 | LIVE |
| Venue | 🚧 PENDING | 3 | - |
| Rentals | 🚧 PENDING | 3 | - |
| Invitations | 🚧 PENDING | 3 | - |
| Cake | 🚧 PENDING | 3 | - |
| Bridal Shop | 🚧 PENDING | 3 | - |
| Transportation | 🚧 PENDING | 3 | - |
| Bar Service | 🚧 PENDING | 3 | - |
| Favors | 🚧 PENDING | 3 | - |
| Decor | 🚧 PENDING | 3 | - |
| Lighting | 🚧 PENDING | 3 | - |

**Progress**: 7/17 categories complete (41%)

---

## 🎯 NEXT STEPS

1. Continue conversion following the established pattern
2. Use Option A (Batch Conversion) for speed
3. Complete all 10 remaining categories in one session
4. Build and deploy once at the end
5. Test in production at https://weddingbazaarph.web.app
6. Update this document when complete

**Estimated Time to Completion**: 60-90 minutes
