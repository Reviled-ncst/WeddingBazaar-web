# 🚀 Itemized Pricing Templates - Phased Deployment Plan

## 📋 Overview
Convert all 15 wedding service categories from string[] inclusions to itemized PackageInclusion[] format with unit_price values.

**Goal**: Enable auto-calculating package prices based on quantity × unit_price for all categories.

---

## ✅ Phase 1: Photography (COMPLETE)

**Status**: ✅ Done  
**Date**: November 7, 2025

### Packages Updated:
1. **Basic Coverage** (₱35,000)
   - 4 hours @ ₱5,000/hour
   - 200 photos @ ₱50/photo  
   - 5 itemized inclusions with unit prices

2. **Full Day Coverage** (₱65,000)
   - 8 hours @ ₱5,000/hour
   - 400 photos @ ₱50/photo
   - 8 itemized inclusions with unit prices

3. **Platinum Package** (₱120,000)
   - 10 hours @ ₱5,000/hour
   - 600 photos @ ₱50/photo
   - 15 itemized inclusions with unit prices

**Ready to Deploy**: ✅ Yes

---

## 📅 Remaining Phases

### Phase 2: Planning & Catering (2 categories)
**Estimated Work**: 30 minutes  
**Categories**:
- Planning (Wedding Planner)
- Catering (Food & Beverage)

**Items to Itemize**: ~20 packages total

---

### Phase 3: Florist & Beauty (2 categories)
**Estimated Work**: 30 minutes  
**Categories**:
- Florist (Flowers & Arrangements)
- Beauty (Hair & Makeup)

**Items to Itemize**: ~15 packages total

---

### Phase 4: Music & Venue (2 categories)
**Estimated Work**: 30 minutes  
**Categories**:
- Music (DJ/Entertainment)
- Venue (Ceremony & Reception Venues)

**Items to Itemize**: ~15 packages total

---

### Phase 5: Stationery & Cake (2 categories)
**Estimated Work**: 30 minutes  
**Categories**:
- Invitations (Stationery & Printing)
- Cake (Wedding Cakes & Desserts)

**Items to Itemize**: ~15 packages total

---

### Phase 6: Fashion & Transport (2 categories)
**Estimated Work**: 30 minutes  
**Categories**:
- Bridal Shop (Attire & Accessories)
- Transportation (Vehicles & Logistics)

**Items to Itemize**: ~15 packages total

---

### Phase 7: Bar, Favors, Decor (3 categories)
**Estimated Work**: 45 minutes  
**Categories**:
- Bar Service (Drinks & Bartending)
- Favors (Guest Gifts & Souvenirs)
- Decor (Decorations & Styling)

**Items to Itemize**: ~20 packages total

---

### Phase 8: Lighting (1 category)
**Estimated Work**: 15 minutes  
**Categories**:
- Lighting (Lighting Design & Effects)

**Items to Itemize**: ~5 packages total

---

## 🎯 Current Status

| Phase | Categories | Status | Deployed |
|-------|-----------|--------|----------|
| **Phase 1** | Photography | ✅ Complete | ⏳ Pending |
| Phase 2 | Planning, Catering | ⏳ Todo | ❌ |
| Phase 3 | Florist, Beauty | ⏳ Todo | ❌ |
| Phase 4 | Music, Venue | ⏳ Todo | ❌ |
| Phase 5 | Invitations, Cake | ⏳ Todo | ❌ |
| Phase 6 | Bridal Shop, Transport | ⏳ Todo | ❌ |
| Phase 7 | Bar, Favors, Decor | ⏳ Todo | ❌ |
| Phase 8 | Lighting | ⏳ Todo | ❌ |

**Progress**: 1/8 phases (12.5%)

---

## 🚀 Deployment Strategy

### Option A: Deploy Per Phase (Recommended)
- Deploy after each phase completion
- Users can test immediately
- Faster feedback loop
- Categories work as they're completed

### Option B: Deploy All at Once
- Complete all 8 phases first
- Single deployment
- Comprehensive testing
- Longer wait time

**Recommendation**: **Option A** - Deploy Phase 1 now, then iterate

---

## 📊 Template Structure

### Old Format (String Array):
```typescript
inclusions: [
  '4 hours coverage',
  '200 edited photos',
  'USB drive with all photos'
]
```

