# Backend Deployment Fix - Quick Deploy Script

Write-Host "🚀 Deploying Backend Timeout Fix to Render..." -ForegroundColor Cyan
Write-Host ""

# 1. Stage changes
Write-Host "📦 Staging changes..." -ForegroundColor Yellow
git add backend-deploy/production-backend.js
git add backend-deploy/config/database.cjs
git add BACKEND_DEPLOYMENT_TIMEOUT_FIX.md

# 2. Commit
Write-Host "📝 Committing..." -ForegroundColor Yellow
git commit -m "fix: Add timeout protection for database connection during deployment

- Add 10-second timeout for database initialization  
- Simplify testConnection() to remove slow operations
- Remove demo user creation during startup
- Server now starts immediately without waiting for database
- Fixes Render deployment timeout issue"

# 3. Push
Write-Host "🚢 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Changes pushed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Render will auto-deploy in a few seconds" -ForegroundColor Cyan
Write-Host "🔗 Monitor: https://dashboard.render.com" -ForegroundColor Blue
Write-Host ""
Write-Host "Expected deployment time: < 2 minutes" -ForegroundColor Green
Write-Host ""
Write-Host "After deployment, test:" -ForegroundColor Yellow
Write-Host "  curl https://weddingbazaar-web.onrender.com/api/health" -ForegroundColor Gray
Write-Host ""
