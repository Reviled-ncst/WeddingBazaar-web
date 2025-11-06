# 🚀 Priority-Based DSS System - Testing Guide

**Quick Start**: How to test the new priority-based matching system

---

## ⚡ Quick Test (5 minutes)

### Step 1: Populate DSS Fields
```bash
# In terminal, run:
cd c:\Games\WeddingBazaar-web
node populate-dss-fields.cjs
```

**Expected Output:**
```
✅ Successfully populated DSS fields for 20 services
📊 DSS Fields Summary:
   - wedding_styles: 20 services updated
   - cultural_specialties: 20 services updated
   - location_data: 20 services updated
   - availability: 20 services updated
```

### Step 2: Open DSS Modal
1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:5173/individual/services`
3. Click **"Smart Wedding Planner"** or **"Get Recommendations"** button

### Step 3: Fill Questionnaire

**Minimum Required Fields:**
- **Step 2 (Budget)**: Select any budget range
- **Step 5 (Must-Have Services)**: Select at least 3 services
  - Example: Photography, Venue, Catering

**Optional but Recommended:**
- **Step 1**: Select wedding type and date
- **Step 3**: Select styles (romantic, elegant, etc.)
- **Step 4**: Select locations (Metro Manila, Quezon City)

### Step 4: View Results

Click **"Get Recommendations"** button at the end.

**Expected Results:**
- ✅ 3-4 packages generated (Essential, Deluxe, Premium, Custom)
- ✅ Each package shows fulfillment percentage
- ✅ Required categories are covered
- ✅ Services sorted by match score
- ✅ Clear pricing and discounts

**Console Output:**
```
🎯 Priority-Based Package Generation Results:
   📦 Generated 4 packages
   ✅ Required categories: photography, venue, catering
   📋 Essential Package: 3 services, 100% fulfillment
   📋 Deluxe Package: 6 services, 100% fulfillment
   📋 Premium Package: 10 services, 100% fulfillment
   📋 Custom Package: 8 services, 100% fulfillment
```

---

## 🧪 Comprehensive Test (15 minutes)

### Test Case 1: Photography Only
**Input:**
- Must-Have: Photography only
- Budget: Moderate
- Location: Metro Manila

**Expected:**
- ✅ All packages have at least 1 photography service
- ✅ Fulfillment: 100% (1/1 required categories)
- ✅ Deluxe/Premium add videography and photo booth

### Test Case 2: Full Wedding (All Categories)
**Input:**
- Must-Have: Photography, Videography, Venue, Catering, Music, Decoration
- Budget: Upscale
- Location: Makati, BGC

**Expected:**
- ✅ All packages fulfill ALL 6 required categories
- ✅ Fulfillment: 100% (6/6 required categories)
- ✅ Premium package has 10+ services

### Test Case 3: Budget-Constrained
**Input:**
- Must-Have: Photography, Venue, Catering
- Budget: Budget (₱5,000 - ₱50,000)
- Flexibility: Strict

**Expected:**
- ✅ Services selected are within budget range
- ✅ Essential package prioritizes affordability
- ✅ Match reasons mention "Budget-friendly"

### Test Case 4: Location-Specific
**Input:**
- Must-Have: Venue
- Location: Cebu, Bohol
- Wedding Type: Beach

**Expected:**
- ✅ Services are located in Cebu/Bohol
- ✅ Match reasons mention location
- ✅ Beach-style venues prioritized

---

## 🔍 What to Check

### ✅ Package Generation
- [ ] At least 3 packages generated (Essential, Deluxe, Premium)
- [ ] Each package has different service counts (5, 8, 12)
- [ ] Packages sorted by fulfillment percentage

### ✅ Fulfillment Tracking
- [ ] Fulfillment percentage displayed (e.g., "100% fulfillment")
- [ ] Required services count shown (e.g., "Covers 5/5 categories")
- [ ] Missing services listed if <100% fulfillment

### ✅ Match Scoring
- [ ] Each service has a match score (0-100%)
- [ ] Match reasons displayed (e.g., "✅ Matches your must-have: photography")
- [ ] High-scoring services appear first

### ✅ Pricing
- [ ] Original price shown
- [ ] Discounted price shown
- [ ] Savings calculated correctly
- [ ] Discount percentage displayed (10%, 15%, 20%)

### ✅ Service Details
- [ ] Service name displayed
- [ ] Category shown
- [ ] Rating displayed
- [ ] Match reasons listed

---

## 🐛 Common Issues & Fixes

### Issue: No packages generated
**Symptoms:** Empty results screen  
**Check Console:** Look for error messages  
**Fix:**
1. Verify must-have services selected in Step 5
2. Check database has services in those categories
3. Run `populate-dss-fields.cjs` if not done

### Issue: Low match scores
**Symptoms:** All services have <50% match score  
**Check Console:** "⚠️ No matching services found"  
**Fix:**
1. Broaden location selection (add more regions)
2. Select "Flexible" budget flexibility
3. Reduce must-have service count

### Issue: Fallback algorithm used
**Symptoms:** Console shows "⚠️ Falling back to basic package generation..."  
**Check:** Error message in console  
**Fix:**
1. Check Service type compatibility
2. Verify DSS fields populated correctly
3. Check EnhancedMatchingEngine import

### Issue: 0% fulfillment
**Symptoms:** Package shows "Covers 0/5 required categories"  
**Check:** Database has services in selected categories  
**Fix:**
1. Add more services in those categories
2. Check category naming (photography vs Photography)
3. Verify vendor_id format matches

---

## 📊 Performance Metrics

### Target Performance:
- Package generation: < 1 second
- Match scoring: < 500ms
- UI rendering: < 200ms

### Memory Usage:
- Peak: ~50MB (during package generation)
- Steady: ~20MB (after render)

---

## 🎯 Success Criteria

### ✅ PASS if:
1. **Packages Generated**: At least 3 packages with different tiers
2. **Fulfillment**: Required categories covered in all packages
3. **Match Scores**: Services scored 40-100% for required categories
4. **Pricing**: Discounts applied correctly (10%, 15%, 20%)
5. **Console Logs**: No errors, clear generation summary

### ❌ FAIL if:
1. No packages generated despite valid input
2. Fulfillment <50% when services exist in database
3. Match scores all 0% or negative
4. Pricing calculations incorrect
5. Console shows errors or exceptions

---

## 📝 Test Report Template

```markdown
## DSS Priority-Based Matching Test Report

**Date:** [Date]  
**Tester:** [Name]  
**Environment:** Development / Production

### Test Results:
- [ ] Package Generation: PASS / FAIL
- [ ] Fulfillment Tracking: PASS / FAIL
- [ ] Match Scoring: PASS / FAIL
- [ ] Pricing Calculations: PASS / FAIL
- [ ] UI Rendering: PASS / FAIL

### Issues Found:
1. [Issue description]
2. [Issue description]

### Screenshots:
[Attach screenshots]

### Console Logs:
```
[Paste console output]
```

### Recommendations:
[Any suggestions]
```

---

## 🔗 Additional Resources

- **Full Documentation**: `PRIORITY_BASED_DSS_IMPLEMENTATION_COMPLETE.md`
- **DSS Index**: `DSS_INDEX.md`
- **Test Scripts**: `test-dss-fields.cjs`, `comprehensive-dss-test.cjs`
- **Vendor ID Guide**: `VENDOR_ID_FORMAT_CONFIRMED.md`

---

**Happy Testing! 🎉**

For issues or questions, check console logs first, then refer to the troubleshooting section above.
