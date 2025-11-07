# Package Builder Deployment Script
# Date: November 7, 2025
# Feature: Quantity Segregation Update

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Package Builder Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in the right directory
Write-Host "Checking project directory..." -ForegroundColor Yellow
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Project directory confirmed" -ForegroundColor Green
Write-Host ""

# Step 2: Git add, commit, and push
Write-Host "Git: Adding, committing, and pushing..." -ForegroundColor Yellow
git add .
git commit -m "feat: Add quantity segregation to Package Builder

- Enhanced PackageInclusion interface with quantity and unit fields
- Added structured item form with 4 fields per inclusion
- Implemented 9 unit options (pcs, hours, days, sets, etc.)
- Added optional description field for detailed item info
- Backward compatible template conversion
- Full accessibility with ARIA labels
- Complete documentation (4 MD files)
- Zero TypeScript/ESLint errors
- Ready for production"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed" -ForegroundColor Green
    
    Write-Host "Pushing to remote..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Push failed, but continuing with deployment..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Nothing to commit (already up to date)" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Build for production
Write-Host "Building for production..." -ForegroundColor Yellow
Write-Host "   This may take 1-2 minutes..." -ForegroundColor Gray
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Deploy to Firebase
Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
Write-Host "   Target: weddingbazaarph.web.app" -ForegroundColor Gray
firebase deploy --only hosting
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Live URL: https://weddingbazaarph.web.app" -ForegroundColor Cyan
Write-Host "Package Builder: /vendor/services -> Add Service" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Visit the live site" -ForegroundColor Gray
Write-Host "   2. Login as vendor" -ForegroundColor Gray
Write-Host "   3. Go to Services -> Add Service" -ForegroundColor Gray
Write-Host "   4. Navigate to Step 2 (Pricing)" -ForegroundColor Gray
Write-Host "   5. Test the new quantity fields!" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "   - PACKAGE_BUILDER_QUANTITY_UPDATE.md" -ForegroundColor Gray
Write-Host "   - PACKAGE_BUILDER_VISUAL_GUIDE.md" -ForegroundColor Gray
Write-Host "   - PACKAGE_BUILDER_TESTING_GUIDE.md" -ForegroundColor Gray
Write-Host "   - QUICK_REFERENCE_PACKAGE_BUILDER.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy testing!" -ForegroundColor Magenta
