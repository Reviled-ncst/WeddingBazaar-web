# 🎯 ACTION PLAN: Fix Smart Wedding Planner Price Calculation

## ✅ COMPLETED STEPS

### 1. Root Cause Identified ✓
**Problem:**
- Smart Wedding Planner tries to use `service.basePrice` which doesn't exist
- Services have **packages** array with itemized pricing, not a single price
- Budget filtering only affects match score, doesn't hide over-budget packages
- Result: All packages show ₱0 price

**Solution:**
- Use `service.packages[]` array from API
- Calculate min/max price from package.base_price
- Filter packages BEFORE display based on budget

### 2. Service Type Updated ✓
**File:** `src/modules/services/types/index.ts`

**Changes Made:**
```typescript
// ✅ Added these interfaces:
export interface PackageItem { ... }
export interface ServicePackage { ... }
export interface ServiceAddon { ... }
export interface PricingRule { ... }

// ✅ Added to Service interface:
export interface Service {
  // ... existing fields ...
  packages?: ServicePackage[];     // NEW
  addons?: ServiceAddon[];         // NEW
  pricing_rules?: PricingRule[];   // NEW
  has_itemization?: boolean;       // NEW
}
```

### 3. Fix Logic Documented ✓
**File:** `SMART_WEDDING_PLANNER_FIX.md`
- Complete root cause analysis
- Step-by-step fix strategy
- Code examples for price calculation
- Budget filtering logic
- Success criteria

**File:** `SMART_PLANNER_PRICE_CALCULATION_FIX.ts`
- Reference implementation of price calculation functions
- Budget-aware package filtering
- Min/max price range calculation

---

## 🚀 PENDING IMPLEMENTATION

### Step 1: Update SmartWeddingPlanner.tsx Price Logic
**File:** `src/pages/users/individual/services/dss/SmartWeddingPlanner.tsx`
**Lines to Replace:** 178-300 (package creation logic)

**What to Change:**

#### A. Add Price Calculation Helper Functions (Before useMemo)
```typescript
// ✅ Calculate service price range from packages
const calculateServicePriceRange = (service: Service): { min: number; max: number } => {
  const packages = service.packages || [];
  
  if (packages.length === 0) {
    return {
      min: service.basePrice || service.minimumPrice || 0,
      max: service.basePrice || service.maximumPrice || 0
    };
  }
  
  const prices = packages.map(pkg => pkg.base_price || 0).filter(price => price > 0);
  
  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

// ✅ Calculate total price range for multiple services
const calculatePackagePriceRange = (services: Service[]): { min: number; max: number } => {
  let totalMin = 0;
  let totalMax = 0;
  
  for (const service of services) {
    const { min, max } = calculateServicePriceRange(service);
    totalMin += min;
    totalMax += max;
  }
  
  return { min: totalMin, max: totalMax };
};
```

#### B. Replace ESSENTIAL Package Creation (Lines ~178-210)
**OLD CODE:**
```typescript
const totalPrice = essentialServices.reduce((sum, s) => sum + (s?.basePrice || 0), 0);
const discountedPrice = totalPrice * 0.9;
```

**NEW CODE:**
```typescript
const { min, max } = calculatePackagePriceRange(essentialServices);
const discountedMin = min * 0.9; // 10% discount
const discountedMax = max * 0.9;

// ⚠️ Skip if minimum price exceeds budget
if (min > preferences.budget) {
  console.log(`⏭️ Skipping Essential Package: Min ₱${min} > Budget ₱${preferences.budget}`);
} else {
  // ... create package with minPrice, maxPrice, priceRange
  packages.push({
    id: 'essential',
    name: 'Essential Package',
    // ... existing fields ...
    minPrice: discountedMin,
    maxPrice: discountedMax,
    priceRange: `₱${discountedMin.toLocaleString()} - ₱${discountedMax.toLocaleString()}`,
    // REMOVE: totalPrice, discountedPrice
  });
}
```

