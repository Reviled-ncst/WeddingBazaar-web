# 🔧 Add Service Form - Step 2 Replacement Guide

## Problem Found
The **PricingModeSelector** and **PackageBuilder** components exist but are NOT being used in AddServiceForm's Step 2!

### Current Step 2 (OLD):
- Shows "Recommended Price Range" with 5 tier options
- Shows "Set Custom Pricing" toggle
- NO itemization UI

### What Step 2 SHOULD Show (NEW):
1. **PricingModeSelector** - Choose mode:
   - Simple Pricing (single price)
   - **Itemized Pricing** (packages, add-ons) ⭐
   - Custom Quote (contact for pricing)

2. **PackageBuilder** (when itemized mode selected):
   - Create multiple packages (Basic, Premium, Luxury)
   - Add inclusions/exclusions per package
   - Set package prices
   - Drag-and-drop reordering
   - Load category-specific templates

## Changes Made

### 1. Added Imports ✅
```typescript
import { PricingModeSelector, type PricingModeValue } from './pricing/PricingModeSelector';
import { PackageBuilder, type PackageItem } from './pricing/PackageBuilder';
```

### 2. Added State ✅
```typescript
const [pricingMode, setPricingMode] = useState<PricingModeValue>('simple');
const [packages, setPackages] = useState<PackageItem[]>([]);
```

### 3. Next: Replace Step 2 Render 🚧

**OLD CODE (Lines 1246-1489):**
- Entire "Recommended Price Range" section
- Entire "Custom Price Range" section
- Availability toggle

**NEW CODE:**
```tsx
{/* Step 2: Pricing & Availability */}
{currentStep === 2 && (
  <motion.div key="step2" /* ...animations */>
    <div className="text-center mb-6">
      <h3>Pricing & Availability</h3>
      <p>Choose your pricing structure</p>
    </div>

    <div className="space-y-8">
      {/* Pricing Mode Selector */}
      <PricingModeSelector
        value={pricingMode}
        onChange={setPricingMode}
        category={formData.category}
      />

      {/* Conditional Pricing UI based on mode */}
      {pricingMode === 'simple' && (
        /* Show simple price range UI (existing) */
      )}

      {pricingMode === 'itemized' && (
        /* Show PackageBuilder */
        <PackageBuilder
          packages={packages}
          onChange={setPackages}
          category={formData.category}
        />
      )}

      {pricingMode === 'custom' && (
        /* Show "Contact for quote" message */
      )}

      {/* Availability Toggle (keep existing) */}
    </div>
  </motion.div>
)}
```

## Implementation Steps

### Step 1: Replace Step 2 Content
File: `src/pages/users/vendor/services/components/AddServiceForm.tsx`
Lines: 1246-1489

### Step 2: Test Each Mode
1. Simple mode → Shows price range selector
2. Itemized mode → Shows PackageBuilder ⭐
3. Custom mode → Shows contact message

### Step 3: Update Form Submission
Ensure `window.__tempPackageData` is populated when using itemized mode.

## Expected Result

When vendor opens Add Service form:
1. ✅ Step 1: Basic Info
2. ✅ Step 2: See "Choose Your Pricing Structure" with 3 cards
3. ✅ Click "Itemized Pricing" → PackageBuilder appears
4. ✅ Create packages with items
5. ✅ Continue to Step 3
6. ✅ Submit form → Packages saved to database

## Files Involved

1. **AddServiceForm.tsx** (main file)
2. **PricingModeSelector.tsx** (mode chooser)
3. **PackageBuilder.tsx** (package creator)
4. **categoryPricingTemplates.ts** (pre-built templates)

## Status

- [x] Import components
- [x] Add state
- [ ] Replace Step 2 render
- [ ] Test in browser
- [ ] Deploy

**Next Action**: Replace the Step 2 render code with the new UI!
