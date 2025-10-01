# 🚀 Wedding Bazaar Hosting Workflow Guide

## Current Hosting Status

### ✅ **PRODUCTION DEPLOYED**
- **Frontend**: Firebase Hosting - `https://weddingbazaarph.web.app`
- **Backend**: Render - `https://weddingbazaar-web.onrender.com`
- **Database**: Neon PostgreSQL (connected to backend)

## 🛡️ Safe Hosting Workflow

### Phase 1: Pre-Deployment Checks

#### 1.1 Environment Verification
```bash
# Check all environment files
npm run check:env

# Verify API endpoints
npm run test:api

# Check database connectivity
npm run test:db
```

#### 1.2 Local Testing
```bash
# Test in production mode locally
npm run build:prod
npm run preview

# Test with production API
npm run test:prod-integration
```

### Phase 2: Staging Deployment

#### 2.1 Backend Staging
```bash
# Deploy to Render staging
npm run deploy:backend:staging

# Wait for deployment
npm run wait:backend

# Verify health
npm run health:backend
```

#### 2.2 Frontend Staging
```bash
# Build with staging config
npm run build:staging

# Deploy to Firebase staging
npm run deploy:frontend:staging

# Test staging environment
npm run test:staging
```

### Phase 3: Production Deployment

#### 3.1 Zero-Downtime Backend Deploy
```bash
# Deploy backend first (maintains API compatibility)
npm run deploy:backend:prod

# Wait for health check
npm run health:wait:backend

# Run smoke tests
npm run smoke:backend
```

#### 3.2 Frontend Production Deploy
```bash
# Build with production config
npm run build:prod

# Deploy to Firebase
npm run deploy:frontend:prod

# Verify deployment
npm run health:frontend
```

### Phase 4: Post-Deployment Verification

#### 4.1 Health Checks
```bash
# Complete system health check
npm run health:full

# Database connectivity
npm run health:database

# API endpoints
npm run health:api

# Frontend routing
npm run health:routes
```

## 🔧 Hosting Scripts

### Environment Management
```bash
# Switch to production mode
npm run env:production

# Switch to staging mode  
npm run env:staging

# Verify environment
npm run env:check
```

### Deployment Commands
```bash
# Safe full deployment
npm run deploy:safe

# Rollback if issues
npm run rollback:frontend
npm run rollback:backend

# Emergency hotfix
npm run hotfix:deploy
```

### Monitoring
```bash
# Monitor deployments
npm run monitor:deploy

# Check logs
npm run logs:backend
npm run logs:frontend

# Performance check
npm run perf:check
```

## 🚨 Emergency Procedures

### Backend Issues
1. Check Render logs: `npm run logs:backend`
2. Verify database: `npm run health:database`
3. Rollback if needed: `npm run rollback:backend`
4. Redeploy: `npm run deploy:backend:emergency`

### Frontend Issues
1. Check Firebase hosting: `npm run logs:frontend`
2. Verify build: `npm run build:verify`
3. Rollback: `npm run rollback:frontend`
4. Redeploy: `npm run deploy:frontend:emergency`

### Database Issues
1. Check Neon status: `npm run health:database`
2. Verify connections: `npm run test:db:connections`
3. Check query performance: `npm run db:perf`

## 📊 Monitoring Dashboard

### Key Metrics to Watch
- Backend response times
- Database query performance
- Frontend load times
- Error rates
- User authentication success
- Payment processing status

### Alerts Setup
- Backend downtime > 30 seconds
- Database connection errors
- Frontend 5xx errors
- Payment failures
- User registration failures

## 🔒 Security Checklist

### Pre-Deployment Security
- [ ] Environment variables secured
- [ ] API keys rotated if needed
- [ ] Database credentials updated
- [ ] CORS settings verified
- [ ] SSL certificates valid
- [ ] Authentication tokens fresh

### Post-Deployment Security
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Authentication working
- [ ] Authorization proper
- [ ] Data encryption active
- [ ] Logging sanitized

## 📋 Deployment Checklist

### Before Every Deploy
- [ ] Code reviewed and tested
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Third-party services working
- [ ] Backup plan ready
- [ ] Rollback procedure tested

### During Deploy
- [ ] Monitor deployment logs
- [ ] Watch for errors
- [ ] Check health endpoints
- [ ] Verify database connectivity
- [ ] Test critical user flows
- [ ] Monitor performance metrics

### After Deploy
- [ ] Full smoke test
- [ ] User acceptance testing
- [ ] Performance verification
- [ ] Security scan
- [ ] Documentation updated
- [ ] Team notified

## 🎯 Best Practices

### Development Workflow
1. **Feature Branch** → Development
2. **Staging Deploy** → Testing
3. **Production Deploy** → Live
4. **Monitor** → Verify
5. **Document** → Learn

### Database Safety
- Always run migrations in staging first
- Keep database backups current
- Test rollback procedures
- Monitor query performance
- Use connection pooling

### Frontend Safety
- Build verification before deploy
- CDN cache management
- Progressive deployment
- A/B testing capability
- Performance monitoring

### Backend Safety
- Health check endpoints
- Graceful shutdown
- Auto-scaling ready
- Error handling robust
- Logging comprehensive

## 🚀 Quick Commands Reference

```bash
# Emergency stop
npm run emergency:stop

# Quick deploy
npm run deploy:quick

# Health check all
npm run health:all

# Logs all
npm run logs:all

# Rollback all
npm run rollback:all

# Status check
npm run status:full
```

---

## 📞 Support Contacts

- **Backend Issues**: Render Dashboard
- **Frontend Issues**: Firebase Console  
- **Database Issues**: Neon Console
- **Payment Issues**: PayMongo Dashboard
- **Domain Issues**: Domain Provider

Remember: **Always test in staging before production!**
