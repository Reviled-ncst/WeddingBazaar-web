# 🚀 Quick Performance Optimization & Deployment
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  WEDDING BAZAAR OPTIMIZATION   " -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "   ✅ Cleaned dist folder" -ForegroundColor Green
}

# Step 2: Build optimized production bundle
Write-Host "`n🔨 Building optimized production bundle..." -ForegroundColor Yellow
Write-Host "   - Removing console.logs" -ForegroundColor White
Write-Host "   - Code splitting vendors" -ForegroundColor White
Write-Host "   - Minifying with esbuild" -ForegroundColor White
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build completed successfully!" -ForegroundColor Green

# Step 3: Analyze bundle size
Write-Host "`n📊 Bundle Analysis:" -ForegroundColor Cyan
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    $jsFiles = Get-ChildItem -Path "dist\js" -Filter "*.js" -ErrorAction SilentlyContinue
    $cssFiles = Get-ChildItem -Path "dist\assets" -Filter "*.css" -ErrorAction SilentlyContinue
    
    Write-Host "   📦 Total bundle size: $([math]::Round($distSize, 2)) MB" -ForegroundColor White
    
    if ($jsFiles) {
        Write-Host "   📜 JavaScript files: $($jsFiles.Count)" -ForegroundColor White
        $largestJs = $jsFiles | Sort-Object Length -Descending | Select-Object -First 3
        foreach ($file in $largestJs) {
            $sizeKB = [math]::Round($file.Length / 1KB, 2)
            Write-Host "      - $($file.Name): $sizeKB KB" -ForegroundColor Gray
        }
    }
    
    if ($cssFiles) {
        Write-Host "   🎨 CSS files: $($cssFiles.Count)" -ForegroundColor White
    }
}

# Step 4: Check for console logs (should be none)
Write-Host "`n🔍 Checking for console.logs in build..." -ForegroundColor Cyan
$jsContent = Get-ChildItem -Path "dist\js" -Filter "*.js" -ErrorAction SilentlyContinue | Get-Content -Raw
if ($jsContent -match "console\.log") {
    Write-Host "   ⚠️ Warning: Found console.log in production build" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ No console.logs found - Clean production build!" -ForegroundColor Green
}

# Step 5: Deployment options
Write-Host "`n🚀 Deployment Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   [1] Deploy to Firebase Hosting" -ForegroundColor White
Write-Host "   [2] Preview build locally (npm run preview)" -ForegroundColor White
Write-Host "   [3] Exit (manual deployment)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n🌐 Deploying to Firebase Hosting..." -ForegroundColor Yellow
        firebase deploy --only hosting
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
            Write-Host "   🌐 Live at: https://weddingbazaarph.web.app" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "📊 Verification Steps:" -ForegroundColor Yellow
            Write-Host "   1. Open https://weddingbazaarph.web.app" -ForegroundColor White
            Write-Host "   2. Open DevTools Console (F12)" -ForegroundColor White
            Write-Host "   3. Verify no excessive console.logs" -ForegroundColor White
            Write-Host "   4. Check loading speed is improved" -ForegroundColor White
        } else {
            Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
        }
    }
    "2" {
        Write-Host "`n👀 Starting preview server..." -ForegroundColor Yellow
        Write-Host "   Open http://localhost:4173 to preview" -ForegroundColor White
        npm run preview
    }
    "3" {
        Write-Host "`n✅ Build ready in dist/ folder" -ForegroundColor Green
        Write-Host "   Deploy manually when ready" -ForegroundColor White
    }
    default {
        Write-Host "`n❌ Invalid choice. Exiting." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "   OPTIMIZATION COMPLETE! 🎉    " -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
