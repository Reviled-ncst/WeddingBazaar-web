# 🚀 Deploy Backend Itemization Fixes

Write-Host "🔧 Deploying Backend API Fixes for Itemization Data..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend-deploy")) {
    Write-Host "❌ Error: backend-deploy folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Changes to deploy:" -ForegroundColor Yellow
Write-Host "  • Fixed package_items column names (item_category → item_type)" -ForegroundColor White
Write-Host "  • Fixed unit column name (unit → unit_type)" -ForegroundColor White
Write-Host "  • Fixed description column name (description → item_description)" -ForegroundColor White
Write-Host "  • Fixed order column name (item_order → display_order)" -ForegroundColor White
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Deploy backend fixes to Render? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📦 Committing changes..." -ForegroundColor Cyan

# Add changed files
git add backend-deploy/routes/services.cjs
git add BACKEND_ITEMIZATION_FIXES.md

# Commit
$commitMessage = "fix: correct package_items column names in backend API

- Fixed item_category → item_type
- Fixed unit → unit_type  
- Fixed description → item_description
- Fixed item_order → display_order

This ensures package items are saved correctly in the database."

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git commit failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Changes committed" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
Write-Host ""

Write-Host "⏳ Render will auto-deploy from main branch..." -ForegroundColor Yellow
Write-Host "📊 Monitor deployment:" -ForegroundColor Cyan
Write-Host "  • Dashboard: https://dashboard.render.com" -ForegroundColor White
Write-Host "  • Backend URL: https://weddingbazaar-web.onrender.com" -ForegroundColor White
Write-Host "  • Health Check: https://weddingbazaar-web.onrender.com/api/health" -ForegroundColor White
Write-Host ""

Write-Host "🧪 After deployment, test by:" -ForegroundColor Yellow
Write-Host "  1. Create a new service with packages" -ForegroundColor White
Write-Host "  2. Add itemized inclusions to packages" -ForegroundColor White
Write-Host "  3. Submit the service" -ForegroundColor White
Write-Host "  4. Check if package items are saved in database" -ForegroundColor White
Write-Host ""

Write-Host "✅ Backend deployment initiated!" -ForegroundColor Green
Write-Host ""

# Open Render dashboard
$openDashboard = Read-Host "Open Render dashboard? (y/n)"
if ($openDashboard -eq "y") {
    Start-Process "https://dashboard.render.com"
}

Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
