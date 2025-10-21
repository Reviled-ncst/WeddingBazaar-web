#!/usr/bin/env pwsh

Write-Host "`n⚠️  DEPLOYMENT REMINDER!" -ForegroundColor Red
Write-Host "================================`n" -ForegroundColor Red

Write-Host "You've made changes to the codebase." -ForegroundColor Yellow
Write-Host "These changes are NOT live in production yet!`n" -ForegroundColor Yellow

Write-Host "🚀 Quick Deploy Commands:" -ForegroundColor Cyan
Write-Host "`n1️⃣  Commit and push (Backend auto-deploys):" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Your change description'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray

Write-Host "`n2️⃣  Deploy frontend:" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host "   firebase deploy" -ForegroundColor Gray

Write-Host "`n3️⃣  Or use the complete deployment script:" -ForegroundColor White
Write-Host "   .\deploy-complete.ps1" -ForegroundColor Gray

Write-Host "`n💡 Check deployment status:" -ForegroundColor Cyan
Write-Host "   .\check-deployment-status.ps1" -ForegroundColor Gray

Write-Host "`n📋 Remember:" -ForegroundColor Yellow
Write-Host "   - Backend changes = Push to Git (auto-deploys)" -ForegroundColor White
Write-Host "   - Frontend changes = npm run build + firebase deploy" -ForegroundColor White
Write-Host "   - Environment vars = Update in Render dashboard" -ForegroundColor White

Write-Host "`n🔗 Deployment Dashboards:" -ForegroundColor Cyan
Write-Host "   Render:   https://dashboard.render.com" -ForegroundColor White
Write-Host "   Firebase: https://console.firebase.google.com" -ForegroundColor White

Write-Host "`n================================" -ForegroundColor Red
Write-Host "⚠️  DEPLOY NOW TO MAKE CHANGES LIVE!" -ForegroundColor Red
Write-Host "================================`n" -ForegroundColor Red
