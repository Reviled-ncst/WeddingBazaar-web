# Intelligent Wedding Planner - Comprehensive Testing Guide

**Testing Date:** December 27, 2024  
**Production URL:** https://weddingbazaarph.web.app  
**Feature:** Dynamic Service Suggestions (DSS) - Intelligent Wedding Planner

---

## 🎯 MATCHING ALGORITHM BREAKDOWN

### Scoring System (100 points total)

| Factor | Points | Details |
|--------|--------|---------|
| **Category Match** | 20 | Service is in user's must-have list |
| **Budget Match** | 20 | Price within selected budget range |
| **Location Match** | 15 | Available in preferred location |
| **Rating & Reviews** | 15 | 4.5★+ (15pts), 4.0★+ (10pts), 3.5★+ (5pts) |
| **Verification** | 10 | Verified vendor badge |
| **Service Tier** | 10 | Matches basic/premium/luxury preference |
| **Experience** | 5 | 5+ years in business |
| **Availability** | 5 | Currently accepting bookings |

### Package Tiers

| Package | Discount | Selection Criteria |
|---------|----------|-------------------|
| **Essential** | 10% | Most affordable with 3.5★+ rating |
| **Deluxe** | 15% | Best match scores, 4.0★+ rating, **BEST MATCH** |
| **Premium** | 20% | Highest rated (4.5★+), premium services |

---

## 🧪 TEST PLAN

### Test 1: Basic Flow Test (15 minutes)

#### Objective
Complete the entire questionnaire and generate recommendations.

#### Steps

**1. Access the Feature**
- [ ] Go to: https://weddingbazaarph.web.app
- [ ] Click **"Login"** (top right)
- [ ] Login with demo credentials:
  - Email: `demo@weddingbazaar.com`
  - Password: `demo123`
- [ ] Navigate to **"Services"** page
- [ ] Click on any service card
- [ ] Click **"✨ Get Smart Recommendations"** button

**Expected:** Planner modal opens showing Step 1

---

**2. Step 1: Wedding Basics**
- [ ] **Wedding Type:** Click "Beach" 🏖️
- [ ] **Guest Count:** Enter `150` in the number field
  - Test: Type `10` (should clamp to 20)
  - Test: Type `600` (should clamp to 500)
  - Final: Enter `150`
- [ ] **Wedding Date:** Select a date (optional - pick any future date)
- [ ] Click **"Next"** button

**Expected:** Progress bar shows 16%, moves to Step 2

---

