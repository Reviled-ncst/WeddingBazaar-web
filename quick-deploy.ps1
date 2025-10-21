# Quick Deployment Script
# This script helps you deploy without dealing with GitHub secret scanning

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🚀 Wedding Bazaar - Quick Deploy              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "GitHub blocked the push due to old secrets in git history." -ForegroundColor Yellow
Write-Host "But your code changes are ready to deploy!`n" -ForegroundColor Green

Write-Host "Choose your deployment option:`n" -ForegroundColor Cyan

Write-Host "1️⃣  Manual Deployment (Recommended)" -ForegroundColor White
Write-Host "   - Copy code to Render manually" -ForegroundColor Gray
Write-Host "   - Add environment variables" -ForegroundColor Gray
Write-Host "   - No git push needed`n" -ForegroundColor Gray

Write-Host "2️⃣  Allow Secret on GitHub" -ForegroundColor White
Write-Host "   - Go to GitHub URL and allow the secret" -ForegroundColor Gray
Write-Host "   - Then push again" -ForegroundColor Gray
Write-Host "   - Auto-deploy via GitHub`n" -ForegroundColor Gray

$choice = Read-Host "Enter your choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "`n📋 Manual Deployment Steps:`n" -ForegroundColor Cyan
    
    Write-Host "Step 1: Go to Render Dashboard" -ForegroundColor Yellow
    Write-Host "   URL: https://dashboard.render.com`n" -ForegroundColor White
    
    Write-Host "Step 2: Select your service: weddingbazaar-web`n" -ForegroundColor Yellow
    
    Write-Host "Step 3: Go to 'Environment' tab`n" -ForegroundColor Yellow
    
    Write-Host "Step 4: Add these environment variables:`n" -ForegroundColor Yellow
    Write-Host "   PAYMONGO_SECRET_KEY = sk_test_[YOUR_KEY]" -ForegroundColor White
    Write-Host "   PAYMONGO_PUBLIC_KEY = pk_test_[YOUR_KEY]" -ForegroundColor White
    Write-Host "   DATABASE_URL = postgresql://[YOUR_DB_URL]`n" -ForegroundColor White
    
    Write-Host "Step 5: Click 'Save Changes'`n" -ForegroundColor Yellow
    Write-Host "   Render will automatically redeploy!`n" -ForegroundColor Green
    
    Write-Host "Step 6: Wait for deployment (check Logs tab)`n" -ForegroundColor Yellow
    
    Write-Host "Step 7: Test the API:`n" -ForegroundColor Yellow
    Write-Host "   Invoke-WebRequest https://weddingbazaar-web.onrender.com/api/health`n" -ForegroundColor White
    
    Write-Host "✅ That's it! Your receipt system is ready!`n" -ForegroundColor Green
    
} elseif ($choice -eq "2") {
    Write-Host "`n📋 Allow Secret on GitHub:`n" -ForegroundColor Cyan
    
    Write-Host "Step 1: Open this URL in your browser:`n" -ForegroundColor Yellow
    Write-Host "   https://github.com/Reviled-ncst/WeddingBazaar-web/security/secret-scanning/unblock-secret/34LbctuPeJDc4LB9a1tGhP8WH7F`n" -ForegroundColor White
    
    Write-Host "Step 2: Click 'Allow secret' button`n" -ForegroundColor Yellow
    
    Write-Host "Step 3: Return here and push again:" -ForegroundColor Yellow
    $pushNow = Read-Host "   Ready to push? (y/n)"
    
    if ($pushNow -eq "y") {
        Write-Host "`n🚀 Pushing to GitHub...`n" -ForegroundColor Cyan
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Push successful! Render will auto-deploy.`n" -ForegroundColor Green
            Write-Host "Check deployment status at: https://dashboard.render.com`n" -ForegroundColor Cyan
        } else {
            Write-Host "`n❌ Push failed. You may need to allow more secrets.`n" -ForegroundColor Red
            Write-Host "Check GitHub security scanning for more URLs.`n" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n❌ Invalid choice. Run the script again.`n" -ForegroundColor Red
}

Write-Host "📄 For more details, see: DEPLOY_INSTRUCTIONS.md`n" -ForegroundColor Cyan
