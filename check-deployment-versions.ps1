# Check which hosting URL has the latest code with messaging fixes
Write-Host "🔍 Checking both hosting URLs for latest code deployment..." -ForegroundColor Blue

Write-Host "`n1. Checking weddingbazaarph.web.app..." -ForegroundColor Yellow
try {
    $response1 = Invoke-WebRequest -Uri "https://weddingbazaarph.web.app/" -UseBasicParsing
    Write-Host "✅ weddingbazaarph.web.app: Accessible (Status: $($response1.StatusCode))" -ForegroundColor Green
    
    # Check for version markers or recent code patterns
    if ($response1.Content -match "UniversalMessagingContext" -or $response1.Content -match "version-marker") {
        Write-Host "  📝 Contains recent messaging code patterns" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ weddingbazaarph.web.app: Error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Checking weddingbazaar-4171e.web.app..." -ForegroundColor Yellow
try {
    $response2 = Invoke-WebRequest -Uri "https://weddingbazaar-4171e.web.app/" -UseBasicParsing
    Write-Host "✅ weddingbazaar-4171e.web.app: Accessible (Status: $($response2.StatusCode))" -ForegroundColor Green
    
    # Check for version markers or recent code patterns
    if ($response2.Content -match "UniversalMessagingContext" -or $response2.Content -match "version-marker") {
        Write-Host "  📝 Contains recent messaging code patterns" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ weddingbazaar-4171e.web.app: Error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 DEPLOYMENT STATUS SUMMARY:" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Gray
Write-Host "🔧 Default Firebase Project: 'weddingbazaarph' (from .firebaserc)" -ForegroundColor White
Write-Host "🚀 Recent deployments likely went to: https://weddingbazaarph.web.app" -ForegroundColor White
Write-Host "📱 Previous deployments went to: https://weddingbazaar-4171e.web.app" -ForegroundColor White

Write-Host "`n🎯 RECOMMENDATION:" -ForegroundColor Green
Write-Host "- Use https://weddingbazaarph.web.app/ as your primary URL" -ForegroundColor White
Write-Host "- This is your current default Firebase project" -ForegroundColor White
Write-Host "- Recent fixes and deployments are likely on this URL" -ForegroundColor White

Write-Host "`n🧪 TO VERIFY LATEST FIXES:" -ForegroundColor Yellow
Write-Host "1. Open https://weddingbazaarph.web.app/" -ForegroundColor White
Write-Host "2. Open browser console (F12)" -ForegroundColor White
Write-Host "3. Login with couple1@gmail.com / password123" -ForegroundColor White
Write-Host "4. Look for 'UniversalMessagingContext VERSION:' log" -ForegroundColor White
Write-Host "5. Check if real conversations show (not Demo User)" -ForegroundColor White
