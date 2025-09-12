# Deployment Guide - Wedding Bazaar

## Production Environment Setup

### 1. Railway Deployment

#### Prerequisites
- Railway account (https://railway.app)
- Git repository with your code
- Neon PostgreSQL database set up

#### Environment Variables Setup

In your Railway project dashboard, set these environment variables:

```bash
# Database (from your Neon dashboard)
DATABASE_URL=postgresql://weddingbazaar_owner:your_actual_password@ep-rough-boat-a1b2c3d4.ap-southeast-1.aws.neon.tech/weddingbazaar?sslmode=require

# Environment
NODE_ENV=production
PORT=3000

# Security (Generate strong random strings)
JWT_SECRET=your-production-jwt-secret-min-32-chars
BCRYPT_ROUNDS=12
SESSION_SECRET=your-production-session-secret-min-32-chars

# CORS (Update with your actual domains)
CORS_ORIGINS=https://your-domain.com,https://your-railway-app.railway.app

# Frontend API URL (Will be your Railway app URL)
VITE_API_URL=https://your-railway-app.railway.app/api

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_MAX_AGE=86400000
```

#### Deployment Steps

1. **Connect Repository to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   ```

2. **Deploy to Railway**
   ```bash
   # Deploy using Railway CLI
   railway up
   
   # Or use npm script
   npm run deploy:railway
   ```

3. **Initialize Database**
   ```bash
   # After deployment, initialize the database
   npm run db:init:prod
   
   # Or manually curl your Railway app
   curl -X POST https://your-railway-app.railway.app/api/admin/init-db
   ```

### 2. Local Production Testing

```bash
# Build the project
npm run build:full

# Set production environment
export NODE_ENV=production

# Start production server
npm run start:prod
```

### 3. Environment Variables Guide

#### Development (.env)
```bash
DATABASE_URL=postgresql://username:password@localhost/weddingbazaar_dev
NODE_ENV=development
PORT=3000
JWT_SECRET=dev-secret-key
VITE_API_URL=http://localhost:3000/api
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Production (Railway Environment Variables)
- Use the `.env.production` file as a reference
- Never commit production secrets to version control
- Use Railway's environment variable interface

### 4. Database Migration Strategy

For production database updates:

1. **Schema Changes**
   ```sql
   -- Create migration files in backend/database/migrations/
   -- Example: 001_add_user_roles.sql
   ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'customer';
   ```

2. **Run Migrations**
   ```bash
   # Add migration endpoint to server/index.ts
   curl -X POST https://your-app.railway.app/api/admin/migrate
   ```

### 5. Monitoring and Logging

#### Health Checks
- Endpoint: `https://your-app.railway.app/api/health`
- Railway automatically monitors this endpoint

#### Logging
```typescript
// In production, logs are captured by Railway
console.log('Application started on port', PORT);
console.error('Database connection failed:', error);
```

### 6. Security Checklist

- [ ] Strong JWT secrets (min 32 characters)
- [ ] HTTPS only in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables secure
- [ ] Database connection uses SSL
- [ ] File upload restrictions
- [ ] Input validation on all endpoints

### 7. Performance Optimization

#### Frontend
```bash
# Build optimized bundle
npm run build

# Analyze bundle size
npx vite-bundle-analyzer dist
```

#### Backend
- Use connection pooling for database
- Implement caching for frequent queries
- Optimize API endpoints

### 8. Custom Domain Setup (Optional)

1. **Railway Custom Domain**
   - Go to Railway project settings
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Environment Variables**
   ```bash
   CORS_ORIGINS=https://yourdomain.com
   VITE_API_URL=https://yourdomain.com/api
   ```

### 9. Backup Strategy

#### Database Backups
- Neon provides automatic backups
- Consider additional backup strategy for critical data

#### Code Backups
- Use Git with multiple remotes
- Consider automated deployment from main branch

### 10. Troubleshooting

#### Common Issues
1. **Database Connection Fails**
   - Check DATABASE_URL format
   - Verify Neon database is running
   - Check SSL requirements

2. **CORS Errors**
   - Verify CORS_ORIGINS environment variable
   - Check frontend VITE_API_URL

3. **Build Failures**
   - Check TypeScript compilation
   - Verify all dependencies are installed
   - Check build logs in Railway

#### Debug Commands
```bash
# Check environment variables
railway variables

# View logs
railway logs

# Connect to database
railway connect
```

## Next Steps

1. Deploy to Railway and test all endpoints
2. Set up monitoring and alerting
3. Configure automatic deployments from Git
4. Implement CI/CD pipeline
5. Add performance monitoring
6. Set up error tracking (e.g., Sentry)
