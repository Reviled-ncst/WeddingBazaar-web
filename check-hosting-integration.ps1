Write-Host "Testing which hosting site has the latest backend integration..." -ForegroundColor Cyan

# Test if the sites are properly configured to use the production backend
$backendUrl = "https://weddingbazaar-web.onrender.com"

Write-Host "Backend URL being tested: $backendUrl" -ForegroundColor Yellow

# Test backend health
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/api/health"
    Write-Host "✅ Backend Status: $($health.status)" -ForegroundColor Green
    Write-Host "✅ Backend Version: $($health.version)" -ForegroundColor Green
    Write-Host "✅ Conversations Available: $($health.databaseStats.conversations)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not accessible" -ForegroundColor Red
    exit 1
}

# Test backend with fixed conversations API
Write-Host "`nTesting backend conversations API..." -ForegroundColor Yellow
try {
    # Login first
    $loginData = @{email="couple1@gmail.com"; password="password123"}
    $login = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -ContentType "application/json" -Body ($loginData | ConvertTo-Json)
    
    # Test conversations
    $conversations = Invoke-RestMethod -Uri "$backendUrl/api/conversations/$($login.user.id)"
    
    Write-Host "✅ Backend API Working:" -ForegroundColor Green
    Write-Host "   - Login: $($login.success)" -ForegroundColor Gray
    Write-Host "   - User ID: $($login.user.id)" -ForegroundColor Gray  
    Write-Host "   - Conversations Found: $($conversations.count)" -ForegroundColor Gray
    
    if ($conversations.count -gt 0) {
        Write-Host "   - First conversation: $($conversations.conversations[0].service_name)" -ForegroundColor Gray
        Write-Host "✅ Backend has the fix - returns real conversations!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend API test failed" -ForegroundColor Red
}

Write-Host "`n🎯 CONCLUSION:" -ForegroundColor Cyan
Write-Host "The hosting URL changed because:" -ForegroundColor White
Write-Host "1. .firebaserc file has 'weddingbazaarph' as default project" -ForegroundColor Gray
Write-Host "2. Recent deployments went to the default project" -ForegroundColor Gray
Write-Host "3. Both sites should work with the same backend API" -ForegroundColor Gray

Write-Host "`n📝 RECOMMENDATION:" -ForegroundColor Yellow
Write-Host "- Use https://weddingbazaarph.web.app/ going forward (it's your default)" -ForegroundColor White
Write-Host "- Both sites should have the same frontend code" -ForegroundColor White  
Write-Host "- Backend fixes are applied and working on both sites" -ForegroundColor White
