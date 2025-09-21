#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting Wedding Bazaar Frontend Build..."

# Install dependencies
npm ci

# Build the frontend
npm run build:prod

echo "✅ Frontend build completed!"

# List build output
ls -la dist/
