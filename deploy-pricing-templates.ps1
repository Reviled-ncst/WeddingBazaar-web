# =====================================================
# PRICING TEMPLATES MIGRATION DEPLOYMENT SCRIPT
# Wedding Bazaar Platform
# =====================================================

Write-Host "Starting Pricing Templates Migration Deployment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify prerequisites
Write-Host "Step 1: Verifying prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Node.js not found" -ForegroundColor Red
    exit 1
}

# Check .env file
if (Test-Path ".env") {
    Write-Host "   [OK] .env file found" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] .env file not found" -ForegroundColor Red
    exit 1
}

# Check migration scripts
$projectRoot = "c:\Games\WeddingBazaar-web"
$migrationFiles = @(
    "$projectRoot\backend-deploy\migrations\create-pricing-templates-tables.sql",
    "$projectRoot\backend-deploy\migrations\migrate-pricing-templates.cjs",
    "$projectRoot\backend-deploy\migrations\migrate-remaining-categories.cjs"
)

foreach ($file in $migrationFiles) {
    if (Test-Path $file) {
        Write-Host "   [OK] Found: $file" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Missing: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 2: Database Schema Creation
Write-Host "Step 2: Creating database schema..." -ForegroundColor Yellow
Write-Host "   MANUAL STEP REQUIRED:" -ForegroundColor Magenta
Write-Host "   1. Open Neon Console: https://console.neon.tech/" -ForegroundColor White
Write-Host "   2. Navigate to SQL Editor" -ForegroundColor White
Write-Host "   3. Copy and execute: backend-deploy\migrations\create-pricing-templates-tables.sql" -ForegroundColor White
Write-Host ""
$continue = Read-Host "   Have you completed the schema creation? (y/n)"

if ($continue -ne "y") {
    Write-Host "   Deployment paused. Please create schema first." -ForegroundColor Yellow
    exit 0
}

Write-Host "   [OK] Schema creation confirmed" -ForegroundColor Green
Write-Host ""

# Step 3: Migrate initial categories
Write-Host "Step 3: Migrating initial categories (Photography, Catering, Venue, Music)..." -ForegroundColor Yellow

Push-Location "$projectRoot\backend-deploy\migrations"
try {
    node migrate-pricing-templates.cjs
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Initial categories migrated successfully!" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "   [FAIL] Error during migration: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""

# Step 4: Migrate remaining categories
Write-Host "Step 4: Migrating remaining categories (11 service types)..." -ForegroundColor Yellow

Push-Location "$projectRoot\backend-deploy\migrations"
try {
    node migrate-remaining-categories.cjs
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] All remaining categories migrated successfully!" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "   [FAIL] Error during migration: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""

# Step 5: Final summary
Write-Host "================================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   * Database schema: Created" -ForegroundColor White
Write-Host "   * Initial categories: Migrated" -ForegroundColor White
Write-Host "   * Remaining categories: Migrated" -ForegroundColor White
Write-Host "   * Total templates: 49+" -ForegroundColor White
Write-Host "   * Total inclusions: 376+" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Verify data in Neon console" -ForegroundColor White
Write-Host "   2. Run verification queries: backend-deploy\migrations\verify-pricing-migration.sql" -ForegroundColor White
Write-Host "   3. Begin API development" -ForegroundColor White
Write-Host "   4. Update frontend to use new system" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "   * README: README_PRICING_MIGRATION.md" -ForegroundColor White
Write-Host "   * Full Docs: INDEX_PRICING_MIGRATION.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding!" -ForegroundColor Green
