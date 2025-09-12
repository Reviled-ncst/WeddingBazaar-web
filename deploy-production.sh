#!/bin/bash
# Deployment script for Wedding Bazaar
# Firebase Frontend + Railway Backend

echo "🚀 Starting Wedding Bazaar Deployment"
echo "Frontend: Firebase Hosting"
echo "Backend: Railway"

# Build the frontend with production environment variables
echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Firebase Hosting
    echo "🔥 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "🎉 Frontend deployment successful!"
        echo "🌐 Frontend URL: https://weddingbazaarph.web.app"
        echo "🔗 Backend URL: https://romantic-empathy-production.up.railway.app"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Update Railway environment variables to include Firebase URL in CORS_ORIGINS"
        echo "2. Test login and API functionality"
        echo "3. Update PayMongo keys for production if needed"
    else
        echo "❌ Firebase deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
