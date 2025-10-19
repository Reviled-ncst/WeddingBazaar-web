# Complete Deployment Script - DSS, Multi-Service Booking & Group Chat
# Generated: October 19, 2025
# This script handles the complete deployment sequence

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "🚀 WEDDINGBAZAAR COMPLETE DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# Step 1: Pre-flight checks
Write-Host "📋 STEP 1: PRE-FLIGHT CHECKS" -ForegroundColor Yellow
Write-Host ("-" * 80)
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}
Write-Host "✅ In project root directory" -ForegroundColor Green

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Check Firebase CLI
try {
    $firebaseVersion = firebase --version 2>$null
    Write-Host "✅ Firebase CLI installed ($firebaseVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not installed. Please run: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Step 2: Database Migration Check
Write-Host "🗄️  STEP 2: DATABASE MIGRATION STATUS" -ForegroundColor Yellow
Write-Host ("-" * 80)
Write-Host ""

if ($env:DATABASE_URL) {
    Write-Host "✅ DATABASE_URL is set" -ForegroundColor Green
    Write-Host "`n⚠️  IMPORTANT: Have you run the database migrations?" -ForegroundColor Yellow
    Write-Host "   If not, run: node run-all-migrations.mjs" -ForegroundColor White
    Write-Host "`n   Migrations add:" -ForegroundColor Cyan
    Write-Host "   - DSS fields to services table" -ForegroundColor White
    Write-Host "   - booking_items table for multi-service bookings" -ForegroundColor White
    Write-Host "   - conversation_participants table for group chat" -ForegroundColor White
    
    $runMigrations = Read-Host "`n❓ Have you already run the migrations? (y/n)"
    
    if ($runMigrations -eq 'n' -or $runMigrations -eq 'N') {
        Write-Host "`n🔄 Running database migrations..." -ForegroundColor Cyan
        node run-all-migrations.mjs
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`n❌ Migration failed! Please check the error above." -ForegroundColor Red
            exit 1
        }
        Write-Host "`n✅ Migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✅ Skipping migrations (already run)" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  DATABASE_URL not set. Skipping migration check." -ForegroundColor Yellow
    Write-Host "   Note: Backend deployment will handle database connection." -ForegroundColor Gray
}

Write-Host "`n"

# Step 3: Build Frontend
Write-Host "🔨 STEP 3: BUILD FRONTEND" -ForegroundColor Yellow
Write-Host ("-" * 80)
Write-Host ""

Write-Host "📦 Building production bundle..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Please fix errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "`n"

# Step 4: Deploy to Firebase
Write-Host "🚀 STEP 4: DEPLOY TO FIREBASE HOSTING" -ForegroundColor Yellow
Write-Host ("-" * 80)
Write-Host ""

Write-Host "🌐 Deploying to Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Firebase deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Frontend deployed to Firebase!" -ForegroundColor Green
Write-Host "`n"

# Step 5: Post-Deployment Summary
Write-Host ("=" * 80) -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Green
Write-Host ""

Write-Host "📊 DEPLOYMENT SUMMARY:" -ForegroundColor Cyan
Write-Host "   ✅ Database migrations: " -NoNewline -ForegroundColor White
if ($runMigrations -eq 'y' -or $runMigrations -eq 'Y') {
    Write-Host "Skipped (already run)" -ForegroundColor Gray
} else {
    Write-Host "Completed" -ForegroundColor Green
}
Write-Host "   ✅ Frontend build: Completed" -ForegroundColor White
Write-Host "   ✅ Firebase deployment: Completed" -ForegroundColor White

Write-Host "`n🌐 LIVE URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: https://weddingbazaar-web.web.app" -ForegroundColor White
Write-Host "   Backend:  https://weddingbazaar-web.onrender.com" -ForegroundColor White

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Test AddServiceForm with DSS fields" -ForegroundColor White
Write-Host "   2. Verify services save to database correctly" -ForegroundColor White
Write-Host "   3. Check browser console for any errors" -ForegroundColor White

Write-Host "`n⚠️  BACKEND API UPDATES REQUIRED:" -ForegroundColor Yellow
Write-Host "   The database now has new fields, but backend API needs updates:" -ForegroundColor White
Write-Host "   - Update backend-deploy/routes/services.cjs" -ForegroundColor White
Write-Host "   - Add multi-service booking endpoint" -ForegroundColor White
Write-Host "   - Add group chat endpoints" -ForegroundColor White
Write-Host "`n   📄 See: IMPLEMENTATION_GUIDE_DSS_MULTI_SERVICE_GROUPCHAT.md (Phase 2)" -ForegroundColor Gray

Write-Host "`n📚 DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "   📄 START_HERE.md - Quick start guide" -ForegroundColor White
Write-Host "   📄 DSS_IMPLEMENTATION_SUMMARY.md - Complete summary" -ForegroundColor White
Write-Host "   📄 IMPLEMENTATION_GUIDE_DSS_MULTI_SERVICE_GROUPCHAT.md - Detailed guide" -ForegroundColor White

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "✨ Deployment completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""
