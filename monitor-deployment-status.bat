@echo off
echo 🔄 Monitoring Render deployment...
echo.
echo Checking every 15 seconds until status changes to "completed"
echo Press Ctrl+C to stop monitoring
echo.

:loop
node check-api-booking-status-detailed.mjs | findstr /C:"Status: completed"
if %errorlevel% equ 0 (
    echo.
    echo ✅ DEPLOYMENT SUCCESSFUL!
    echo The API now returns "completed" status.
    echo.
    echo 🎉 Two-sided completion system is FULLY OPERATIONAL!
    echo.
    echo Next steps:
    echo 1. Refresh your browser (Ctrl+Shift+R)
    echo 2. Navigate to Individual -^> Bookings
    echo 3. Verify "Completed ✓" badge appears
    echo.
    pause
    exit /b 0
)

echo [%time%] Deployment not ready yet, waiting 15 seconds...
timeout /t 15 /nobreak >nul
goto loop
