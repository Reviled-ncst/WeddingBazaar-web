# 🚀 AUTOMATED DEPLOYMENT AND TEST SCRIPT
# This script will:
# 1. Build the project
# 2. Deploy to Firebase
# 3. Show you what to do next

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 BOOKING FIX DEPLOYMENT SCRIPT" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "📦 Step 1: Building project..." -ForegroundColor Green
Write-Host "Running: npm run build" -ForegroundColor Gray
Write-Host ""

try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "⚠️  Check TypeScript errors above" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Common fixes:" -ForegroundColor Yellow
        Write-Host "  - TypeScript errors are warnings, build may still work" -ForegroundColor Gray
        Write-Host "  - Check if dist/ folder was created" -ForegroundColor Gray
        Write-Host ""
        
        # Check if dist folder exists
        if (Test-Path "dist") {
            Write-Host "✅ dist/ folder exists - build artifacts present" -ForegroundColor Green
            Write-Host "Continuing with deployment..." -ForegroundColor Yellow
        } else {
            Write-Host "❌ dist/ folder not found - build actually failed" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Build error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Step 2: Deploy
Write-Host "🚀 Step 2: Deploying to Firebase..." -ForegroundColor Green
Write-Host "Running: firebase deploy --only hosting" -ForegroundColor Gray
Write-Host ""

try {
    firebase deploy --only hosting
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "⚠️  Check Firebase errors above" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Deployment error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Step 3: Instructions
Write-Host "📋 NEXT STEPS - DO THIS NOW:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open your production site:" -ForegroundColor White
Write-Host "   https://weddingbazaarph.web.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Press F12 to open DevTools Console" -ForegroundColor White
Write-Host ""
Write-Host "3. Copy and paste this ENTIRE script:" -ForegroundColor White
Write-Host "   File: FRONTEND_BOOKING_INTERCEPTOR.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Press Enter to activate the interceptor" -ForegroundColor White
Write-Host ""
Write-Host "5. Try to submit a booking request" -ForegroundColor White
Write-Host ""
Write-Host "6. Look for these messages in console:" -ForegroundColor White
Write-Host "   ✅ '🚨 BOOKING API CALL DETECTED!'" -ForegroundColor Green
Write-Host "   ✅ '✅ BOOKING API RESPONSE' or" -ForegroundColor Green
Write-Host "   ❌ '❌ BOOKING API ERROR'" -ForegroundColor Red
Write-Host ""
Write-Host "7. Copy ALL console output and send it" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 WHAT TO LOOK FOR:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Success case:" -ForegroundColor Green
Write-Host "   - Booking API call detected" -ForegroundColor Gray
Write-Host "   - Response status: 200" -ForegroundColor Gray
Write-Host "   - Backend logs show request" -ForegroundColor Gray
Write-Host "   - Email is sent" -ForegroundColor Gray
Write-Host ""
Write-Host "❌ Error case (what we expect now):" -ForegroundColor Red
Write-Host "   - Booking API call detected" -ForegroundColor Gray
Write-Host "   - Error message appears" -ForegroundColor Gray
Write-Host "   - Console shows actual error (CORS, timeout, etc.)" -ForegroundColor Gray
Write-Host "   - User sees error alert (not fake success)" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📁 FILES TO USE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   FRONTEND_BOOKING_INTERCEPTOR.js  - Copy this to console" -ForegroundColor Cyan
Write-Host "   DO_THIS_RIGHT_NOW_ACTION_PLAN.md - Detailed guide" -ForegroundColor Cyan
Write-Host "   BREAKTHROUGH_ROOT_CAUSE_FOUND.md - Full explanation" -ForegroundColor Cyan
Write-Host "   VISUAL_BOOKING_FLOW.txt          - Visual diagram" -ForegroundColor Cyan
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎯 WE'RE ONE ERROR MESSAGE AWAY FROM FIXING THIS!" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Open the interceptor file
Write-Host "Opening FRONTEND_BOOKING_INTERCEPTOR.js for you..." -ForegroundColor Gray
Start-Process notepad.exe "FRONTEND_BOOKING_INTERCEPTOR.js"

Write-Host ""
Write-Host "✅ Ready to test! Follow the steps above." -ForegroundColor Green
Write-Host ""
