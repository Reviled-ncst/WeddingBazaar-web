Write-Host "Testing Fixed Backend API..." -ForegroundColor Green

# Test Health
try {
    $health = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health"
    Write-Host "Backend Status: $($health.status)" -ForegroundColor Green
    Write-Host "Version: $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "Backend not ready yet" -ForegroundColor Yellow
    exit 1
}

# Test Login
$loginData = @{email="couple1@gmail.com"; password="password123"}
$login = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/auth/login" -Method POST -ContentType "application/json" -Body ($loginData | ConvertTo-Json)

Write-Host "Login Success: $($login.success)" -ForegroundColor Green
Write-Host "User ID: $($login.user.id)" -ForegroundColor Green

# CRITICAL TEST: Conversations API
$conversations = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/conversations/$($login.user.id)"

Write-Host "Conversations API Success: $($conversations.success)" -ForegroundColor Cyan
Write-Host "Conversations Found: $($conversations.count)" -ForegroundColor Cyan

if ($conversations.count -gt 0) {
    Write-Host "FIXED! Found $($conversations.count) real conversations!" -ForegroundColor Green
    Write-Host "First conversation: $($conversations.conversations[0].id)" -ForegroundColor White
    Write-Host "Service: $($conversations.conversations[0].service_name)" -ForegroundColor White
} else {
    Write-Host "NO conversations found - fix failed" -ForegroundColor Red
}
