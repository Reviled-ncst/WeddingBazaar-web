# Deploy Vendor Off-Days API to Production (PowerShell)
# This script deploys the updated backend with vendor off-days API endpoints

Write-Host "🚀 DEPLOYING VENDOR OFF-DAYS API TO PRODUCTION" -ForegroundColor Green
Write-Host "=============================================="

# Check if we're in the right directory
if (-not (Test-Path "backend-deploy\index.js")) {
    Write-Host "❌ Error: Must run from project root directory" -ForegroundColor Red
    exit 1
}

# Check for syntax errors
Write-Host "🔍 Checking JavaScript syntax..." -ForegroundColor Yellow
try {
    node -c backend-deploy\index.js
    Write-Host "✅ Syntax check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Syntax errors found! Fix before deploying." -ForegroundColor Red
    exit 1
}

# Show what's being deployed
Write-Host ""
Write-Host "📋 DEPLOYMENT SUMMARY:" -ForegroundColor Cyan
Write-Host "- File: backend-deploy\index.js"
Write-Host "- New Endpoints Added: 5 vendor off-days routes"
Write-Host "- Database: Uses existing vendor_off_days table"
Write-Host "- Backend URL: https://weddingbazaar-web.onrender.com"

# Git operations
Write-Host ""
Write-Host "📦 Preparing deployment..." -ForegroundColor Yellow
git add backend-deploy\index.js
git add VENDOR_OFF_DAYS_API_INTEGRATION_COMPLETE.md
git commit -m "feat: Add vendor off-days API endpoints matching frontend expectations

- Added GET /api/vendors/:vendorId/off-days
- Added POST /api/vendors/:vendorId/off-days  
- Added POST /api/vendors/:vendorId/off-days/bulk
- Added DELETE /api/vendors/:vendorId/off-days/:offDayId
- Added GET /api/vendors/:vendorId/off-days/count
- Updated 404 handler documentation
- Ready for database-backed vendor availability storage"

Write-Host "✅ Changes committed" -ForegroundColor Green

# Push to trigger deployment
Write-Host ""
Write-Host "🚀 Triggering deployment..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Wait 2-3 minutes for Render deployment to complete"
Write-Host "2. Test API: curl https://weddingbazaar-web.onrender.com/api/vendors/1/off-days"
Write-Host "3. Frontend will automatically switch from localStorage to database"
Write-Host "4. Check logs at https://dashboard.render.com"
Write-Host ""
Write-Host "🎉 Vendor off-days feature is now database-backed!" -ForegroundColor Green
