# Monitor Render deployment and test service creation

$apiUrl = "https://weddingbazaar-web.onrender.com"

Write-Host "Waiting for Render auto-deployment to complete..." -ForegroundColor Cyan
Write-Host "This usually takes 2-3 minutes." -ForegroundColor Yellow
Write-Host ""

$targetVersion = "2.7.5" # Expected version after fix
$maxWaitMinutes = 5
$startTime = Get-Date

while ((Get-Date) -lt $startTime.AddMinutes($maxWaitMinutes)) {
    try {
        $health = Invoke-RestMethod -Uri "$apiUrl/api/health" -ErrorAction Stop
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Version: $($health.version) | Database: $($health.database)" -ForegroundColor White
        
        if ($health.version -ne "2.7.4-ITEMIZED-PRICES-FIXED") {
            Write-Host ""
            Write-Host "New version detected: $($health.version)" -ForegroundColor Green
            Write-Host ""
            Write-Host "Testing service creation..." -ForegroundColor Cyan
            
            # Run the test
            $result = powershell -File "c:\Games\WeddingBazaar-web\test-create-service.ps1"
            Write-Host $result
            
            break
        }
        
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Deployment in progress..." -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Monitoring complete!" -ForegroundColor Green
