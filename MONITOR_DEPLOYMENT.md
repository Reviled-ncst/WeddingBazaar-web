# Backend Deployment Monitor - Live Status

**Monitoring Render Auto-Deploy**  
**Commit:** 2271295  
**Push Time:** 14:51 UTC  
**Status:** 🟡 WAITING FOR DEPLOYMENT

## Quick Monitor Script

Run this in PowerShell to watch for deployment completion:

```powershell
Write-Host "🔍 Monitoring backend deployment..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$oldVersion = "2.6.0-PAYMENT-WORKFLOW-COMPLETE"

while ($true) {
    try {
        $health = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -ErrorAction SilentlyContinue
        $currentTime = Get-Date -Format "HH:mm:ss"
        
        if ($health.version -ne $oldVersion) {
            Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
            Write-Host "New Version: $($health.version)" -ForegroundColor Green
            Write-Host "Time: $currentTime" -ForegroundColor Green
            break
        } else {
            Write-Host "[$currentTime] Still deploying... Version: $($health.version)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[$currentTime] Backend unreachable (possibly restarting)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "🧪 Now test the endpoints:" -ForegroundColor Cyan
Write-Host "1. Accept Quote: https://weddingbazaar-web.onrender.com/api/bookings/1760918009/accept-quote" -ForegroundColor White
Write-Host "2. Enhanced Bookings: https://weddingbazaar-web.onrender.com/api/bookings/enhanced?coupleId=1-2025-001" -ForegroundColor White
```

## Manual Check

```powershell
# Check current version
$health = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health"
Write-Host "Version: $($health.version)"
Write-Host "Status: $($health.status)"
```

## What to Test After Deployment

### 1. Test Accept Quote
```powershell
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/bookings/1760918009/accept-quote" -Method PATCH -Headers @{"Content-Type"="application/json"} -Body '{"status":"approved"}'
```

### 2. Test vendor_notes Field
```powershell
$bookings = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/bookings/enhanced?coupleId=1-2025-001"
$bookings.bookings[0].vendor_notes
```

### 3. Test Frontend
- Login as couple: vendor0qw@gmail.com
- Go to Bookings → Click quote → Should see itemized breakdown
- Click "Accept Quote" → Should work without error

---

**Expected Deploy Time:** 10-15 minutes from 14:51 UTC  
**Check Again At:** 15:00 UTC  
**Dashboard:** https://dashboard.render.com
