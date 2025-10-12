#!/bin/bash

echo "🚀 Starting Wedding Bazaar Local Backend..."
echo "📍 This will start the backend on http://localhost:3001"
echo ""

echo "📁 Changing to backend directory..."
cd "backend-deploy"

echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

echo "🔄 Starting server..."
echo "⚡ Backend will be available at: http://localhost:3001"
echo "🌐 Frontend should then load bookings successfully"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
