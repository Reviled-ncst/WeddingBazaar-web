# Monitor Receipt Fix Deployment
# Checks backend health every 30 seconds until new version is deployed

Write-Host "🔄 Monitoring Receipt Fix Deployment..." -ForegroundColor Cyan
Write-Host "Expected commit: 86b6bf6" -ForegroundColor Yellow
Write-Host "Checking every 30 seconds... Press Ctrl+C to stop`n" -ForegroundColor Gray

$targetCommit = "86b6bf6"
$maxAttempts = 20  # 10 minutes max
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    try {
        Write-Host "[Check $attempt/$maxAttempts] $(Get-Date -Format 'HH:mm:ss') - " -NoNewline -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -UseBasicParsing -TimeoutSec 10
        $health = $response.Content | ConvertFrom-Json
        
        $version = $health.version
        $commit = $health.git_commit
        $status = $health.status
        
        if ($commit -and $commit.StartsWith($targetCommit)) {
            Write-Host "✅ NEW VERSION DEPLOYED!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Deployment Details:" -ForegroundColor Cyan
            Write-Host "  Status: $status" -ForegroundColor Green
            Write-Host "  Version: $version" -ForegroundColor Green
            Write-Host "  Commit: $commit" -ForegroundColor Green
            Write-Host "  Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
            Write-Host ""
            Write-Host "🧪 Next Steps:" -ForegroundColor Yellow
            Write-Host "  1. Test manual status update (should work without errors)"
            Write-Host "  2. Test payment processing (should still create receipts)"
            Write-Host "  3. Check backend logs for clean operation"
            Write-Host ""
            break
        }
        else {
            Write-Host "Current: $version | Status: $status | " -NoNewline -ForegroundColor Yellow
            if ($commit) {
                Write-Host "Commit: $($commit.Substring(0, [Math]::Min(7, $commit.Length)))" -ForegroundColor Yellow
            } else {
                Write-Host "Waiting for new version..." -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 30
    }
}

if ($attempt -ge $maxAttempts) {
    Write-Host ""
    Write-Host "⚠️ Deployment taking longer than expected." -ForegroundColor Yellow
    Write-Host "Please check Render dashboard manually:" -ForegroundColor Yellow
    Write-Host "https://dashboard.render.com" -ForegroundColor Cyan
}