#### C. Update DELUXE Package (Lines ~212-260)
- Same changes as Essential
- Allow 20% budget overage: `if (min > preferences.budget * 1.2)`
- Add budget warning if over budget

#### D. Update PREMIUM Package (Lines ~262-300)
- Same changes as Essential
- Always show (aspirational), but add warning if over budget

### Step 2: Update WeddingPackage Interface
**File:** `src/pages/users/individual/services/dss/SmartWeddingPlanner.tsx`
**Line:** ~40-60

**Changes:**
```typescript
interface WeddingPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  services: Service[];
  
  // ✅ REPLACE single price with range
  minPrice: number;           // NEW
  maxPrice: number;           // NEW
  priceRange: string;         // NEW (display string)
  
  // ❌ REMOVE these (misleading):
  // totalPrice: number;
  // discountedPrice: number;
  
  savings: number;
  matchScore: number;
  avgRating: number;
  totalReviews: number;
  category: 'essential' | 'deluxe' | 'premium';
  badge: string;
  color: string;
  whyRecommended: string[];
  budgetWarning?: string;     // NEW
}
```

### Step 3: Update UI to Display Price Ranges
**File:** `src/pages/users/individual/services/dss/SmartWeddingPlanner.tsx`
**Lines:** ~600-750 (package cards in recommendations view)

**Find:**
```tsx
<div className="text-3xl font-bold text-gray-900">
  ₱{pkg.discountedPrice.toLocaleString()}
</div>
<div className="text-sm text-gray-500 line-through">
  ₱{pkg.totalPrice.toLocaleString()}
</div>
```

**Replace With:**
```tsx
<div className="text-2xl font-bold text-gray-900">
  {pkg.priceRange}
</div>
<p className="text-sm text-gray-500 mt-1">
  Estimated range based on vendor packages
</p>

{/* Budget warning if over budget */}
{pkg.budgetWarning && (
  <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
    <p className="text-sm text-yellow-800 flex items-center gap-2">
      <span className="text-lg">⚠️</span>
      {pkg.budgetWarning}
    </p>
  </div>
)}

{/* Within budget indicator */}
{pkg.minPrice <= preferences.budget && (
  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm font-medium">
    <Check className="w-4 h-4" />
    Within your budget
  </div>
)}
```

### Step 4: Add Console Logging for Debugging
**Add at start of weddingPackages useMemo:**
```typescript
const weddingPackages = useMemo(() => {
  if (step !== 'recommendations') return [];
  
  // 🔍 Debug logging
  console.log('🎯 [SmartPlanner] Creating packages with', services.length, 'services');
  console.log('🎯 [SmartPlanner] Budget:', preferences.budget);
  
  // Check if services have packages
  const servicesWithPackages = services.filter(s => s.packages && s.packages.length > 0);
  console.log('🎯 [SmartPlanner] Services with packages:', servicesWithPackages.length);
  
  if (servicesWithPackages.length === 0) {
    console.warn('⚠️ [SmartPlanner] No services have packages! Check API response.');
  }
  
  // ... rest of code
```

---

## 🧪 TESTING STEPS

### 1. Verify API Returns Packages
```javascript
// In browser console on Services page:
fetch('https://weddingbazaar-web.onrender.com/api/services/enhanced?includeItemization=true')
  .then(r => r.json())
  .then(data => {
    const servicesWithPackages = data.services.filter(s => s.packages?.length > 0);
    console.log('Services with packages:', servicesWithPackages.length);
    console.log('Sample package:', servicesWithPackages[0]?.packages[0]);
  });
```

**Expected Output:**
```
Services with packages: 12
Sample package: {
  id: "...",
  package_name: "Luxury Garden Package",
  base_price: 65000,
  items: [{ item_name: "Garden venue rental", ... }, ...]
}
```

