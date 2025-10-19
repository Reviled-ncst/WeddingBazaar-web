#!/usr/bin/env pwsh

# ============================================================================
# CATEGORY API TEST - Verify the Fix Works
# ============================================================================

Write-Host "🧪 Testing Category Service Fix" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$BACKEND_URL = "https://weddingbazaar-web.onrender.com"

Write-Host "📡 Testing backend endpoint..." -ForegroundColor Yellow
Write-Host "URL: $BACKEND_URL/api/categories" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/categories" -Method GET -ContentType "application/json"
    
    Write-Host "✅ API Response received!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Response Structure:" -ForegroundColor Cyan
    Write-Host "  success: $($response.success)" -ForegroundColor Gray
    Write-Host "  total: $($response.total)" -ForegroundColor Gray
    Write-Host "  categories: $($response.categories.GetType().Name)" -ForegroundColor Gray
    Write-Host "  categories.length: $($response.categories.Count)" -ForegroundColor Gray
    Write-Host ""
    
    if ($response.success -and $response.categories -and $response.categories.Count -gt 0) {
        Write-Host "🎉 SUCCESS! Categories loaded correctly!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📂 Found $($response.categories.Count) categories:" -ForegroundColor Cyan
        $response.categories | Select-Object -First 15 | ForEach-Object {
            Write-Host "  ✓ $($_.display_name) ($($_.name))" -ForegroundColor Gray
        }
        Write-Host ""
        
        Write-Host "🔍 Sample Category Structure:" -ForegroundColor Cyan
        $sample = $response.categories[0]
        Write-Host "  id: $($sample.id)" -ForegroundColor Gray
        Write-Host "  name: $($sample.name)" -ForegroundColor Gray
        Write-Host "  display_name: $($sample.display_name)" -ForegroundColor Gray
        Write-Host "  description: $($sample.description)" -ForegroundColor Gray
        Write-Host "  icon: $($sample.icon)" -ForegroundColor Gray
        Write-Host "  sort_order: $($sample.sort_order)" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "✅ VERIFICATION COMPLETE - Categories API Working!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Frontend Test Instructions:" -ForegroundColor Yellow
        Write-Host "1. Open: https://weddingbazaarph.web.app" -ForegroundColor White
        Write-Host "2. Login as vendor" -ForegroundColor White
        Write-Host "3. Go to Services → Add Service" -ForegroundColor White
        Write-Host "4. Open DevTools Console (F12)" -ForegroundColor White
        Write-Host "5. Look for:" -ForegroundColor White
        Write-Host "   ✓ '🔍 Raw API response: {success: true, total: 15...}'" -ForegroundColor Gray
        Write-Host "   ✓ '✅ Fetched 15 categories'" -ForegroundColor Gray
        Write-Host "   ✓ NO TypeError!" -ForegroundColor Gray
        Write-Host ""
        
    } else {
        Write-Host "❌ FAILED - Invalid response structure!" -ForegroundColor Red
        Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor DarkRed
    }
    
} catch {
    Write-Host "❌ FAILED - API call error!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor DarkRed
    Write-Host ""
    Write-Host "💡 Possible Issues:" -ForegroundColor Yellow
    Write-Host "  - Backend not deployed yet" -ForegroundColor Gray
    Write-Host "  - Category routes not registered" -ForegroundColor Gray
    Write-Host "  - Database migration not run" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
