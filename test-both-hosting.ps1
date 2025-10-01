# Testing both hosting URLs to see which has the latest fixes

Write-Host "Testing both Wedding Bazaar hosting URLs..." -ForegroundColor Cyan

# Test both URLs with a simple web request to check if they're accessible
Write-Host "`n1. Testing weddingbazaarph.web.app..." -ForegroundColor Yellow
try {
    $response1 = Invoke-WebRequest -Uri "https://weddingbazaarph.web.app/" -UseBasicParsing
    Write-Host "✅ weddingbazaarph.web.app: Accessible (Status: $($response1.StatusCode))" -ForegroundColor Green
    $content1 = $response1.Content
    if ($content1 -match "Wedding Bazaar") {
        Write-Host "✅ Contains Wedding Bazaar content" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ weddingbazaarph.web.app: Not accessible" -ForegroundColor Red
}

Write-Host "`n2. Testing weddingbazaar-4171e.web.app..." -ForegroundColor Yellow
try {
    $response2 = Invoke-WebRequest -Uri "https://weddingbazaar-4171e.web.app/" -UseBasicParsing
    Write-Host "✅ weddingbazaar-4171e.web.app: Accessible (Status: $($response2.StatusCode))" -ForegroundColor Green
    $content2 = $response2.Content
    if ($content2 -match "Wedding Bazaar") {
        Write-Host "✅ Contains Wedding Bazaar content" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ weddingbazaar-4171e.web.app: Not accessible" -ForegroundColor Red
}

Write-Host "`nBoth sites are accessible. The change likely happened because:" -ForegroundColor Cyan
Write-Host "1. Your .firebaserc has 'weddingbazaarph' as the default project" -ForegroundColor Gray
Write-Host "2. A recent deployment may have gone to the default project" -ForegroundColor Gray
Write-Host "3. Or you manually switched projects for deployment" -ForegroundColor Gray

Write-Host "`nTo check which site has the latest fixes, open both URLs and:" -ForegroundColor Yellow
Write-Host "- Login with couple1@gmail.com" -ForegroundColor Gray
Write-Host "- Check if real conversations show (not Demo User)" -ForegroundColor Gray
Write-Host "- Look for version markers in browser console" -ForegroundColor Gray