### 2. Test Smart Wedding Planner
1. Open Smart Wedding Planner
2. Fill preferences:
   - Wedding Type: Traditional
   - Budget: ₱100,000
   - Guest Count: 100
   - Location: Metro Manila
   - Priority: Venue, Catering, Photography
3. Click "See Recommendations"

**Expected Results:**
```
✅ Essential Package: ₱45,000 - ₱78,000 (Within budget)
⚠️ Deluxe Package: ₱82,000 - ₱145,000 (May exceed by ₱45,000)
❌ Premium Package: ₱156,000 - ₱230,000 (Not shown OR shown with warning)
```

### 3. Test Budget Filter
Change budget slider:
- ₱50,000: Only essential shows (if min < 50k)
- ₱100,000: Essential + Deluxe show
- ₱200,000: All three packages show

### 4. Verify Console Logs
Check browser console for:
```
🎯 [SmartPlanner] Creating packages with 15 services
🎯 [SmartPlanner] Budget: 100000
🎯 [SmartPlanner] Services with packages: 12
📦 [Essential] Min: ₱45,000, Max: ₱78,000
📦 [Deluxe] Min: ₱82,000, Max: ₱145,000
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] **Step 1A:** Add price calculation helper functions
- [ ] **Step 1B:** Update Essential package creation logic
- [ ] **Step 1C:** Update Deluxe package creation logic
- [ ] **Step 1D:** Update Premium package creation logic
- [ ] **Step 2:** Update WeddingPackage interface
- [ ] **Step 3:** Update UI to show price ranges
- [ ] **Step 4:** Add console logging
- [ ] **Test 1:** Verify API returns packages
- [ ] **Test 2:** Test Smart Wedding Planner with different budgets
- [ ] **Test 3:** Test budget filter logic
- [ ] **Test 4:** Verify console logs show correct prices

---

## 🐛 TROUBLESHOOTING

### Issue: Packages still show ₱0
**Check:**
1. API returning packages? `console.log(services[0].packages)`
2. Packages have base_price? `console.log(services[0].packages[0].base_price)`
3. Price calculation running? Add breakpoint in `calculateServicePriceRange`

### Issue: All packages hidden
**Check:**
1. Budget too low? Try increasing to ₱200,000
2. Services returning 0 price? Check database
3. Budget filter too strict? Temporarily remove filter

### Issue: Price range incorrect
**Check:**
1. Verify min/max calculation logic
2. Check if packages have different prices
3. Verify discount applied correctly (0.9, 0.85, 0.80)

---

## 📚 RELATED FILES

**To Modify:**
- `src/pages/users/individual/services/dss/SmartWeddingPlanner.tsx` - Main fix
- `src/modules/services/types/index.ts` - ✅ Already updated

**Reference:**
- `SMART_WEDDING_PLANNER_FIX.md` - Root cause analysis
- `SMART_PLANNER_PRICE_CALCULATION_FIX.ts` - Code examples
- `ITEMIZATION_NOT_SHOWING_DIAGNOSIS.md` - Related issue

**Database:**
- `ADD_LUXURY_GARDEN_ITEMS.sql` - Sample itemization data
- Backend: `backend-deploy/routes/services.cjs` - API returns packages

---

## 🎯 SUCCESS CRITERIA

**Smart Wedding Planner is FIXED when:**
1. ✅ Shows actual prices (not ₱0)
2. ✅ Displays min-max price ranges
3. ✅ Filters by budget (hides packages that are too expensive)
4. ✅ Shows budget warnings for close-to-budget packages
5. ✅ Console logs show correct package data
6. ✅ UI clearly indicates within/over budget
7. ✅ Price calculation uses service.packages[].base_price

---

## 🚀 ESTIMATED TIME
- **Implementation:** 1-2 hours
- **Testing:** 30 minutes
- **Bug fixes:** 30 minutes
- **Total:** 2-3 hours

**Priority:** HIGH (blocking feature)
**Complexity:** MEDIUM (logic rewrite, UI updates)
**Risk:** LOW (isolated to SmartWeddingPlanner component)
