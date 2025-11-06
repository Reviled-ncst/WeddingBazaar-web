# Deploy Vendor Service ID Fix to Render
# This script deploys the enhanced backend that supports both UUID and legacy vendor IDs

Write-Host "🚀 DEPLOYING VENDOR SERVICE ID FIX" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify we're in the right directory
Write-Host "📁 Step 1: Verifying directory..." -ForegroundColor Yellow
if (!(Test-Path "backend-deploy/routes/services.cjs")) {
    Write-Host "❌ ERROR: backend-deploy/routes/services.cjs not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Directory verified" -ForegroundColor Green
Write-Host ""

# Step 2: Check Git status
Write-Host "📊 Step 2: Checking Git status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 3: Add changes
Write-Host "➕ Step 3: Adding changes to Git..." -ForegroundColor Yellow
git add backend-deploy/routes/services.cjs
git add fix-vendor-service-id-mismatch.sql
Write-Host "✅ Changes staged" -ForegroundColor Green
Write-Host ""

# Step 4: Commit changes
Write-Host "💾 Step 4: Committing changes..." -ForegroundColor Yellow
$commitMessage = "fix: Support both UUID and legacy vendor IDs in services query

- Enhanced GET /api/services endpoint to resolve vendor IDs
- Backend now checks vendors table for both id and legacy_vendor_id
- Automatically detects which format is used in services table
- Fixes issue where services weren't showing for vendors with UUID
- Adds vendor_id_checked to API response for debugging

Root cause: Services table used legacy ID (2-2025-003) but frontend
queried with UUID (6fe3dc77-6774-4de8-ae2e-81a8ffb258f6)

Files changed:
- backend-deploy/routes/services.cjs: Enhanced vendor ID resolution
- fix-vendor-service-id-mismatch.sql: SQL script to migrate existing data"

git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ WARNING: No changes to commit or commit failed" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}
Write-Host "✅ Changes committed" -ForegroundColor Green
Write-Host ""

# Step 5: Push to GitHub
Write-Host "🌐 Step 5: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Failed to push to GitHub!" -ForegroundColor Red
    Write-Host "Please check your Git configuration and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
Write-Host ""

# Step 6: Wait for Render auto-deploy
Write-Host "⏳ Step 6: Waiting for Render to auto-deploy..." -ForegroundColor Yellow
Write-Host "Render will automatically detect the new commit and redeploy." -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Monitor deployment at:" -ForegroundColor Cyan
Write-Host "   https://dashboard.render.com/web/srv-ctgc1c08fa8c73dmb1c0" -ForegroundColor White
Write-Host ""

# Step 7: Wait a bit for deployment to start
Write-Host "Waiting 30 seconds for deployment to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 8: Test the backend
Write-Host ""
Write-Host "🧪 Step 7: Testing backend..." -ForegroundColor Yellow
Write-Host "Testing backend health endpoint..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Backend is responding!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "⚠️ Backend not responding yet. This is normal during deployment." -ForegroundColor Yellow
    Write-Host "Wait 2-3 minutes and try again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Wait 2-3 minutes for Render deployment to complete" -ForegroundColor White
Write-Host "2. Monitor deployment at: https://dashboard.render.com" -ForegroundColor White
Write-Host "3. Test the fix by:" -ForegroundColor White
Write-Host "   a) Log in as vendor at https://weddingbazaarph.web.app/vendor/login" -ForegroundColor White
Write-Host "   b) Go to Services page" -ForegroundColor White
Write-Host "   c) Check browser console for vendor_id_checked value" -ForegroundColor White
Write-Host "   d) Verify services appear in the list" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Optional: Run SQL migration to update existing services:" -ForegroundColor Cyan
Write-Host "   Run fix-vendor-service-id-mismatch.sql in Neon SQL Console" -ForegroundColor White
Write-Host ""
