# Neon PostgreSQL Setup Guide

## 🚀 Getting Started with Neon Database

### Step 1: Create a Neon Account
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up with GitHub, Google, or email
3. Create a new project

### Step 2: Get Your Connection String
1. In your Neon dashboard, click on your project
2. Go to "Connection Details"
3. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update your `.env` file with your actual Neon connection string:
   ```env
   DATABASE_URL="postgresql://your-username:your-password@your-endpoint.neon.tech/your-database?sslmode=require"
   ```

### Step 4: Install Dependencies (Already Done)
```bash
npm install @neondatabase/serverless pg @types/pg dotenv
```

### Step 5: Initialize Database Tables
1. Start the backend server:
   ```bash
   npm run dev:backend
   ```

2. Initialize the database tables:
   ```bash
   npm run db:init
   ```
   Or manually visit: `http://localhost:3000/api/admin/init-db` (POST request)

### Step 6: Test the Connection
Visit `http://localhost:3000/api/health` to verify everything is working.

## 🏗️ Database Schema

### Tables Created:
- **users** - User accounts (couples, vendors, admins)
- **vendors** - Vendor business profiles
- **bookings** - Wedding service bookings
- **reviews** - Vendor reviews and ratings
- **messages** - In-app messaging system

### Key Features:
- UUID primary keys for security
- Automatic timestamps
- Referential integrity with foreign keys
- JSON/Array support for complex data
- Optimized indexes for performance

## 🔌 API Endpoints

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors?category=photography` - Filter by category
- `GET /api/vendors?search=wedding` - Search vendors
- `GET /api/vendors/:id` - Get specific vendor
- `POST /api/vendors` - Create new vendor

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking

### Health Check
- `GET /api/health` - Server and database status

## 🌟 Neon Advantages

### Serverless & Auto-scaling
- Scales to zero when not in use
- Automatically handles traffic spikes
- Pay only for what you use

### Built-in Features
- Connection pooling
- Read replicas
- Point-in-time recovery
- Branch databases for development

### Developer Experience
- Instant provisioning
- Web-based SQL editor
- Metrics and monitoring
- GitHub integration

## 🔧 Development Workflow

### Local Development
```bash
# Start both frontend and backend
npm run dev:full

# Frontend only
npm run dev

# Backend only
npm run dev:backend
```

### Database Operations
```bash
# Initialize tables (development only)
npm run db:init

# Check health
curl http://localhost:3000/api/health
```

### Production Deployment
```bash
# Build the application
npm run build
npm run build:backend

# Start production server
npm run start:backend
```

## 🛡️ Security Features

### Environment Variables
- Database credentials in `.env` (not committed)
- JWT secrets for authentication
- API keys for external services

### Database Security
- SSL connections required
- UUID primary keys (harder to guess)
- Input validation and sanitization
- Prepared statements (Neon's template literals)

### API Security
- CORS configuration
- Helmet.js for security headers
- Rate limiting (can be added)
- Authentication middleware (to be implemented)

## 📊 Monitoring & Debugging

### Logs
- Structured logging with Morgan
- Database query logging
- Error tracking and reporting

### Health Checks
- Database connectivity
- Server status
- Environment information

### Development Tools
- Nodemon for auto-restart
- TypeScript for type safety
- ESLint for code quality

## 🚧 Next Steps

### Authentication System
- User registration/login
- JWT token management
- Role-based permissions

### Advanced Features
- Real-time messaging with WebSockets
- File uploads to cloud storage
- Email notifications
- Payment processing integration

### Performance Optimization
- Query optimization
- Caching with Redis
- CDN for static assets
- Database connection pooling

## 🆘 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your DATABASE_URL in `.env`
   - Ensure your Neon database is active
   - Verify network connectivity

2. **Table Creation Failed**
   - Check database permissions
   - Ensure the database exists
   - Review error logs

3. **TypeScript Errors**
   - Run `npm install` to ensure all types are installed
   - Check import paths
   - Verify environment variables

### Getting Help
- [Neon Documentation](https://neon.tech/docs)
- [Neon Discord Community](https://discord.gg/92vNTzKDGp)
- Check the health endpoint: `/api/health`
