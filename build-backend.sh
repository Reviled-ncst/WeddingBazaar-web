#!/bin/bash

# Build script for backend deployment
echo "🔨 Building Wedding Bazaar Backend for deployment..."

# Create backend directory structure
mkdir -p backend-deploy
cd backend-deploy

# Copy backend package.json
cp ../backend-package.json package.json

# Copy TypeScript config
cp ../tsconfig.backend.json tsconfig.json

# Copy server files
cp -r ../server .

# Create dist directory
mkdir -p dist

echo "✅ Backend deployment package created in backend-deploy/"
echo "📋 Next steps:"
echo "1. Upload this folder to your deployment platform"
echo "2. Set environment variables:"
echo "   - DATABASE_URL (Neon PostgreSQL URL)"
echo "   - JWT_SECRET"
echo "   - NODE_ENV=production"
echo "   - FRONTEND_URL=https://weddingbazaarph.web.app"
echo "3. Run: npm install && npm run build && npm start"
