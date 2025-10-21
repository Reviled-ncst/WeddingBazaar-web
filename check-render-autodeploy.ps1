# Check and Fix Render Auto-Deploy

Write-Host "`n=== Render Auto-Deploy Troubleshooting ===" -ForegroundColor Cyan

Write-Host "`n📊 Current Status:" -ForegroundColor Yellow
Write-Host "  Local code: ✅ Receipt generation implemented" -ForegroundColor Green
Write-Host "  GitHub: ✅ Code pushed successfully" -ForegroundColor Green
Write-Host "  Render: ❌ Still running OLD version (2.6.0)" -ForegroundColor Red

Write-Host "`n🔍 Diagnosis:" -ForegroundColor Cyan
Write-Host "  Render is NOT auto-deploying from GitHub!" -ForegroundColor Yellow

Write-Host "`n💡 Possible Causes & Fixes:" -ForegroundColor Cyan

Write-Host "`n1️⃣ Auto-Deploy is Disabled" -ForegroundColor White
Write-Host "   Fix: Enable auto-deploy in Render settings" -ForegroundColor Gray
Write-Host "   Steps:" -ForegroundColor Yellow
Write-Host "   a) Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "   b) Select: weddingbazaar-web" -ForegroundColor White
Write-Host "   c) Go to: Settings tab" -ForegroundColor White
Write-Host "   d) Under 'Build & Deploy', check:" -ForegroundColor White
Write-Host "      - Auto-Deploy: Should be 'Yes'" -ForegroundColor White
Write-Host "      - Branch: Should be 'main'" -ForegroundColor White

Write-Host "`n2️⃣ Webhook Not Configured" -ForegroundColor White
Write-Host "   Fix: Reconnect GitHub integration" -ForegroundColor Gray
Write-Host "   Steps:" -ForegroundColor Yellow
Write-Host "   a) In Render dashboard, go to Settings" -ForegroundColor White
Write-Host "   b) Under 'Build & Deploy', check GitHub connection" -ForegroundColor White
Write-Host "   c) If needed, click 'Reconnect' to GitHub" -ForegroundColor White

Write-Host "`n3️⃣ Force Push Didn't Trigger Webhook" -ForegroundColor White
Write-Host "   Fix: Manual deploy (always works)" -ForegroundColor Gray
Write-Host "   Steps:" -ForegroundColor Yellow
Write-Host "   a) Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "   b) Select: weddingbazaar-web" -ForegroundColor White
Write-Host "   c) Click: 'Manual Deploy' button" -ForegroundColor White
Write-Host "   d) Select: 'Deploy latest commit'" -ForegroundColor White

Write-Host "`n🚀 Immediate Solution (Works 100%):" -ForegroundColor Green
Write-Host "   MANUAL DEPLOY from Render dashboard" -ForegroundColor White
Write-Host "   This will deploy your code RIGHT NOW" -ForegroundColor Yellow

$action = Read-Host "`nOpen Render dashboard now? (y/n)"

if ($action -eq "y") {
    Write-Host "`n🌐 Opening Render dashboard..." -ForegroundColor Cyan
    Start-Process "https://dashboard.render.com/web/srv-ct4ru8l6l47c73e31b3g"
    
    Write-Host "`n📋 In the dashboard:" -ForegroundColor Yellow
    Write-Host "1. Click 'Manual Deploy' (blue button, top right)" -ForegroundColor White
    Write-Host "2. Select 'Deploy latest commit'" -ForegroundColor White
    Write-Host "3. Watch the logs" -ForegroundColor White
    Write-Host "4. Wait for 'Live' status (2-3 minutes)" -ForegroundColor White
    
    Write-Host "`n⏳ After deployment, run:" -ForegroundColor Cyan
    Write-Host "   .\test-deployment.ps1" -ForegroundColor White
    Write-Host "   (to verify the receipt endpoint works)" -ForegroundColor Gray
}

Write-Host "`n📝 To check auto-deploy settings:" -ForegroundColor Cyan
Write-Host "   Go to: Settings > Build & Deploy" -ForegroundColor White
Write-Host "   Verify: Auto-Deploy = Yes, Branch = main" -ForegroundColor White

Write-Host "`n📄 See URGENT_DEPLOY_NOW.md for complete guide" -ForegroundColor Gray
