Write-Host "🚀 MONITORING ITEMIZED PRICE FIX DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

$backendUrl = "https://weddingbazaar-web.onrender.com/api/health"
$maxAttempts = 20
$waitSeconds = 15

Write-Host "⏳ Waiting for Render deployment to complete..." -ForegroundColor Yellow
Write-Host "   Checking every $waitSeconds seconds (max $maxAttempts attempts)" -ForegroundColor Gray
Write-Host ""

for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "[$i/$maxAttempts] Checking backend health..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $backendUrl -Method GET -TimeoutSec 10
        $healthData = $response.Content | ConvertFrom-Json
        
        if ($healthData.status -eq "OK") {
            Write-Host " ✅ ONLINE" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Backend Status:" -ForegroundColor Cyan
            Write-Host "   Version: $($healthData.version)" -ForegroundColor White
            Write-Host "   Environment: $($healthData.environment)" -ForegroundColor White
            Write-Host "   Database: $($healthData.database)" -ForegroundColor White
            Write-Host ""
            
            # Check if version indicates our fix
            if ($healthData.version -like "*ITEMIZED*") {
                Write-Host "✅ ITEMIZED PRICE FIX IS LIVE!" -ForegroundColor Green
                Write-Host ""
                Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
                Write-Host "   1. Go to: https://weddingbazaarph.web.app/vendor/services" -ForegroundColor White
                Write-Host "   2. Click 'Add New Service'" -ForegroundColor White
                Write-Host "   3. Add package with itemized pricing" -ForegroundColor White
                Write-Host "   4. Submit and verify:" -ForegroundColor White
                Write-Host "      - No 500 error" -ForegroundColor Gray
                Write-Host "      - Service created successfully" -ForegroundColor Gray
                Write-Host "      - Item prices saved correctly" -ForegroundColor Gray
                Write-Host ""
                Write-Host "📝 Check backend logs for item_type mapping messages:" -ForegroundColor Yellow
                Write-Host "   Expected: 'Mapping category `"personnel`" → item_type `"base`"'" -ForegroundColor Gray
                Write-Host ""
            } else {
                Write-Host "⚠️  Deployment detected but version doesn't indicate fix" -ForegroundColor Yellow
                Write-Host "   Current version: $($healthData.version)" -ForegroundColor Gray
                Write-Host "   Deployment may still be processing..." -ForegroundColor Gray
                Write-Host ""
            }
            
            break
        }
    } catch {
        Write-Host " ⏳ Deploying..." -ForegroundColor Yellow
    }
    
    if ($i -lt $maxAttempts) {
        Write-Host "   Waiting $waitSeconds seconds before next check..." -ForegroundColor Gray
        Start-Sleep -Seconds $waitSeconds
    }
}

if ($i -gt $maxAttempts) {
    Write-Host ""
    Write-Host "⚠️  Deployment is taking longer than expected" -ForegroundColor Yellow
    Write-Host "   Please check Render dashboard: https://dashboard.render.com" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Monitor complete!" -ForegroundColor Cyan
