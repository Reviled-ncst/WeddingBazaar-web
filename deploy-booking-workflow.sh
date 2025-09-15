#!/bin/bash

# Wedding Bazaar - Deploy Booking Interaction Endpoints
# This script deploys the new interactive booking workflow endpoints

echo "🚀 Deploying Wedding Bazaar Booking Interaction Endpoints..."

# Add the updated server files
echo "📦 Staging files for deployment..."
git add server/index.ts
git add booking-workflow-demo.md
git add src/pages/users/individual/bookings/components/BookingDetailsModal.tsx
git add src/pages/users/vendor/bookings/VendorBookings.tsx
git add src/shared/components/booking/BookingWorkflow.tsx

# Commit the changes
echo "💾 Committing booking workflow integration..."
git commit -m "🎊 COMPLETE: Interactive Booking Workflow Integration

✅ Added 12 new booking interaction endpoints:
   - Quote management (send, accept, reject, revise)
   - Payment processing (downpayment, installments, final)
   - Status management (confirm, progress, delivery, completion)
   - Communication (interactions, reviews, cancellation)

✅ Integrated BookingWorkflow component into:
   - Individual Bookings page with interactive timeline
   - Vendor Bookings page with action management
   - Tab-based UI for Details, Workflow, and Actions

✅ Features working:
   - Real-time status tracking
   - Role-based workflow management  
   - Quote submission and response
   - Payment processing integration
   - Service delivery tracking

🎯 Ready for full production demonstration!"

# Push to main branch (triggers automatic deployment on Render)
echo "🚀 Pushing to production..."
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo "🔗 Production URL: https://weddingbazaar-web.onrender.com"
echo "📊 Monitor deployment: https://dashboard.render.com"
echo ""
echo "🎉 New endpoints will be available at:"
echo "   POST /api/bookings/{id}/send-quote"
echo "   POST /api/bookings/{id}/accept-quote"
echo "   POST /api/bookings/{id}/payment"
echo "   POST /api/bookings/{id}/confirm"
echo "   ... and 8 more interaction endpoints"
echo ""
echo "⏱️  Deployment typically takes 2-3 minutes"
echo "🎯 Ready for full booking workflow demonstration!"
