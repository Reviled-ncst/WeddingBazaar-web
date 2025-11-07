# Check Recent Render Logs for Error Details
Write-Host "=== CHECKING RENDER LOGS FOR SERVICE CREATION ERRORS ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "To check Render logs manually:" -ForegroundColor Yellow
Write-Host "1. Go to: https://dashboard.render.com/web/srv-ct7sgrm3esus73b4ptng/logs" -ForegroundColor White
Write-Host "2. Look for the most recent POST /api/services request" -ForegroundColor White
Write-Host "3. Check for '❌ ERROR creating service' with detailed error info" -ForegroundColor White
Write-Host ""

Write-Host "Expected error format:" -ForegroundColor Yellow
Write-Host "  - Error Code: XXXXX" -ForegroundColor White
Write-Host "  - Error Constraint: constraint_name" -ForegroundColor White
Write-Host "  - Error Detail: detailed message" -ForegroundColor White
Write-Host "  - Full Error Object: { ... }" -ForegroundColor White
Write-Host ""

Write-Host "Once you have the error details, we can identify and fix the exact issue!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to open Render logs in browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://dashboard.render.com/web/srv-ct7sgrm3esus73b4ptng/logs"
