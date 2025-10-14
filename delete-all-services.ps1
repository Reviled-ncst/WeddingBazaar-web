# PowerShell script to delete all services from the Wedding Bazaar database
# WARNING: This will permanently delete all services data!

$API_BASE_URL = "https://weddingbazaar-web.onrender.com/api"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Delete-AllServices {
    Write-ColorText "🗑️ Starting deletion of all services..." "Yellow"
    Write-ColorText "⚠️ WARNING: This will permanently delete ALL services from the database!" "Red"
    
    try {
        # First, get all services to see what we're deleting
        Write-ColorText "📊 Fetching current services..." "Cyan"
        $getResponse = Invoke-RestMethod -Uri "$API_BASE_URL/services" -Method GET
        
        $services = @()
        if ($getResponse.services) {
            $services = $getResponse.services
        } elseif ($getResponse -is [array]) {
            $services = $getResponse
        }
        
        Write-ColorText "📋 Found $($services.Count) services to delete" "White"
        
        if ($services.Count -eq 0) {
            Write-ColorText "✅ No services found. Database is already empty." "Green"
            return
        }
        
        # List some services for confirmation
        Write-ColorText "📝 Sample services that will be deleted:" "Yellow"
        for ($i = 0; $i -lt [Math]::Min(5, $services.Count); $i++) {
            $service = $services[$i]
            $title = if ($service.title) { $service.title } elseif ($service.name) { $service.name } else { $service.id }
            Write-ColorText "   $($i + 1). $title (ID: $($service.id))" "Gray"
        }
        
        if ($services.Count -gt 5) {
            Write-ColorText "   ... and $($services.Count - 5) more services" "Gray"
        }
        
        # Check if there's a bulk delete endpoint
        Write-ColorText "`n🔄 Attempting bulk delete..." "Cyan"
        
        try {
            $bulkDeleteResponse = Invoke-RestMethod -Uri "$API_BASE_URL/services" -Method DELETE -ContentType "application/json"
            Write-ColorText "✅ Bulk delete successful!" "Green"
            Write-ColorText "📊 Result: $($bulkDeleteResponse | ConvertTo-Json -Depth 2)" "White"
            return
        } catch {
            Write-ColorText "⚠️ Bulk delete not available, trying individual deletion..." "Yellow"
            Write-ColorText "Error: $($_.Exception.Message)" "Red"
        }
        
        # If bulk delete doesn't work, delete individually
        $deletedCount = 0
        $errorCount = 0
        
        foreach ($service in $services) {
            try {
                $deleteResponse = Invoke-RestMethod -Uri "$API_BASE_URL/services/$($service.id)" -Method DELETE -ContentType "application/json"
                $deletedCount++
                $title = if ($service.title) { $service.title } else { $service.id }
                Write-ColorText "✅ Deleted service: $title ($deletedCount/$($services.Count))" "Green"
                
                # Small delay to avoid overwhelming the server
                Start-Sleep -Milliseconds 100
                
            } catch {
                $errorCount++
                $title = if ($service.title) { $service.title } else { $service.id }
                Write-ColorText "❌ Failed to delete service: $title - $($_.Exception.Message)" "Red"
            }
        }
        
        Write-ColorText "`n📊 DELETION SUMMARY:" "Yellow"
        Write-ColorText "✅ Successfully deleted: $deletedCount services" "Green"
        Write-ColorText "❌ Failed to delete: $errorCount services" "Red"
        Write-ColorText "📊 Total processed: $($deletedCount + $errorCount) services" "White"
        
    } catch {
        Write-ColorText "❌ Error during deletion process: $($_.Exception.Message)" "Red"
    }
}

function Check-AvailableEndpoints {
    try {
        Write-ColorText "🔍 Checking available endpoints..." "Cyan"
        $healthResponse = Invoke-RestMethod -Uri "$API_BASE_URL/health" -Method GET
        
        Write-ColorText "📋 Available endpoints:" "White"
        $healthResponse.endpoints.PSObject.Properties | ForEach-Object {
            Write-ColorText "   $($_.Name): $($_.Value)" "Gray"
        }
    } catch {
        Write-ColorText "⚠️ Could not check endpoints: $($_.Exception.Message)" "Yellow"
    }
}

function Confirm-AndDelete {
    Write-ColorText "🚨 DANGER: This will delete ALL services from the database!" "Red"
    Write-ColorText "🚨 This action cannot be undone!" "Red"
    Write-ColorText ""
    
    $confirmation = Read-Host "Type 'DELETE ALL SERVICES' to confirm (or press Enter to cancel)"
    
    if ($confirmation -eq "DELETE ALL SERVICES") {
        Write-ColorText "🚀 Starting deletion process...`n" "Yellow"
        Delete-AllServices
    } else {
        Write-ColorText "❌ Deletion cancelled." "Yellow"
    }
}

# Main execution
Write-ColorText "🏥 Wedding Bazaar - Service Deletion Tool" "Magenta"
Write-ColorText "=" * 50 "Magenta"

Check-AvailableEndpoints
Write-Host ""
Confirm-AndDelete

Write-ColorText "`n✅ Script completed." "Green"
