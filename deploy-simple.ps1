# Simple deployment script
Write-Host "Building project..." -ForegroundColor Green
npm run build

Write-Host ""
Write-Host "Deploying to Firebase..." -ForegroundColor Green
firebase deploy --only hosting

Write-Host ""
Write-Host "Done! Check START_HERE.md for testing instructions." -ForegroundColor Yellow