**3. Step 2: Budget & Priorities**
- [ ] **Budget Range:** Click "Moderate" (₱500K - ₱1M)
- [ ] **Custom Budget:** (Optional) Enter `750000`
- [ ] **Budget Flexibility:** Click "Flexible"
- [ ] **Service Priorities:** Click to select:
  - [x] Venue (Priority #1)
  - [x] Catering (Priority #2)
  - [x] Photography & Video (Priority #3)
  - [x] Music & Entertainment (Priority #4)
- [ ] Click **"Next"** button

**Expected:** Progress bar ~33%, moves to Step 3

---

**4. Step 3: Wedding Style & Theme**
- [ ] **Styles:** Select 2-3 styles:
  - [x] Romantic 💕
  - [x] Elegant ✨
  - [x] Beach-themed 🌊
- [ ] **Color Palette:** Click "Coral & Teal"
  - Verify color swatches display
- [ ] **Atmosphere:** Click "Festive"
- [ ] Click **"Next"** button

**Expected:** Progress bar ~50%, moves to Step 4

---

**5. Step 4: Location & Venue**
- [ ] **Regions:** Select:
  - [x] Metro Manila
  - [x] Luzon (select multiple if available)
- [ ] **Venue Types:** Select:
  - [x] Beach 🌊
  - [x] Garden 🌳
  - [x] Hotel 🏨
- [ ] **Venue Features:** Select:
  - [x] Parking
  - [x] Catering
  - [x] Accommodation
  - [x] AC
- [ ] Click **"Next"** button

**Expected:** Progress bar ~66%, moves to Step 5

---

**6. Step 5: Must-Have Services**
- [ ] **Services:** Select with tiers:
  - [x] Photography & Video → **Premium**
  - [x] Catering → **Premium**
  - [x] Venue → **Premium**
  - [x] Music & Entertainment → **Basic**
- [ ] Click **"Next"** button

**Expected:** Progress bar ~83%, moves to Step 6

---

**7. Step 6: Special Requirements**
- [ ] **Dietary:** Select:
  - [x] Vegetarian options
  - [x] Halal
- [ ] **Accessibility:** Select:
  - [x] Wheelchair access
- [ ] **Cultural:** Select:
  - [x] Religious ceremonies
- [ ] **Additional Services:** Select:
  - [x] Photo booth
  - [x] Live streaming
- [ ] **Special Notes:** Type: "Need outdoor backup plan in case of rain"
- [ ] Click **"Generate Recommendations"** button

**Expected:** Progress bar 100%, loading animation, then results appear

---

**8. Review Results**

**Check Package Display:**
- [ ] **3 packages displayed:** Essential, Deluxe, Premium
- [ ] **Deluxe has "BEST MATCH" badge**
- [ ] **Color coding:** Blue (Essential), Purple (Deluxe), Amber (Premium)
- [ ] **Match percentages shown:** Each package shows %
- [ ] **Pricing displayed correctly:**
  - Original price (strikethrough)
  - Discounted price (large, bold)
  - Savings amount in ₱
  - Discount percentage (10%, 15%, 20%)

**Check Package Content:**
- [ ] Package name & tagline
- [ ] Description paragraph
- [ ] "Why This Package?" section with checkmarks
- [ ] Match reasons listed (3-4 items)
- [ ] Included services list (up to 6 services)
- [ ] Service cards within package showing:
  - Service name
  - Category badge
  - Vendor name
  - Rating (stars)
  - Price
  - Location
  - Match %

**Check Actions:**
- [ ] **"View Details"** button on each service
  - Click → Service detail modal opens
  - Modal shows full service info
  - Close modal works
- [ ] **"Book Now"** button on each service
  - Click → Booking flow initiates
- [ ] **"Message Vendor"** button on each service
  - Click → Messaging opens
- [ ] **"Customize Package"** button (if available)
- [ ] **"Book All Services"** button (if available)

---

### Test 2: Edge Cases (10 minutes)

#### Test 2A: No Matches Scenario
- [ ] Start questionnaire
- [ ] Select extremely narrow criteria:
  - Wedding Type: Destination
  - Budget: Budget (₱200K-₱500K)
  - Location: Mindanao only
  - Must-have: All 7 services with Luxury tier
- [ ] Generate recommendations

**Expected:** 
- Empty state message: "No matches found"
- Suggestion to adjust filters
- "Start Over" button visible and functional

---

#### Test 2B: Single Service Category
- [ ] Start questionnaire
- [ ] Select ONLY one must-have service (e.g., Photography)
- [ ] Generate recommendations

**Expected:**
- Packages still generate (may have fewer services)
- Photography services prominently featured
- Match scores reflect single category focus

---

#### Test 2C: Maximum Budget
- [ ] Start questionnaire
- [ ] Select: Luxury (₱2M+)
- [ ] Custom budget: 5000000
- [ ] Generate recommendations

**Expected:**
- Premium tier package has highest match
- High-end services recommended
- All services within luxury range

---

#### Test 2D: Minimum Budget
- [ ] Start questionnaire
- [ ] Select: Budget (₱200K-₱500K)
- [ ] Budget flexibility: Strict
- [ ] Generate recommendations

**Expected:**
- Essential package has highest match
- Affordable services prioritized
- All services respect budget constraint

---

### Test 3: Navigation & State (5 minutes)

#### Test Back Button
- [ ] Start questionnaire
- [ ] Go to Step 3
- [ ] Click **"Back"** button
- [ ] Verify: Returns to Step 2
- [ ] Verify: Previously entered data is preserved
- [ ] Click **"Back"** again to Step 1
- [ ] Verify: Wedding type, guests, date still filled
- [ ] Click **"Next"** to Step 2
- [ ] Verify: Budget and priorities still selected

**Expected:** All data persists during back/forward navigation

---

#### Test Save & Exit
- [ ] Start questionnaire
- [ ] Fill Step 1 and Step 2
- [ ] Click **"Save & Exit"** button
- [ ] Verify: Modal closes
- [ ] Re-open planner
- [ ] Verify: Data is preserved (if implemented) OR starts fresh

**Expected:** Modal closes cleanly

---

#### Test Close Button
- [ ] Start questionnaire
- [ ] Click **X** (close button) in top corner
- [ ] Verify: Modal closes
- [ ] Re-open planner
- [ ] Verify: Starts fresh

---

### Test 4: Responsive Design (5 minutes)

#### Desktop Testing
- [ ] View on desktop (1920x1080)
- [ ] Verify: 3 packages side-by-side
- [ ] Verify: All text readable
- [ ] Verify: Buttons accessible
- [ ] Verify: Modal size appropriate

#### Tablet Testing
- [ ] Resize browser to ~768px width
- [ ] Verify: Layout adapts
- [ ] Verify: Packages stack if needed
- [ ] Verify: Touch targets large enough

#### Mobile Testing
- [ ] Resize browser to ~375px width (or use device)
- [ ] Verify: Packages stack vertically
- [ ] Verify: Text remains readable
- [ ] Verify: Number input shows number keyboard
- [ ] Verify: All buttons are thumb-friendly
- [ ] Verify: Modal fits screen with scrolling

---

### Test 5: Data Validation (5 minutes)

#### Service Data Requirements
For recommendations to work, services in database need:

- [ ] **Check service has `category`**
  - Verify services have: 'photography', 'catering', 'venue', etc.
  
- [ ] **Check service has `rating`**
  - Verify rating is 0-5 number
  - Affects matching score (4.5★+ gets 15 points)

- [ ] **Check service has pricing**
  - `basePrice` or `minimumPrice` field
  - Needed for budget matching

- [ ] **Check service has `location`**
  - Philippine region/city
  - Needed for location matching

- [ ] **Check service has `verificationStatus`**
  - 'verified' status gets +10 points

- [ ] **Check optional fields:**
  - `isPremium` (affects tier matching)
  - `isFeatured` (affects recommendations)
  - `yearsInBusiness` (5+ years gets +5 points)
  - `availability` (accepting bookings gets +5 points)

**How to check:**
```sql
-- Sample query to verify service data
SELECT 
  id,
  name,
  category,
  rating,
  base_price,
  location,
  verification_status,
  is_premium,
  years_in_business,
  availability
FROM services
LIMIT 10;
```

---

### Test 6: Match Score Verification (10 minutes)

#### Manual Score Calculation

Pick a service and manually calculate expected score:

**Example Service:**
- Category: Photography ✅
- Location: Metro Manila ✅
- Price: ₱80,000 (within Moderate budget) ✅
- Rating: 4.7★ ✅
- Verified: Yes ✅
- Years: 8 years ✅
- Available: Yes ✅

**User Preferences:**
- Must-have: Photography (20 pts) ✅
- Location: Metro Manila (15 pts) ✅
- Budget: Moderate ₱500K-₱1M (20 pts) ✅
- Rating: 4.5+ (15 pts) ✅
- Verified (10 pts) ✅
- 5+ years (5 pts) ✅
- Available (5 pts) ✅

**Expected Score: 90/100** (90%)

---

#### Verify in UI:
- [ ] Generate recommendations with above preferences
- [ ] Find the photography service
- [ ] Check match percentage badge
- [ ] Should show ~85-95% (algorithm may vary slightly)

---

## 📊 TEST RESULTS TEMPLATE

### Test Session Information
- **Tester Name:** _____________
- **Date/Time:** _____________
- **Browser:** _____________
- **Device:** _____________
- **Screen Size:** _____________

### Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Basic Flow | ⬜ Pass / ⬜ Fail | |
| 2A | No Matches | ⬜ Pass / ⬜ Fail | |
| 2B | Single Category | ⬜ Pass / ⬜ Fail | |
| 2C | Max Budget | ⬜ Pass / ⬜ Fail | |
| 2D | Min Budget | ⬜ Pass / ⬜ Fail | |
| 3 | Navigation | ⬜ Pass / ⬜ Fail | |
| 4 | Responsive | ⬜ Pass / ⬜ Fail | |
| 5 | Data Validation | ⬜ Pass / ⬜ Fail | |
| 6 | Match Scores | ⬜ Pass / ⬜ Fail | |

---

## 🐛 BUG REPORT TEMPLATE

If you find issues:

**Bug ID:** #___  
**Severity:** ⬜ Critical / ⬜ High / ⬜ Medium / ⬜ Low

**Description:**


**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshots:**


**Environment:**
- Browser: 
- Device: 
- Screen Size: 

---

## ✅ TESTING CHECKLIST SUMMARY

### Critical Tests (Must Pass)
- [ ] Can complete all 6 steps
- [ ] Recommendations generate successfully
- [ ] 3 packages display correctly
- [ ] Match scores are reasonable (>0%)
- [ ] Pricing calculations are correct
- [ ] Book/Message buttons work
- [ ] Service details modal opens
- [ ] Mobile responsive layout works

### Important Tests (Should Pass)
- [ ] Empty state handles gracefully
- [ ] Back button preserves data
- [ ] All budget ranges work
- [ ] All location options work
- [ ] Rating-based scoring works
- [ ] Verification status affects score

### Nice-to-Have Tests
- [ ] Smooth animations
- [ ] Fast performance
- [ ] No console errors
- [ ] Clean UI/UX

---

## 🚀 READY TO START?

**Let's begin with Test 1: Basic Flow Test!**

I'll guide you step-by-step. Open your browser to:
👉 **https://weddingbazaarph.web.app**

**Ready?** Let me know when you've logged in and I'll guide you through each step! 🎯

---

**End of Testing Guide**
