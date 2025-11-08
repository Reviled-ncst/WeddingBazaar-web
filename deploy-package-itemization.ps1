# Wedding Bazaar - Package Itemization Backend Deployment

Write-Host "`n🚀 Wedding Bazaar - Package Itemization Deployment" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

# Step 1: Check current location
Write-Host "`n📁 Step 1: Ensuring we're in the project root..." -ForegroundColor Yellow
$currentPath = Get-Location
Write-Host "   Current path: $currentPath" -ForegroundColor White

# Step 2: Check git status
Write-Host "`n📊 Step 2: Checking git status..." -ForegroundColor Yellow
git status

# Step 3: Add backend changes
Write-Host "`n➕ Step 3: Adding backend changes..." -ForegroundColor Yellow
git add backend-deploy/routes/bookings.cjs
git add src/shared/types/comprehensive-booking.types.ts
git add src/modules/services/components/BookingRequestModal.tsx
git add add-package-columns-to-bookings.cjs
git add add-package-columns-to-bookings.sql
git add PACKAGE_ITEMIZATION_IMPLEMENTATION_COMPLETE.md

Write-Host "   ✅ Added backend files" -ForegroundColor Green

# Step 4: Commit changes
Write-Host "`n💾 Step 4: Committing changes..." -ForegroundColor Yellow
$commitMessage = @"
feat: Implement package itemization system

Backend Changes:
- Updated booking creation endpoint to accept package fields
- Added support for package_id, package_name, package_price
- Added support for package_items (JSONB array)
- Added support for selected_addons (JSONB array)
- Added addon_total and subtotal fields

Database Changes:
- Created migration script for bookings table
- Added 7 new columns for package/itemization data
- Migration successfully applied to production database

Frontend Changes:
- Updated BookingRequestModal to send full package data
- Added logging for booking request payloads
- Updated TypeScript type definitions

Type Definitions:
- Updated BookingRequest interface with package fields
- Updated Booking interface with package fields
- Added support for JSONB parsing (string or array)

Documentation:
- Created comprehensive implementation guide
- Added testing checklist and deployment steps
- Documented data flow and API response format

Status: Ready for production testing
Next: Display package breakdown in booking views
"@

git commit -m $commitMessage

# Step 5: Push to main branch
Write-Host "`n🚀 Step 5: Pushing to main branch..." -ForegroundColor Yellow
git push origin main

# Step 6: Success message
Write-Host "`n" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
Write-Host "✅ DEPLOYMENT INITIATED!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
Write-Host "`nRender will now automatically deploy your backend." -ForegroundColor Cyan
Write-Host "Estimated deployment time: 3-5 minutes`n" -ForegroundColor Cyan

# Step 7: Display what was deployed
Write-Host "📦 Package Itemization Features Deployed:" -ForegroundColor Yellow
Write-Host "`n✅ Backend (bookings.cjs):" -ForegroundColor Cyan
Write-Host "   - Accepts packageId, packageName, packagePrice" -ForegroundColor White
Write-Host "   - Accepts packageItems (array)" -ForegroundColor White
Write-Host "   - Accepts selectedAddons (array)" -ForegroundColor White
Write-Host "   - Accepts addonTotal, subtotal" -ForegroundColor White
Write-Host "   - Stores arrays as JSONB in database" -ForegroundColor White

Write-Host "`n✅ Database (Migration Completed):" -ForegroundColor Cyan
Write-Host "   - package_id (VARCHAR)" -ForegroundColor White
Write-Host "   - package_name (VARCHAR)" -ForegroundColor White
Write-Host "   - package_price (DECIMAL)" -ForegroundColor White
Write-Host "   - package_items (JSONB)" -ForegroundColor White
Write-Host "   - selected_addons (JSONB)" -ForegroundColor White
Write-Host "   - addon_total (DECIMAL)" -ForegroundColor White
Write-Host "   - subtotal (DECIMAL)" -ForegroundColor White

Write-Host "`n✅ Frontend (BookingRequestModal.tsx):" -ForegroundColor Cyan
Write-Host "   - Sends full package/itemization data" -ForegroundColor White
Write-Host "   - Includes package items and add-ons" -ForegroundColor White
Write-Host "   - Calculates subtotal" -ForegroundColor White
Write-Host "   - Added request payload logging" -ForegroundColor White

Write-Host "`n✅ Type Definitions (comprehensive-booking.types.ts):" -ForegroundColor Cyan
Write-Host "   - Updated BookingRequest interface" -ForegroundColor White
Write-Host "   - Updated Booking interface" -ForegroundColor White
Write-Host "   - Added support for JSONB parsing" -ForegroundColor White

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Wait for Render deployment to complete (~3-5 min)" -ForegroundColor White
Write-Host "   2. Test booking creation with package data" -ForegroundColor White
Write-Host "   3. Verify database stores package info correctly" -ForegroundColor White
Write-Host "   4. Check Render logs for any errors" -ForegroundColor White
Write-Host "   5. Update booking display pages to show package breakdown" -ForegroundColor White
Write-Host "   6. Update Smart Wedding Planner to use package prices`n" -ForegroundColor White

Write-Host "🔗 Useful Links:" -ForegroundColor Yellow
Write-Host "   Render Dashboard: https://dashboard.render.com" -ForegroundColor White
Write-Host "   Backend Logs: https://dashboard.render.com/web/srv-xxx/logs" -ForegroundColor White
Write-Host "   Database: Neon Console (check bookings table)" -ForegroundColor White
Write-Host "   API Test: POST https://weddingbazaar-web.onrender.com/api/bookings/request`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   Full Guide: PACKAGE_ITEMIZATION_IMPLEMENTATION_COMPLETE.md`n" -ForegroundColor White

Write-Host "=" * 80 -ForegroundColor Green
Write-Host "✅ Deployment script completed successfully!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
Write-Host ""
