# GitHub Repository Setup Instructions

## 1. Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Repository name: `WeddingBazaar-web`
4. Description: `Full-stack Wedding Bazaar platform with React, TypeScript, Node.js, and Neon PostgreSQL`
5. Set to **Public** (required for free Render deployment)
6. **Do NOT** initialize with README (we already have one)
7. Click "Create repository"

## 2. Add Remote Origin
Copy the repository URL from GitHub and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/WeddingBazaar-web.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## 3. Verify Push
After pushing, your repository should show:
- 428 files
- Frontend source code in `src/`
- Backend source code in `server/` and `backend/`
- Deployment configs: `render.yaml`, `firebase.json`, `.env.production`

## 4. Repository URL Format
Your repository URL will be: `https://github.com/YOUR_USERNAME/WeddingBazaar-web`

This URL is needed for Render deployment in the next step.

## Next Steps
After setting up GitHub:
1. Follow `render-deployment.md` for backend deployment
2. Update frontend API URL after backend is deployed
3. Test full production flow
