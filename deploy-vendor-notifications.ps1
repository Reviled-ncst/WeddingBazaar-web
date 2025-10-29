# Deploy Vendor Email Notifications Feature
# Wedding Bazaar Backend Deployment
# Date: October 29, 2025

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VENDOR EMAIL NOTIFICATIONS DEPLOY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend-deploy")) {
    Write-Host "❌ Error: backend-deploy folder not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if git is available
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Error: Git not found!" -ForegroundColor Red
    Write-Host "   Please install Git first." -ForegroundColor Yellow
    exit 1
}

# Display deployment checklist
Write-Host "📋 PRE-DEPLOYMENT CHECKLIST" -ForegroundColor Yellow
Write-Host ""
Write-Host "Before proceeding, ensure you have:" -ForegroundColor White
Write-Host "  ✓ Generated Gmail app password" -ForegroundColor Green
Write-Host "  ✓ Added EMAIL_USER to Render environment" -ForegroundColor Green
Write-Host "  ✓ Added EMAIL_PASS to Render environment" -ForegroundColor Green
Write-Host "  ✓ Added FRONTEND_URL to Render environment" -ForegroundColor Green
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Have you completed the above steps? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host ""
    Write-Host "⚠️  Deployment cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 Please complete the setup first:" -ForegroundColor Cyan
    Write-Host "   1. Read DEPLOY_VENDOR_NOTIFICATIONS.md" -ForegroundColor White
    Write-Host "   2. Generate Gmail app password" -ForegroundColor White
    Write-Host "   3. Configure Render environment variables" -ForegroundColor White
    Write-Host "   4. Run this script again" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting deployment process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check for uncommitted changes
Write-Host "Step 1: Checking for uncommitted changes..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Found uncommitted changes:" -ForegroundColor Green
    Write-Host ""
    
    # Show relevant files
    $emailServiceChanged = git status --porcelain | Select-String "emailService.cjs"
    $bookingsRouteChanged = git status --porcelain | Select-String "bookings.cjs"
    
    if ($emailServiceChanged) {
        Write-Host "  ✓ backend-deploy/utils/emailService.cjs" -ForegroundColor Green
    }
    if ($bookingsRouteChanged) {
        Write-Host "  ✓ backend-deploy/routes/bookings.cjs" -ForegroundColor Green
    }
    
    Write-Host ""
} else {
    Write-Host "✅ Working directory clean" -ForegroundColor Green
}

# Step 2: Stage changes
Write-Host ""
Write-Host "Step 2: Staging backend changes..." -ForegroundColor Yellow
git add backend-deploy/utils/emailService.cjs 2>&1 | Out-Null
git add backend-deploy/routes/bookings.cjs 2>&1 | Out-Null
git add DEPLOY_VENDOR_NOTIFICATIONS.md 2>&1 | Out-Null
git add VENDOR_EMAIL_NOTIFICATIONS_COMPLETE.md 2>&1 | Out-Null
Write-Host "✅ Changes staged successfully" -ForegroundColor Green

# Step 3: Show staged files
Write-Host ""
Write-Host "Step 3: Reviewing staged changes..." -ForegroundColor Yellow
Write-Host ""
git status --short | Where-Object { $_ -match "^[AM]" } | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Cyan
}
Write-Host ""

# Step 4: Commit changes
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
$commitMessage = @"
feat: Add vendor email notifications for new bookings

- Implemented sendNewBookingNotification in emailService
- Integrated email notifications into booking creation flow
- Added Gmail SMTP configuration with fallback logging
- Non-blocking email sending to prevent booking failures
- Beautiful HTML email template with booking details
- Mobile-responsive design with call-to-action buttons
- High priority email flag for vendor notifications
- Comprehensive deployment documentation

Files changed:
- backend-deploy/utils/emailService.cjs
- backend-deploy/routes/bookings.cjs
- DEPLOY_VENDOR_NOTIFICATIONS.md (deployment guide)
- VENDOR_EMAIL_NOTIFICATIONS_COMPLETE.md (feature docs)
"@

git commit -m $commitMessage 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Nothing to commit (already committed)" -ForegroundColor Yellow
}

# Step 5: Push to GitHub
Write-Host ""
Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "   This will trigger automatic deployment on Render..." -ForegroundColor Cyan
Write-Host ""

git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "   Please check your connection and try again." -ForegroundColor Yellow
    exit 1
}

# Step 6: Monitor deployment
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT INITIATED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Monitor Render Deployment:" -ForegroundColor White
Write-Host "   → Go to: https://dashboard.render.com/" -ForegroundColor Cyan
Write-Host "   → Select: weddingbazaar-web service" -ForegroundColor Cyan
Write-Host "   → Click: 'Logs' tab" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Wait for deployment logs showing:" -ForegroundColor White
Write-Host "   ✅ Email service configured with: your-email@gmail.com" -ForegroundColor Green
Write-Host "   ✅ Server running on port 3001" -ForegroundColor Green
Write-Host ""
Write-Host "3. Test Email Notifications:" -ForegroundColor White
Write-Host "   → Login as couple/individual" -ForegroundColor Cyan
Write-Host "   → Create a test booking" -ForegroundColor Cyan
Write-Host "   → Check vendor's email inbox" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Verify in Backend Logs:" -ForegroundColor White
Write-Host "   📧 Sending new booking notification to vendor: ..." -ForegroundColor Cyan
Write-Host "   ✅ Vendor notification sent successfully: <message-id>" -ForegroundColor Green
Write-Host ""

# Option to open Render dashboard
Write-Host "========================================" -ForegroundColor Cyan
$openDashboard = Read-Host "Open Render dashboard now? (y/N)"
if ($openDashboard -eq "y" -or $openDashboard -eq "Y") {
    Start-Process "https://dashboard.render.com/"
    Write-Host "✅ Opening Render dashboard..." -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT SCRIPT COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📖 For troubleshooting, see:" -ForegroundColor Cyan
Write-Host "   DEPLOY_VENDOR_NOTIFICATIONS.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Thank you for using Wedding Bazaar!" -ForegroundColor Magenta
Write-Host ""
