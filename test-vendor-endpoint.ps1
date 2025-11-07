#!/usr/bin/env pwsh
# Direct test of the failing vendor services endpoint

$vendorId = "2-2025-003"
$url = "https://weddingbazaar-web.onrender.com/api/services/vendor/$vendorId"

Write-Host "`nTesting vendor services endpoint..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
    Write-Host "`n SUCCESS!" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Services found: $($data.services.Count)" -ForegroundColor Green
    
} catch {
    Write-Host "`nERROR: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "`nError Response Body:" -ForegroundColor Yellow
        Write-Host $errorBody -ForegroundColor Gray
    }
}
