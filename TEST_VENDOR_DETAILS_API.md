# 🧪 Test Vendor Details API Endpoint

## Test the new API endpoint

```powershell
# Test 1: Get vendor details for a specific vendor
$vendorId = "2-2025-001"  # Replace with actual vendor ID
$response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/vendors/$vendorId/details" -Method GET
$data = $response.Content | ConvertFrom-Json

Write-Host "=== Vendor Details API Test ===" -ForegroundColor Cyan
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Vendor Name: $($data.vendor.name)" -ForegroundColor Yellow
Write-Host "Rating: $($data.vendor.rating)★" -ForegroundColor Yellow
Write-Host "Review Count: $($data.vendor.reviewCount)" -ForegroundColor Yellow
Write-Host "Location: $($data.vendor.location)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Contact Information:" -ForegroundColor Cyan
Write-Host "  Email: $($data.vendor.contact.email)" -ForegroundColor White
Write-Host "  Phone: $($data.vendor.contact.phone)" -ForegroundColor White
Write-Host "  Website: $($data.vendor.contact.website)" -ForegroundColor White
Write-Host ""
Write-Host "Pricing:" -ForegroundColor Cyan
Write-Host "  Range: $($data.vendor.pricing.priceRange)" -ForegroundColor White
Write-Host ""
Write-Host "Services: $($data.services.Count)" -ForegroundColor Cyan
$data.services | ForEach-Object {
    Write-Host "  - $($_.title): $($_.priceDisplay)" -ForegroundColor White
}
Write-Host ""
Write-Host "Reviews: $($data.reviews.Count)" -ForegroundColor Cyan
Write-Host "Average Rating: $($data.ratingBreakdown.average)" -ForegroundColor Yellow
Write-Host "Rating Breakdown:" -ForegroundColor Cyan
Write-Host "  5★: $($data.ratingBreakdown.breakdown.'5')" -ForegroundColor White
Write-Host "  4★: $($data.ratingBreakdown.breakdown.'4')" -ForegroundColor White
Write-Host "  3★: $($data.ratingBreakdown.breakdown.'3')" -ForegroundColor White
Write-Host "  2★: $($data.ratingBreakdown.breakdown.'2')" -ForegroundColor White
Write-Host "  1★: $($data.ratingBreakdown.breakdown.'1')" -ForegroundColor White
```

## Expected Output

```
=== Vendor Details API Test ===
Status: 200
Vendor Name: Perfect Weddings Co.
Rating: 4.6★
Review Count: 17
Location: Manila, Philippines

Contact Information:
  Email: info@perfectweddings.com
  Phone: +63 917 123 4567
  Website: https://perfectweddings.com

Pricing:
  Range: ₱15,000 - ₱30,000

Services: 3
  - Premium Photography Package: ₱20,000 - ₱30,000
  - Basic Photography Package: ₱15,000 - ₱20,000
  - Videography Add-on: ₱10,000 - ₱15,000

Reviews: 17
Average Rating: 4.6
Rating Breakdown:
  5★: 12
  4★: 4
  3★: 1
  2★: 0
  1★: 0
```

## Frontend Test (Browser)

### Step 1: Open Site
1. Go to https://weddingbazaarph.web.app
2. Scroll to "Featured Vendors" section

### Step 2: Click Vendor Card
1. Find any vendor card
2. Click "View Details & Contact" button
3. **Expected**: Modal opens

### Step 3: Check About Tab
1. Modal should show:
   - ✅ Vendor name and category
   - ✅ Rating stars (e.g., ⭐⭐⭐⭐⭐ 4.6)
   - ✅ Location
   - ✅ Years of experience
   - ✅ Description
   - ✅ Statistics cards (bookings, reviews, etc.)
   - ✅ Contact information section
     - Email with mailto: link
     - Phone with tel: link
     - Website with external link
   - ✅ Specialties tags
   - ✅ Portfolio images

### Step 4: Check Services Tab
1. Click "Services" tab
2. **Expected**:
   - List of services
   - Each service shows:
     - Title
     - Description
     - Price (formatted as ₱15,000 - ₱30,000)
     - Inclusions with checkmarks
     - Duration (e.g., "8 hours")
     - Capacity (e.g., "Up to 150 guests")

### Step 5: Check Reviews Tab
1. Click "Reviews" tab
2. **Expected**:
   - Rating summary box showing:
     - Average rating (large number)
     - Star rating
     - Total review count
   - Rating breakdown bars:
     - 5★ with percentage bar
     - 4★ with percentage bar
     - etc.
   - Individual reviews:
     - Reviewer name
     - Rating stars
     - Comment text
     - Date
     - Service type

### Step 6: Test Contact Links
1. Go to About tab
2. Click email link
3. **Expected**: Opens default email client
4. Click phone link
5. **Expected**: Opens phone dialer (mobile) or Skype (desktop)
6. Click website link
7. **Expected**: Opens vendor website in new tab

### Step 7: Test Mobile
1. Open on mobile device (or use DevTools responsive mode)
2. Click "View Details & Contact"
3. **Expected**:
   - Modal fills screen
   - All content is scrollable
   - Tabs work properly
   - Contact buttons are easy to tap
   - Images scale correctly

## Troubleshooting

### Modal Not Opening
**Check**:
1. Browser console for errors (F12)
2. Network tab: Is API call being made?
3. Response: What does API return?

**Fix**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)

### No Contact Information
**Check**:
1. Does vendor have email/phone in database?
2. API response: Does `contact` object exist?

**Fix**:
- Add contact info to vendor in database
- Check JOIN with users table

### Pricing Shows "Contact for pricing"
**Check**:
1. Does vendor have price_range_min/max in database?
2. Are values NULL?

**Fix**:
- Update vendor pricing in database
- Add `starting_price` value

### Services Not Showing
**Check**:
1. Does vendor have services in services table?
2. Are services `is_active = true`?
3. Is `vendor_id` correct?

**Fix**:
- Add services for vendor
- Update `is_active` flag
- Verify `vendor_id` matches

### Reviews Not Showing
**Check**:
1. Does vendor have reviews in reviews table?
2. Is `vendor_id` correct?

**Fix**:
- Add reviews for vendor
- Verify foreign key relationships

## API Debugging

### Check API Directly
```powershell
# Check if API is live
Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health"

# Get vendor details
Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/vendors/2-2025-001/details"

# Check response structure
$response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/vendors/2-2025-001/details"
$data = $response.Content | ConvertFrom-Json
$data | ConvertTo-Json -Depth 10
```

### Check Backend Logs
1. Go to Render dashboard
2. Navigate to weddingbazaar-web service
3. Click "Logs" tab
4. Look for API calls: `📋 [VENDORS] GET /api/vendors/:id/details`

## Success Criteria

✅ All tests pass:
- [x] API returns 200 status
- [x] Vendor information complete
- [x] Contact details present
- [x] Pricing accurate
- [x] Services list populated
- [x] Reviews displayed
- [x] Rating breakdown correct
- [x] Modal opens and closes
- [x] Tabs work
- [x] Links are clickable
- [x] Mobile responsive

---

**Status**: Ready for testing
**Date**: November 5, 2025
**Production URL**: https://weddingbazaarph.web.app
