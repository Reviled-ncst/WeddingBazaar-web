# 📧 Email Configuration Status Checker
# This script checks if email notifications are properly configured

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📧 Wedding Bazaar - Email Configuration Check" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Read .env file
    $envContent = Get-Content ".env" -Raw
    
    # Check for EMAIL_USER
    if ($envContent -match "EMAIL_USER=(.+)") {
        $emailUser = $matches[1].Trim()
        if ($emailUser -and $emailUser -ne "" -and $emailUser -ne "your-email@gmail.com") {
            Write-Host "✅ EMAIL_USER is configured: $emailUser" -ForegroundColor Green
        } else {
            Write-Host "⚠️  EMAIL_USER is not configured or using placeholder" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ EMAIL_USER is missing from .env" -ForegroundColor Red
    }
    
    # Check for EMAIL_PASS
    if ($envContent -match "EMAIL_PASS=(.+)") {
        $emailPass = $matches[1].Trim()
        if ($emailPass -and $emailPass -ne "" -and $emailPass -ne "your-app-password") {
            Write-Host "✅ EMAIL_PASS is configured (***hidden***)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  EMAIL_PASS is not configured or using placeholder" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ EMAIL_PASS is missing from .env" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🔍 Render Environment Status" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Note: This script checks local .env only." -ForegroundColor Yellow
Write-Host "   For production, verify in Render Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "   2. Select: weddingbazaar-web service" -ForegroundColor White
Write-Host "   3. Click: Environment tab" -ForegroundColor White
Write-Host "   4. Verify: EMAIL_USER and EMAIL_PASS exist" -ForegroundColor White
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📝 Backend Email Service Status" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check emailService.cjs
$emailServicePath = "backend-deploy/utils/emailService.cjs"
if (Test-Path $emailServicePath) {
    Write-Host "✅ Email service file exists: $emailServicePath" -ForegroundColor Green
    
    $emailServiceContent = Get-Content $emailServicePath -Raw
    
    # Check if email service is properly configured
    if ($emailServiceContent -match "this\.isConfigured\s*=\s*!!\(process\.env\.EMAIL_USER.*process\.env\.EMAIL_PASS") {
        Write-Host "✅ Email service checks for credentials" -ForegroundColor Green
    }
    
    if ($emailServiceContent -match "sendNewBookingNotification") {
        Write-Host "✅ Booking notification method exists" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Email service file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📋 Booking Route Email Integration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check bookings.cjs
$bookingsRoutePath = "backend-deploy/routes/bookings.cjs"
if (Test-Path $bookingsRoutePath) {
    Write-Host "✅ Bookings route file exists: $bookingsRoutePath" -ForegroundColor Green
    
    $bookingsContent = Get-Content $bookingsRoutePath -Raw
    
    # Check if email service is imported
    if ($bookingsContent -match "emailService") {
        Write-Host "✅ Email service is imported in bookings route" -ForegroundColor Green
    } else {
        Write-Host "❌ Email service is NOT imported" -ForegroundColor Red
    }
    
    # Check if sendNewBookingNotification is called
    if ($bookingsContent -match "sendNewBookingNotification") {
        Write-Host "✅ Email notification is called after booking creation" -ForegroundColor Green
    } else {
        Write-Host "❌ Email notification is NOT called" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Bookings route file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎯 Summary & Action Items" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Determine overall status
$localConfigured = $false
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "EMAIL_USER=(.+)" -and $envContent -match "EMAIL_PASS=(.+)") {
        $emailUser = $matches[1].Trim()
        if ($emailUser -and $emailUser -ne "" -and $emailUser -ne "your-email@gmail.com") {
            $localConfigured = $true
        }
    }
}

if ($localConfigured) {
    Write-Host "✅ Local Development: Email configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Local Development: Email NOT configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   To configure locally:" -ForegroundColor White
    Write-Host "   1. Add EMAIL_USER=your-email@gmail.com to .env" -ForegroundColor White
    Write-Host "   2. Add EMAIL_PASS=your-app-password to .env" -ForegroundColor White
    Write-Host "   3. Generate app password: https://myaccount.google.com/apppasswords" -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 Production (Render):" -ForegroundColor Yellow
Write-Host "   1. Login to Render: https://dashboard.render.com" -ForegroundColor White
Write-Host "   2. Go to weddingbazaar-web → Environment" -ForegroundColor White
Write-Host "   3. Add EMAIL_USER and EMAIL_PASS variables" -ForegroundColor White
Write-Host "   4. Redeploy service" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full Guide: See SETUP_EMAIL_NOTIFICATIONS.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Check Complete" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
