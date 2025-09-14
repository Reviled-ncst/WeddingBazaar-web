# Wedding Bazaar Backend Deployment Guide

## 📋 Overview

This guide covers how to deploy the Wedding Bazaar backend API to Render.com. The backend provides authentication, vendor management, messaging, booking, and other core services for the Wedding Bazaar platform.

## 🏗️ Architecture

- **Backend Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon Database)
- **Hosting**: Render.com (Free/Paid tiers)
- **Authentication**: JWT tokens with in-memory storage
- **APIs**: RESTful endpoints for vendors, bookings, messaging, auth

## 📁 Project Structure

```
backend-deploy/
├── dist/                     # Compiled JavaScript (auto-generated)
├── index.ts                  # Main server file
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .env                     # Environment variables (local)
└── README.md               # This file
```

## 🚀 Deployment Steps

### 1. Prerequisites

- GitHub account with repository access
- Render.com account (free tier available)
- Neon Database account and connection string

### 2. Initial Setup on Render

1. **Go to [render.com](https://render.com)** and sign in
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository**:
   - Select: `Reviled-ncst/WeddingBazaar-web`
   - Branch: `main`
   - Root Directory: `backend-deploy`

4. **Configure Service**:
   ```
   Name: wedding-bazaar-backend
   Environment: Node
   Region: Oregon (or closest to your users)
   Branch: main
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

### 3. Environment Variables

In Render dashboard, add these environment variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://your_neon_database_url_here

# Server Configuration  
NODE_ENV=production
PORT=10000

# CORS Origins (comma-separated)
CORS_ORIGINS=https://your-frontend-domain.com,https://weddingbazaarph.web.app

# Authentication (optional - auto-generated if not provided)
JWT_SECRET=your-super-secret-jwt-key-here
```

**Important**: Replace `your_neon_database_url_here` with your actual Neon database URL.

### 4. Auto-Deploy Setup

Render automatically deploys when you push to the `main` branch. The deployment process:

1. **Detects Changes**: Render monitors your GitHub repository
2. **Builds Project**: Runs `npm install && npm run build`
3. **Starts Server**: Executes `npm start` (runs compiled JavaScript)
4. **Health Check**: Verifies `/api/health` endpoint responds

## 🔧 Local Development

### Setup

```bash
# Navigate to backend directory
cd backend-deploy

# Install dependencies
npm install

# Create local .env file
cp .env.example .env

# Edit .env with your database URL
nano .env

# Build TypeScript
npm run build

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production server (compiled)
npm run dev      # Run development server with ts-node
```

## 🌐 API Endpoints

### Health & Status
- `GET /api/health` - Server health check
- `GET /api/test-db` - Database connectivity test

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Token verification
- `GET /api/auth/verify` - Token verification (GET method)
- `POST /api/auth/logout` - Logout and invalidate token

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/featured` - Featured vendors
- `GET /api/vendors/categories` - Vendor categories
- `GET /api/vendors/user/:userId/profile` - Get vendor profile
- `GET /api/vendor-profiles` - Vendor profiles with filtering

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Bookings
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get specific booking
- `GET /api/bookings/stats` - Booking statistics

### Messaging
- `GET /api/messaging/conversations/:vendorId` - Get vendor conversations
- `POST /api/messaging/conversations` - Create conversation
- `GET /api/messaging/conversations/:id/messages` - Get messages
- `POST /api/messaging/conversations/:id/messages` - Send message

### Subscriptions
- `GET /api/subscriptions/vendor/:vendorId` - Vendor subscription
- `GET /api/subscriptions/plans` - Available plans

## 🔐 Authentication System

The backend uses JWT tokens with the following features:

### Token Management
- **Storage**: In-memory Map (production should use Redis)
- **Expiration**: 24 hours
- **Auto-cleanup**: Expired tokens removed hourly
- **Multi-format Support**: Authorization header or request body

### Auth Flow
1. **Login**: User provides credentials → Server validates → JWT token generated
2. **Storage**: Token stored in memory with user metadata
3. **Verification**: Each protected request validates token
4. **Expiration**: Tokens auto-expire after 24 hours

### Public Access Handling
- **Homepage**: No authentication required
- **Public APIs**: Graceful handling of missing tokens
- **Auth Verification**: Returns `200` with `authenticated: false` for public users

## 🗄️ Database Integration

### Neon Database Setup
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to Render environment variables

### Key Tables
- **users**: User accounts and authentication
- **vendors**: Vendor business information  
- **vendor_profiles**: Detailed vendor profiles
- **conversations**: Messaging conversations
- **messages**: Individual messages
- **bookings**: Service bookings
- **services**: Vendor services

## 🚨 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
Error: Cannot find module 'typescript'
```
**Solution**: Ensure TypeScript is in dependencies, not devDependencies

**2. Database Connection Errors**
```bash
Error: Connection timeout
```
**Solution**: 
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure IP whitelist allows Render servers

**3. CORS Errors**
```bash
Access-Control-Allow-Origin error
```
**Solution**: Add frontend domain to CORS_ORIGINS environment variable

**4. 401 Authentication Errors on Homepage**
```bash
POST /api/auth/verify 401 (Unauthorized)
```
**Solution**: This should be fixed with latest deployment. Verify auth endpoints return 200 for missing tokens.

### Debug Steps

1. **Check Logs**: View Render deployment logs
2. **Test Health**: Visit `https://your-backend.onrender.com/api/health`
3. **Database Test**: Visit `https://your-backend.onrender.com/api/test-db`
4. **Environment**: Verify all required environment variables are set

## 📊 Monitoring & Logs

### Render Dashboard
- **Deployments**: View build and deployment history
- **Logs**: Real-time server logs
- **Metrics**: CPU, memory, and request metrics
- **Events**: Deploy and server events

### Health Monitoring
```bash
# Health check endpoint
curl https://wedding-bazaar-backend.onrender.com/api/health

# Expected response
{
  "status": "ok",
  "message": "Wedding Bazaar API is running",
  "timestamp": "2025-09-13T..."
}
```

## 🔄 CI/CD Pipeline

### Automatic Deployment
1. **Push to Main**: Any commit to `main` branch triggers deployment
2. **Build Process**: Render runs `npm install && npm run build`
3. **Health Check**: Verifies server starts successfully
4. **DNS Update**: Updates live URL to new deployment

### Manual Deployment
1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy"
4. Select branch/commit
5. Click "Deploy"

## 🔧 Configuration Management

### Environment Variables Management
```bash
# Production (Render Dashboard)
DATABASE_URL=postgresql://...
NODE_ENV=production
CORS_ORIGINS=https://domain1.com,https://domain2.com

# Development (.env file)
DATABASE_URL=postgresql://localhost...
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Security Best Practices
- Never commit `.env` files
- Use strong JWT secrets
- Regularly rotate database passwords
- Monitor access logs
- Enable HTTPS only

## 📈 Scaling Considerations

### Free Tier Limitations
- **Sleep Mode**: Free services sleep after 15 minutes of inactivity
- **Cold Start**: First request after sleep takes 50+ seconds
- **Monthly Hours**: 750 hours per month

### Paid Tier Benefits
- **Always On**: No sleep mode
- **Better Performance**: More CPU and memory
- **Custom Domains**: Use your own domain
- **SSL Certificates**: Automatic HTTPS

## 🔗 Related Resources

- **Frontend Repository**: Main Wedding Bazaar web application
- **Database Schema**: Check `DATABASE_SCHEMA_DOCUMENTATION.md`
- **API Documentation**: See endpoint comments in `index.ts`
- **Neon Database**: [console.neon.tech](https://console.neon.tech)
- **Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review Render logs
3. Test database connectivity
4. Verify environment variables
5. Contact support if needed

---

**Last Updated**: September 13, 2025  
**Backend Version**: 1.0.0  
**Deployment URL**: https://wedding-bazaar-backend.onrender.com
