@echo off
REM ============================================================================
REM Wedding Bazaar Auto Deployment Script
REM Deploys vendor off-days API to production
REM ============================================================================

title Wedding Bazaar - Auto Deployment

echo.
echo ============================================================================
echo   WEDDING BAZAAR - AUTO DEPLOYMENT
echo   Deploying Vendor Off-Days API to Production
echo ============================================================================
echo.

REM Check if we're in the right directory
if not exist "backend-deploy\index.js" (
    echo ❌ ERROR: Must run from project root directory
    echo    Current directory: %CD%
    echo    Expected file: backend-deploy\index.js
    pause
    exit /b 1
)

echo ✅ Project structure verified
echo.

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Check Git installation
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Git not found. Please install Git first.
    pause
    exit /b 1
)

echo ✅ Git detected:
git --version
echo.

REM Syntax check
echo 🔍 Checking JavaScript syntax...
node -c backend-deploy\index.js
if errorlevel 1 (
    echo ❌ SYNTAX ERRORS FOUND! Fix before deploying.
    pause
    exit /b 1
)
echo ✅ Syntax check passed
echo.

REM Show deployment summary
echo ============================================================================
echo   DEPLOYMENT SUMMARY
echo ============================================================================
echo   📄 File: backend-deploy\index.js
echo   🔗 New Endpoints: 5 vendor off-days routes added
echo   🗄️  Database: Uses existing vendor_off_days table
echo   🌐 Backend URL: https://weddingbazaar-web.onrender.com
echo   📱 Frontend URL: https://weddingbazaar-web.web.app
echo ============================================================================
echo.

REM Confirm deployment
set /p confirm="Continue with deployment? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Deployment cancelled by user.
    pause
    exit /b 0
)

echo.
echo 📦 Preparing deployment...

REM Git operations
echo   • Adding files to git...
git add backend-deploy\index.js
git add VENDOR_OFF_DAYS_API_INTEGRATION_COMPLETE.md
git add deploy-vendor-off-days.ps1
git add deploy-vendor-off-days.sh
git add deploy.bat

echo   • Committing changes...
git commit -m "feat: Add vendor off-days API endpoints matching frontend expectations

- Added GET /api/vendors/:vendorId/off-days
- Added POST /api/vendors/:vendorId/off-days  
- Added POST /api/vendors/:vendorId/off-days/bulk
- Added DELETE /api/vendors/:vendorId/off-days/:offDayId
- Added GET /api/vendors/:vendorId/off-days/count
- Updated 404 handler documentation
- Ready for database-backed vendor availability storage
- Auto deployment via deploy.bat"

if errorlevel 1 (
    echo ⚠️  Nothing to commit or commit failed
    echo   This might mean changes are already committed
) else (
    echo ✅ Changes committed successfully
)

echo.
echo 🚀 Triggering deployment...
git push origin main

if errorlevel 1 (
    echo ❌ DEPLOYMENT FAILED!
    echo    Check your git configuration and network connection
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo   ✅ DEPLOYMENT SUCCESSFUL!
echo ============================================================================
echo.
echo 📍 NEXT STEPS:
echo   1. Wait 2-3 minutes for Render deployment to complete
echo   2. Check deployment status: https://dashboard.render.com
echo   3. Test API endpoint:
echo      curl https://weddingbazaar-web.onrender.com/api/vendors/1/off-days
echo   4. Frontend will automatically switch from localStorage to database
echo.
echo 🎉 Vendor off-days feature is now database-backed!
echo.
echo ============================================================================
echo   AVAILABLE API ENDPOINTS:
echo ============================================================================
echo   GET    /api/vendors/:vendorId/off-days         - Get all off days
echo   POST   /api/vendors/:vendorId/off-days         - Add single off day
echo   POST   /api/vendors/:vendorId/off-days/bulk    - Add multiple off days
echo   DELETE /api/vendors/:vendorId/off-days/:id     - Remove off day
echo   GET    /api/vendors/:vendorId/off-days/count   - Get analytics count
echo ============================================================================
echo.

REM Optional: Open browser to check deployment
set /p openbrowser="Open dashboard in browser? (Y/N): "
if /i "%openbrowser%"=="Y" (
    start https://dashboard.render.com
    start https://weddingbazaar-web.onrender.com/api/health
)

echo.
echo Deployment complete! Press any key to exit...
pause >nul