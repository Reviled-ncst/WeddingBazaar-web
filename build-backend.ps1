# Build script for backend deployment (PowerShell)
Write-Host "🔨 Building Wedding Bazaar Backend for deployment..." -ForegroundColor Green

# Create backend directory structure
if (Test-Path "backend-deploy") {
    Remove-Item -Recurse -Force "backend-deploy"
}
New-Item -ItemType Directory -Name "backend-deploy" -Force
Set-Location "backend-deploy"

# Copy backend package.json
Copy-Item "../backend-package.json" "package.json"

# Copy TypeScript config
Copy-Item "../tsconfig.backend.json" "tsconfig.json"

# Copy server files
Copy-Item -Recurse "../server" "."

# Create dist directory
New-Item -ItemType Directory -Name "dist" -Force

Set-Location ".."

Write-Host "✅ Backend deployment package created in backend-deploy/" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload this folder to your deployment platform"
Write-Host "2. Set environment variables:"
Write-Host "   - DATABASE_URL (Neon PostgreSQL URL)"
Write-Host "   - JWT_SECRET"
Write-Host "   - NODE_ENV=production"
Write-Host "   - FRONTEND_URL=https://weddingbazaarph.web.app"
Write-Host "3. Run: npm install && npm run build && npm start"
