# Build script with Firebase and Cloudinary environment variables
$env:VITE_FIREBASE_API_KEY = "AIzaSyBrrGVT9tyka4l2Jsph0VJVmjw5OmLXqI0"
$env:VITE_FIREBASE_AUTH_DOMAIN = "weddingbazaarph.firebaseapp.com"
$env:VITE_FIREBASE_PROJECT_ID = "weddingbazaarph"
$env:VITE_FIREBASE_STORAGE_BUCKET = "weddingbazaarph.firebasestorage.app"
$env:VITE_FIREBASE_MESSAGING_SENDER_ID = "543533138006"
$env:VITE_FIREBASE_APP_ID = "1:543533138006:web:74fb6ac8ebab6c11f3fbf7"
$env:VITE_API_URL = "https://weddingbazaar-web.onrender.com"
$env:VITE_CLOUDINARY_CLOUD_NAME = "dht64xt1g"
$env:VITE_CLOUDINARY_UPLOAD_PRESET = "weddingbazaarus"

Write-Host "Building with Firebase and Cloudinary configuration..." -ForegroundColor Cyan
npx vite build

Write-Host "Build complete!" -ForegroundColor Green
