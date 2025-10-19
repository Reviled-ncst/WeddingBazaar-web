# Wedding Bazaar - Quick Backend Deployment Script

Write-Host "`n🚀 Wedding Bazaar - Backend Deployment" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

# Step 1: Navigate to backend-deploy
Write-Host "`n📁 Step 1: Navigate to backend-deploy folder" -ForegroundColor Yellow
Set-Location backend-deploy

# Step 2: Check git status
Write-Host "`n📊 Step 2: Checking git status..." -ForegroundColor Yellow
git status

# Step 3: Add all changes
Write-Host "`n➕ Step 3: Adding all changes..." -ForegroundColor Yellow
git add .

# Step 4: Commit changes
Write-Host "`n💾 Step 4: Committing changes..." -ForegroundColor Yellow
git commit -m "feat: Add DSS fields, multi-service bookings, and group chat support

- Added booking-items.js route for multi-service bookings
- Added group-chat.js route for group conversation support
- Integrated new routes into main server
- Database migrations already completed
- Ready for production deployment"

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
Write-Host "🔗 Check deployment status at:" -ForegroundColor Yellow
Write-Host "   https://dashboard.render.com`n" -ForegroundColor White
Write-Host "📊 New API Endpoints Available:" -ForegroundColor Yellow
Write-Host "   POST   /api/bookings/:id/items" -ForegroundColor White
Write-Host "   GET    /api/bookings/:id/items" -ForegroundColor White
Write-Host "   PUT    /api/bookings/:id/items/:itemId" -ForegroundColor White
Write-Host "   DELETE /api/bookings/:id/items/:itemId" -ForegroundColor White
Write-Host "   POST   /api/conversations/group" -ForegroundColor White
Write-Host "   POST   /api/conversations/:id/participants" -ForegroundColor White
Write-Host "   GET    /api/conversations/:id/participants" -ForegroundColor White
Write-Host "   PUT    /api/conversations/:id/participants/:participantId" -ForegroundColor White
Write-Host "   DELETE /api/conversations/:id/participants/:participantId`n" -ForegroundColor White

# Return to root directory
Set-Location ..

Write-Host "✨ Done! Backend deployment in progress...`n" -ForegroundColor Green
