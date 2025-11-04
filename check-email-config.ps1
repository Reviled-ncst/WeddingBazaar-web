# Email Configuration Status Checker for Wedding Bazaar

Write-Host "=============================================="
Write-Host "Email Configuration Check"
Write-Host "=============================================="
Write-Host ""

# Check local .env file
if (Test-Path ".env") {
    Write-Host "[OK] .env file found"
    
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "EMAIL_USER=(.+)") {
        $emailUser = $matches[1].Trim()
        if ($emailUser -and $emailUser -ne "" -and $emailUser -ne "your-email@gmail.com") {
            Write-Host "[OK] EMAIL_USER is configured: $emailUser"
        } else {
            Write-Host "[WARNING] EMAIL_USER is not configured or using placeholder"
        }
    } else {
        Write-Host "[ERROR] EMAIL_USER is missing from .env"
    }
    
    if ($envContent -match "EMAIL_PASS=(.+)") {
        $emailPass = $matches[1].Trim()
        if ($emailPass -and $emailPass -ne "" -and $emailPass -ne "your-app-password") {
            Write-Host "[OK] EMAIL_PASS is configured (hidden)"
        } else {
            Write-Host "[WARNING] EMAIL_PASS is not configured or using placeholder"
        }
    } else {
        Write-Host "[ERROR] EMAIL_PASS is missing from .env"
    }
} else {
    Write-Host "[ERROR] .env file not found"
}

Write-Host ""
Write-Host "=============================================="
Write-Host "Backend Files Check"
Write-Host "=============================================="
Write-Host ""

# Check email service file
if (Test-Path "backend-deploy/utils/emailService.cjs") {
    Write-Host "[OK] Email service file exists"
} else {
    Write-Host "[ERROR] Email service file not found"
}

# Check bookings route
if (Test-Path "backend-deploy/routes/bookings.cjs") {
    Write-Host "[OK] Bookings route file exists"
    
    $bookingsContent = Get-Content "backend-deploy/routes/bookings.cjs" -Raw
    
    if ($bookingsContent -match "emailService") {
        Write-Host "[OK] Email service is imported"
    } else {
        Write-Host "[ERROR] Email service is NOT imported"
    }
    
    if ($bookingsContent -match "sendNewBookingNotification") {
        Write-Host "[OK] Email notification is called after booking"
    } else {
        Write-Host "[ERROR] Email notification is NOT called"
    }
} else {
    Write-Host "[ERROR] Bookings route file not found"
}

Write-Host ""
Write-Host "=============================================="
Write-Host "Action Items"
Write-Host "=============================================="
Write-Host ""
Write-Host "For Production (Render):"
Write-Host "  1. Login to https://dashboard.render.com"
Write-Host "  2. Go to weddingbazaar-web service"
Write-Host "  3. Click Environment tab"
Write-Host "  4. Add EMAIL_USER=your-email@gmail.com"
Write-Host "  5. Add EMAIL_PASS=your-app-password"
Write-Host "  6. Redeploy service"
Write-Host ""
Write-Host "For Gmail App Password:"
Write-Host "  1. Visit https://myaccount.google.com/apppasswords"
Write-Host "  2. Generate new app password"
Write-Host "  3. Copy and use in Render"
Write-Host ""
Write-Host "Full guide: See SETUP_EMAIL_NOTIFICATIONS.md"
Write-Host ""
