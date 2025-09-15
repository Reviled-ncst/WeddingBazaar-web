# Test registration with the local backend
$registrationData = @{
    firstName = "Jane"
    lastName = "Smith"
    email = "jane.smith.new@example.com"
    password = "test123"
    role = "couple"
    phone = "+63 9XX XXX XXXX"
} | ConvertTo-Json

Write-Host "Testing LOCAL registration with data: $registrationData"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -ContentType "application/json" -Body $registrationData
    Write-Host "Success: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody"
    }
}
