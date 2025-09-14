# Wedding Bazaar Backend Deployment Instructions

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Render Deployment](#render-deployment)
4. [Database Configuration](#database-configuration)
5. [Testing Deployment](#testing-deployment)
6. [Environment Variables](#environment-variables)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [CI/CD Pipeline](#cicd-pipeline)

## Prerequisites

### Required Accounts
- **GitHub Account**: For repository hosting and version control
- **Render Account**: For backend hosting (free tier available)
- **Neon Account**: For PostgreSQL database hosting (free tier available)

### Development Environment
- Node.js 18+ installed
- Git installed and configured
- TypeScript knowledge
- PostgreSQL client (optional, for local testing)

## Environment Setup

### 1. Repository Structure
Ensure your repository has the following structure:
```
wedding-bazaar-backend/
├── index.ts              # Main server file
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment template
├── dist/                 # Compiled JavaScript (generated)
├── scripts/              # Database and utility scripts
└── README.md            # Project documentation
```

### 2. Package.json Configuration
Your `package.json` should include:
```json
{
  "name": "wedding-bazaar-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node index.ts",
    "postinstall": "npm run build"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/pg": "^8.10.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/bcryptjs": "^2.4.2",
    "@types/multer": "^1.4.7",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1"
  }
}
```

### 3. TypeScript Configuration
Ensure `tsconfig.json` is properly configured:
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## Render Deployment

### Step 1: Create Render Service

1. **Login to Render**
   - Visit [render.com](https://render.com)
   - Sign in with GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the backend repository

3. **Configure Service Settings**
   ```
   Name: wedding-bazaar-backend
   Environment: Node
   Region: Oregon (or closest to your users)
   Branch: main
   Root Directory: (leave empty if backend is in root)
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Set Instance Type**
   - Free tier: 512 MB RAM, 0.1 CPU
   - Paid tiers available for production scaling

### Step 2: Environment Variables Setup

In Render dashboard, add the following environment variables:

#### Required Variables
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Optional Variables
```env
LOG_LEVEL=info
API_RATE_LIMIT=100
SESSION_TIMEOUT=3600
UPLOAD_MAX_SIZE=5242880
```

### Step 3: Database Connection

#### Using Neon Database
1. **Create Neon Project**
   - Visit [neon.tech](https://neon.tech)
   - Create new project
   - Note the connection string

2. **Set Database URL**
   ```env
   DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require
   ```

3. **Test Connection**
   - Use provided connection details
   - Ensure SSL mode is enabled

## Database Configuration

### Schema Setup
Ensure your database has the required tables:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    phone VARCHAR(20),
    website VARCHAR(255),
    location VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    vendor_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id),
    sender_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    vendor_id INTEGER REFERENCES vendors(id),
    service_id INTEGER REFERENCES services(id),
    booking_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Migration Scripts

Create migration scripts in your repository:

```javascript
// scripts/migrate-database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  try {
    // Add your migration queries here
    console.log('Running database migrations...');
    
    // Example: Add missing columns
    await pool.query(`
      ALTER TABLE vendors 
      ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255);
    `);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

runMigrations();
```

## Testing Deployment

### 1. Health Check Endpoint
Ensure your backend has a health check:

```typescript
// In your index.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

### 2. Test Deployment
After deployment, test the following endpoints:

```bash
# Health check
curl https://your-backend-url.render.com/health

# Authentication
curl -X POST https://your-backend-url.render.com/api/auth/verify \
  -H "Content-Type: application/json"

# Vendors endpoint
curl https://your-backend-url.render.com/api/vendors

# Services endpoint
curl https://your-backend-url.render.com/api/services
```

### 3. Frontend Integration
Update your frontend environment variables:

```env
# Frontend .env
VITE_API_BASE_URL=https://your-backend-url.render.com
VITE_WS_URL=wss://your-backend-url.render.com
```

## Environment Variables

### Production Environment Variables

#### Required for Render
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
JWT_SECRET=your-256-bit-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Optional Configuration
```env
# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
BCRYPT_ROUNDS=12
JWT_EXPIRY=24h
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# File Upload
UPLOAD_MAX_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Database
DB_POOL_SIZE=20
DB_TIMEOUT=30000

# External Services
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...
```

### Environment Variable Security

1. **Never commit `.env` files**
2. **Use strong secrets** (256-bit for JWT)
3. **Rotate secrets** regularly
4. **Use different values** for development/production

## Monitoring & Maintenance

### 1. Render Dashboard Monitoring

Monitor the following metrics in Render dashboard:
- **CPU Usage**: Should stay below 80%
- **Memory Usage**: Monitor for memory leaks
- **Response Time**: Track API performance
- **Error Rate**: Monitor 4xx/5xx errors

### 2. Application Logs

Access logs via Render dashboard or CLI:
```bash
# Install Render CLI
npm install -g @render.com/cli

# View logs
render logs --service-id=your-service-id --tail
```

### 3. Database Monitoring

Monitor database performance:
- **Connection Pool**: Track active connections
- **Query Performance**: Monitor slow queries
- **Storage Usage**: Track database size growth

### 4. Health Checks

Set up automated health checks:
```typescript
// Enhanced health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbResult.rows.length > 0 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures
```bash
# Check TypeScript compilation
npm run build

# Check for missing dependencies
npm install

# Verify tsconfig.json
npx tsc --noEmit
```

#### 2. Database Connection Issues
```bash
# Test database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(res => console.log(res.rows)).catch(console.error);
"
```

#### 3. Environment Variable Issues
```bash
# Check environment variables in Render
# Ensure no typos in variable names
# Verify DATABASE_URL format
```

#### 4. CORS Issues
```typescript
// Update CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### 5. Memory Issues
```typescript
// Add memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100 + ' MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100 + ' MB'
  });
}, 30000);
```

### Debug Commands

```bash
# Check service status
curl -I https://your-backend-url.render.com/health

# Test specific endpoints
curl -X GET https://your-backend-url.render.com/api/vendors \
  -H "Authorization: Bearer your-jwt-token"

# Check database connectivity
curl https://your-backend-url.render.com/api/health

# Monitor real-time logs
render logs --service-id=your-service-id --tail
```

## CI/CD Pipeline

### Automatic Deployment

Render automatically deploys when you push to the connected branch:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```

2. **Render automatically**:
   - Pulls latest code
   - Runs `npm install`
   - Runs `npm run build`
   - Starts with `npm start`

### Manual Deployment

```bash
# Manual deployment via Render dashboard
# Click "Manual Deploy" → "Deploy latest commit"

# Or use Render CLI
render deploy --service-id=your-service-id
```

### Rollback Process

```bash
# Via Render dashboard
# Go to "Deploys" tab
# Click "Rollback" on previous successful deployment

# Or redeploy specific commit
git revert HEAD
git push origin main
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] Dependencies updated
- [ ] TypeScript compilation successful
- [ ] No sensitive data in code

### Post-Deployment
- [ ] Health check endpoint responding
- [ ] Database connections working
- [ ] API endpoints functional
- [ ] CORS configured correctly
- [ ] Logs monitoring set up
- [ ] Frontend integration tested
- [ ] Error handling verified

### Production Readiness
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Error logging set up
- [ ] Performance monitoring active
- [ ] Backup strategy in place
- [ ] Incident response plan ready

## Support and Resources

### Documentation Links
- [Render Documentation](https://render.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Express.js Guide](https://expressjs.com/en/guide)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Community Support
- [Render Community](https://community.render.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/render.com)
- [GitHub Issues](https://github.com/your-repo/issues)

### Monitoring Tools
- [Render Metrics Dashboard](https://dashboard.render.com)
- [Neon Console](https://console.neon.tech)
- [LogRocket](https://logrocket.com) (optional)
- [Sentry](https://sentry.io) (optional)

---

**Last Updated**: September 13, 2025  
**Version**: 1.0  
**Maintainer**: Wedding Bazaar Development Team
