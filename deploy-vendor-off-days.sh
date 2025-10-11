#!/bin/bash
# Deploy Vendor Off-Days API to Production
# This script deploys the updated backend with vendor off-days API endpoints

echo "🚀 DEPLOYING VENDOR OFF-DAYS API TO PRODUCTION"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "backend-deploy/index.js" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Check for syntax errors
echo "🔍 Checking JavaScript syntax..."
node -c backend-deploy/index.js
if [ $? -ne 0 ]; then
    echo "❌ Syntax errors found! Fix before deploying."
    exit 1
fi
echo "✅ Syntax check passed"

# Show what's being deployed
echo ""
echo "📋 DEPLOYMENT SUMMARY:"
echo "- File: backend-deploy/index.js"
echo "- New Endpoints Added: 5 vendor off-days routes"
echo "- Database: Uses existing vendor_off_days table"
echo "- Backend URL: https://weddingbazaar-web.onrender.com"

# Git operations
echo ""
echo "📦 Preparing deployment..."
git add backend-deploy/index.js
git add VENDOR_OFF_DAYS_API_INTEGRATION_COMPLETE.md
git commit -m "feat: Add vendor off-days API endpoints matching frontend expectations

- Added GET /api/vendors/:vendorId/off-days
- Added POST /api/vendors/:vendorId/off-days  
- Added POST /api/vendors/:vendorId/off-days/bulk
- Added DELETE /api/vendors/:vendorId/off-days/:offDayId
- Added GET /api/vendors/:vendorId/off-days/count
- Updated 404 handler documentation
- Ready for database-backed vendor availability storage"

echo "✅ Changes committed"

# Push to trigger deployment
echo ""
echo "🚀 Triggering deployment..."
git push origin main

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📍 NEXT STEPS:"
echo "1. Wait 2-3 minutes for Render deployment to complete"
echo "2. Test API: curl https://weddingbazaar-web.onrender.com/api/vendors/1/off-days"
echo "3. Frontend will automatically switch from localStorage to database"
echo "4. Check logs at https://dashboard.render.com"
echo ""
echo "🎉 Vendor off-days feature is now database-backed!"
