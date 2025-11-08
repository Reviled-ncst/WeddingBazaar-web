@echo off
echo ========================================
echo DATABASE VERIFICATION GUIDE
echo ========================================
echo.
echo STEP 1: Open Neon SQL Console
echo   URL: https://console.neon.tech/
echo.
echo STEP 2: Navigate to SQL Editor
echo   - Click your project
echo   - Click "SQL Editor" in sidebar
echo.
echo STEP 3: Copy and Run Script
echo   - Open: VERIFY_DATABASE_READY.sql
echo   - Copy ALL contents (Ctrl+A, Ctrl+C)
echo   - Paste in SQL Editor (Ctrl+V)
echo   - Click "Run" or press Ctrl+Enter
echo.
echo STEP 4: Check Results
echo   Look for these success indicators:
echo   - Step 1: ✅ Vendor is verified
echo   - Step 2: ✅ Document approved
echo   - Step 3: ✅ Correct (VARCHAR)
echo   - Step 8: ✅ ALL CHECKS PASSED
echo.
echo ========================================
echo IMPORTANT: BACKEND DEPLOYMENT STATUS
echo ========================================
echo.
echo Current Status:
echo   Backend Version: 2.7.3-SERVICES-REVERTED (OLD)
echo   Issue: Still queries "documents" table
echo   Fix: DEPLOY BACKEND TO RENDER
echo.
echo To Deploy:
echo   1. Go to: https://dashboard.render.com/
echo   2. Find: weddingbazaar-web service
echo   3. Click: "Manual Deploy"
echo   4. Select: "Deploy latest commit"
echo   5. Wait: 2-3 minutes for build
echo.
echo After Deploy:
echo   Run: .\VERIFY_DEPLOYMENT.ps1
echo.
echo ========================================
echo TROUBLESHOOTING
echo ========================================
echo.
echo If SQL verification fails:
echo   1. Check which step shows ❌
echo   2. Run the "QUICK FIX QUERIES" at bottom of script
echo   3. Re-run verification
echo.
echo If service creation still fails:
echo   1. Ensure backend is deployed (not 2.7.3-SERVICES-REVERTED)
echo   2. Check Render logs for "vendor_documents table ready"
echo   3. Test with browser console open (F12)
echo.
pause