### New Format (Itemized):
```typescript
inclusions: [
  { 
    name: 'Photography coverage', 
    quantity: 4, 
    unit: 'hours', 
    unit_price: 5000,
    description: 'Professional wedding photographer on-site'
  },
  { 
    name: 'Edited high-resolution photos', 
    quantity: 200, 
    unit: 'photos', 
    unit_price: 50,
    description: 'Color-corrected, professionally edited'
  },
  { 
    name: 'USB drive with all photos', 
    quantity: 1, 
    unit: 'pcs', 
    unit_price: 2000,
    description: 'All photos in high resolution'
  }
]
```

---

## 🎯 Benefits Per Phase

### Phase 1 (Photography) - Immediate:
- ✅ Most popular category gets auto-pricing
- ✅ Vendors can see live price calculations
- ✅ Template prices match item totals
- ✅ User feedback on system

### Phase 2-8 (Remaining):
- 🔄 Other categories still work (converted to itemized with unit_price=0)
- 🔄 Vendors can manually enter unit prices
- 🔄 Full auto-pricing when phases complete

---

## 🧪 Testing Plan

### After Phase 1 Deployment:
1. **Test Photography Templates**
   - Load "Basic Coverage" template
   - Verify unit prices show correctly
   - Edit quantity, verify price updates
   - Submit service, verify data saved

2. **Test Other Categories**
   - Load "Planning" template (not itemized yet)
   - Verify it converts to itemized format
   - Manually enter unit prices
   - Verify price calculates

### After All Phases:
1. Test all 15 categories
2. Verify realistic pricing
3. Gather vendor feedback
4. Adjust unit prices if needed

---

## 💰 Unit Price Guidelines

### Common Units:
- **Hours**: ₱3,000 - ₱10,000/hour (depends on service)
- **Photos**: ₱30 - ₱100/photo (depends on editing level)
- **Persons**: ₱5,000 - ₱15,000/person (depends on role)
- **Pax** (guests): ₱500 - ₱2,000/pax (food/drinks)
- **Items/Pcs**: ₱500 - ₱5,000/item (varies widely)
- **Sets**: ₱3,000 - ₱15,000/set (packages of items)
- **Service**: ₱2,000 - ₱10,000/service (one-time fees)
- **Days**: ₱10,000 - ₱50,000/day (rental/coordination)

### Pricing Tiers:
- **Basic**: Budget-friendly rates
- **Standard**: Mid-range professional rates  
- **Premium**: High-end luxury rates

---

## 📝 Next Steps

### Immediate (Phase 1):
1. ✅ Photography templates itemized
2. ⏳ Deploy Phase 1 to production
3. ⏳ Test Photography category
4. ⏳ Gather initial feedback

### Short-term (Phase 2-4):
1. Itemize Planning & Catering
2. Deploy and test
3. Itemize Florist & Beauty
4. Deploy and test
5. Itemize Music & Venue
6. Deploy and test

### Medium-term (Phase 5-8):
1. Complete remaining 5 categories
2. Final deployment
3. Comprehensive testing
4. Documentation update

---

## 🐛 Known Issues

### Current State:
- ✅ Photography: Full itemized support
- ⚠️ Other 14 categories: String[] format (auto-converts but unit_price=0)

### Workaround:
- PackageBuilder auto-converts string[] to PackageInclusion[]
- Vendors can manually enter unit prices
- Prices calculate correctly after manual entry

### Solution:
- Complete phases 2-8
- Provide realistic unit_price defaults
- Enable auto-pricing for all categories

---

## 📚 Documentation

### Files Updated:
- ✅ `categoryPricingTemplates.ts` - Photography section
- ✅ `PackageBuilder.tsx` - Auto-calculate feature
- ✅ Phase 1 deployment docs

### Files To Update:
- ⏳ Complete remaining template sections
- ⏳ Update user guides with examples
- ⏳ Create vendor training materials

---

## ✅ Phase 1 Deployment Checklist

- [x] Update Photography templates with itemized pricing
- [x] Add unit_price to PackageInclusion interface
- [x] Implement auto-calculate function
- [x] Update UI to show unit_price field
- [x] Test auto-calculation in PackageBuilder
- [ ] Build and deploy Phase 1
- [ ] Test Photography templates in production
- [ ] Document Phase 1 results
- [ ] Plan Phase 2 execution

---

**Status**: Phase 1 Ready for Deployment  
**Next Action**: Deploy Phase 1 and test Photography category  
**Last Updated**: November 7, 2025
