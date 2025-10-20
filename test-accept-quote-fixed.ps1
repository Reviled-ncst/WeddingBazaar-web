Write-Host "`n🧪 Testing Fixed Accept Quote Endpoint..." -ForegroundColor Cyan
Write-Host "Waiting for deployment to complete...`n" -ForegroundColor Yellow

Start-Sleep -Seconds 60

$bookingId = "1760918159"
$url = "https://weddingbazaar-web.onrender.com/api/bookings/$bookingId/accept-quote"

$body = @{
    acceptance_notes = "Quote accepted - testing after constraint fix!"
} | ConvertTo-Json

Write-Host "📡 Testing: PATCH $url" -ForegroundColor Yellow
Write-Host "Body: $body`n" -ForegroundColor Gray

try
{
    $response = Invoke-RestMethod -Uri $url -Method PATCH -ContentType "application/json" -Body $body -ErrorAction Stop
    
    Write-Host "✅ SUCCESS! Accept Quote is Working!" -ForegroundColor Green
    Write-Host "`n📊 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    Write-Host "`n🎉 Status: $($response.booking.status)" -ForegroundColor Green
    Write-Host "✅ Message: $($response.message)" -ForegroundColor Green
}
catch
{
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    try
    {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Error Details:" -ForegroundColor Red
        Write-Host $errorBody
    }
    catch
    {
        Write-Host "Could not read error details"
    }
}

Write-Host "`n✅ Test Complete`n" -ForegroundColor Cyan
