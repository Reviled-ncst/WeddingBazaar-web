# Quick Deployment Helper
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Wedding Bazaar - Deployment Guide" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "GitHub blocked the push due to old secrets in git history." -ForegroundColor Yellow
Write-Host "Your code changes are ready! Choose how to deploy:`n" -ForegroundColor Green

Write-Host "Option 1: Manual Deployment via Render Dashboard" -ForegroundColor White
Write-Host "Option 2: Allow secret on GitHub then push`n" -ForegroundColor White

$choice = Read-Host "Enter 1 or 2"

if ($choice -eq "1") {
    Write-Host "`n=== Manual Deployment Steps ===" -ForegroundColor Cyan
    Write-Host "`n1. Go to: https://dashboard.render.com" -ForegroundColor Yellow
    Write-Host "2. Select: weddingbazaar-web" -ForegroundColor Yellow
    Write-Host "3. Go to: Environment tab" -ForegroundColor Yellow
    Write-Host "4. Add these variables:" -ForegroundColor Yellow
    Write-Host "   PAYMONGO_SECRET_KEY=sk_test_YOUR_KEY" -ForegroundColor White
    Write-Host "   PAYMONGO_PUBLIC_KEY=pk_test_YOUR_KEY" -ForegroundColor White
    Write-Host "   DATABASE_URL=postgresql://YOUR_URL" -ForegroundColor White
    Write-Host "5. Click: Save Changes" -ForegroundColor Yellow
    Write-Host "6. Wait for auto-redeploy`n" -ForegroundColor Yellow
    Write-Host "Done! Render will deploy your changes." -ForegroundColor Green
    
} elseif ($choice -eq "2") {
    Write-Host "`n=== Allow Secret on GitHub ===" -ForegroundColor Cyan
    Write-Host "`n1. Open in browser:" -ForegroundColor Yellow
    Write-Host "   https://github.com/Reviled-ncst/WeddingBazaar-web/security/secret-scanning/unblock-secret/34LbctuPeJDc4LB9a1tGhP8WH7F" -ForegroundColor White
    Write-Host "`n2. Click 'Allow secret' button" -ForegroundColor Yellow
    Write-Host "3. Return here and push:" -ForegroundColor Yellow
    
    $pushNow = Read-Host "`nReady to push? (y/n)"
    
    if ($pushNow -eq "y") {
        Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
        git push origin main
    }
}

Write-Host "`nFor details, see: DEPLOY_INSTRUCTIONS.md" -ForegroundColor Cyan
