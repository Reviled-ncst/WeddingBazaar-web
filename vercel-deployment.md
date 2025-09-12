# Vercel Deployment Guide for Wedding Bazaar Backend (Alternative)

## Overview
Deploy the Node.js backend as Vercel serverless functions.

## Prerequisites
1. Vercel account
2. GitHub repository
3. Neon PostgreSQL database

## Deployment Steps

### 1. Create vercel.json Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Install Vercel CLI
```bash
npm i -g vercel
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Set Environment Variables
```bash
vercel env add NODE_ENV production
vercel env add DATABASE_URL postgresql://neondb_owner:npg_9tiyUmfaX3QB@ep-mute-mode-a1c209pi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
# ... add all other environment variables
```

## Note
Vercel is better suited for serverless functions. For a full Express server, **Render is recommended**.
