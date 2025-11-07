# Itemized Price Fix - Deployment Monitor
# Run this script every 30 seconds to check when deployment is live

Write-Host "🚀 Monitoring Backend Deployment..." -ForegroundColor Cyan
Write-Host "🎯 Waiting for version: 2.7.4-ITEMIZED-PRICES-FIXED" -ForegroundColor Yellow
Write-Host ""

$targetVersion = "2.7.4-ITEMIZED-PRICES-FIXED"
$maxAttempts = 20  # 10 minutes (30s * 20)
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    try {
        Write-Host "[$attempt/$maxAttempts] Checking backend... " -NoNewline
        
        $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -UseBasicParsing -TimeoutSec 10
        $data = $response.Content | ConvertFrom-Json
        
        $currentVersion = $data.version
        $status = $data.status
        $timestamp = $data.timestamp
        
        if ($currentVersion -eq $targetVersion) {
            Write-Host "✅ DEPLOYED!" -ForegroundColor Green
            Write-Host ""
            Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "║  🎉 BACKEND DEPLOYMENT SUCCESSFUL! 🎉                 ║" -ForegroundColor Green
            Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Backend Version: $currentVersion" -ForegroundColor Cyan
            Write-Host "✅ Status: $status" -ForegroundColor Green
            Write-Host "⏰ Timestamp: $timestamp" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "🧪 NEXT STEPS:" -ForegroundColor Magenta
            Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
            Write-Host "2. Login as vendor: https://weddingbazaarph.web.app" -ForegroundColor White
            Write-Host "3. Navigate to: Vendor Dashboard → Services → Add Service" -ForegroundColor White
            Write-Host "4. Create NEW service with itemized packages" -ForegroundColor White
            Write-Host "5. Verify prices display correctly in confirmation modal" -ForegroundColor White
            Write-Host ""
            Write-Host "⚠️ IMPORTANT: Only NEW services will show correct prices!" -ForegroundColor Yellow
            Write-Host ""
            
            exit 0
        } else {
            Write-Host "⏳ Current: $currentVersion (Still deploying...)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "   Retrying in 30 seconds..."
        Start-Sleep -Seconds 30
    }
}

Write-Host ""
Write-Host "⚠️ Deployment taking longer than expected (>10 minutes)" -ForegroundColor Yellow
Write-Host "   Check Render dashboard: https://dashboard.render.com" -ForegroundColor Cyan
Write-Host "   Or manually verify: https://weddingbazaar-web.onrender.com/api/health" -ForegroundColor Cyan
