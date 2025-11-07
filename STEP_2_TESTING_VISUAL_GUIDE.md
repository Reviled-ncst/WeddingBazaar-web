# 📦 Step 2 Itemization - Visual Guide

## What You'll See When Testing

### 1️⃣ **PricingModeSelector** (NEW!)

When you reach Step 2, you'll now see THREE pricing options:

```
┌─────────────────────────────────────────────────────────┐
│          Pricing & Availability                         │
│     Choose your pricing structure and set availability   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  📦 Itemized Packages (RECOMMENDED) ← NEW!              │
│  Create detailed packages with line items               │
│                                                          │
│  💰 Simple Pricing                                      │
│  Choose from recommended price ranges                    │
│                                                          │
│  ✏️ Custom Pricing                                      │
│  Set your own min/max prices                            │
└─────────────────────────────────────────────────────────┘
```

---

### 2️⃣ **When "Itemized Packages" is Selected**

```
┌─────────────────────────────────────────────────────────┐
│               📦 Package Builder                         │
│         Create itemized packages for your service        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🎨 Load Template]  [+ Add Package]                    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📦 Basic Photography Package           [$]     │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  Price: ₱15,000                                 │   │
│  │                                                  │   │
│  │  ✓ 4 hours coverage                             │   │
│  │  ✓ 200 edited photos                            │   │
│  │  ✓ Online gallery                               │   │
│  │  ✓ 1 photographer                               │   │
│  │                                                  │   │
│  │  [Edit] [Remove] [Reorder ≡]                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ⭐ Standard Photography Package         [$]    │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  Price: ₱25,000                                 │   │
│  │                                                  │   │
│  │  ✓ 8 hours coverage                             │   │
│  │  ✓ 400 edited photos                            │   │
│  │  ✓ USB drive + online gallery                   │   │
│  │  ✓ 2 photographers                              │   │
│  │  ✓ Same-day slideshow                           │   │
│  │                                                  │   │
│  │  [Edit] [Remove] [Reorder ≡]                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [+ Add Another Package]                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 3️⃣ **When "Simple Pricing" is Selected** (Existing UI)

```
┌─────────────────────────────────────────────────────────┐
│          💰 Recommended Price Range                      │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ 💰 Budget-Friendly │  │ ⭐ Mid-Range      │            │
│  │ ₱10,000 - ₱50,000│  │ ₱50,000 - ₱100,000│            │
│  └──────────────────┘  └──────────────────┘            │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ ✨ Premium         │  │ 👑 Luxury          │            │
│  │ ₱100,000-₱200,000│  │ ₱200,000-₱500,000 │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                          │
│  ┌────────────────────────────────────────┐             │
│  │ 💎 Ultra-Luxury                         │             │
│  │ ₱500,000+                               │             │
│  └────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

### 4️⃣ **When "Custom Pricing" is Selected** (Existing UI)

```
┌─────────────────────────────────────────────────────────┐
│          ✏️ Custom Price Range                           │
│                                                          │
│  Minimum Price *          Maximum Price                  │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │ ₱ [10,000]      │    │ ₱ [25,000]      │            │
│  └─────────────────┘    └─────────────────┘            │
│                                                          │
│  [Use Recommended Range]                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Testing Instructions

### Step 1: Open Vendor Services Page
```powershell
# Start development server
npm run dev

# Navigate to: http://localhost:5173/vendor/services
```

### Step 2: Click "Add Service" Button
- Look for the "📝 Add New Service" button
- Click to open the modal

### Step 3: Fill Basic Info (Step 1)
- Enter service title: "Wedding Photography"
- Select category: "Photography"
- Enter description
- Click "Next"

### Step 4: Check Step 2 UI
✅ **You should now see**:
- Heading: "Pricing & Availability"
- **PricingModeSelector with 3 cards**:
  1. 📦 Itemized Packages (with purple/pink gradient)
  2. 💰 Simple Pricing (with green gradient)
  3. ✏️ Custom Pricing (with blue gradient)

### Step 5: Select "Itemized Packages"
✅ **You should see**:
- Purple/pink gradient section
- Heading: "📦 Package Builder"
- "Load Template" button
- "Add Package" button
- Empty state or template packages (if category selected)

### Step 6: Load Template
- Click "🎨 Load Template"
- Category-specific packages should appear (e.g., Basic, Standard, Premium Photography)
- Each package shows:
  - Name
  - Price
  - Inclusions list
  - Edit/Remove buttons
  - Drag handle for reordering

### Step 7: Edit a Package
- Click "Edit" on any package
- Modify name, price, or inclusions
- Changes should be reflected immediately

### Step 8: Add Custom Package
- Click "+ Add Package"
- New empty package card appears
- Fill in details:
  - Package name
  - Description
  - Price
  - Add inclusions one by one

### Step 9: Check Console
Open browser console (F12) and look for:
```
📦 [PackageBuilder] Synced packages to window: 3
```

### Step 10: Continue to Next Steps
- Click "Next" to proceed to Step 3 (Features)
- Continue through all steps
- Submit the form

### Step 11: Verify Submission
Check the network request payload includes:
```json
{
  "title": "Wedding Photography",
  "category": "Photography",
  "packages": [
    {
      "name": "Basic Photography Package",
      "price": 15000,
      "inclusions": ["4 hours coverage", "200 edited photos", ...],
      ...
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: "Itemized Packages" option not showing
**Solution**: 
1. Check browser console for errors
2. Verify imports in AddServiceForm.tsx
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: PackageBuilder UI not displaying
**Solution**:
1. Verify `pricingMode === 'itemized'` is true
2. Check if PackageBuilder component imported correctly
3. Inspect React DevTools to see component tree

### Issue: Template not loading
**Solution**:
1. Verify category is selected in Step 1
2. Check `categoryPricingTemplates.ts` has templates for your category
3. Check browser console for errors

### Issue: Packages not saving
**Solution**:
1. Check `window.__tempPackageData` in console
2. Verify `onChange` callback is firing
3. Check backend endpoint supports packages field

---

## 📝 Expected Console Logs

When everything is working, you should see:

```
[AddServiceForm] Opening form
[AddServiceForm] Step 2 rendered
[PricingModeSelector] Mode changed to: itemized
[PackageBuilder] Initialized with 0 packages
[PackageBuilder] Category: Photography
[PackageBuilder] Loading template...
[PackageBuilder] Synced packages to window: 3
```

---

## ✅ Success Criteria

- [ ] PricingModeSelector displays 3 options
- [ ] Clicking "Itemized Packages" shows PackageBuilder
- [ ] Template button loads category-specific packages
- [ ] Can add/edit/remove packages
- [ ] Can reorder packages by dragging
- [ ] Package data syncs to window.__tempPackageData
- [ ] Form submission includes package data
- [ ] UI is responsive and styled correctly

---

**Status**: 🟢 **READY FOR MANUAL TESTING**

Use this guide to test the new itemization feature in your browser!
