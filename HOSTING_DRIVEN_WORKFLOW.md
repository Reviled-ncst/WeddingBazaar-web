# Hosting-Driven Development - Quick Reference

## 🚀 INSTANT DEPLOYMENT COMMANDS

### Quick Deploy (Test in Production)
```powershell
.\deploy-quick.ps1
```
**Use this for**: Rapid iteration, testing UI changes, verifying fixes

### Full Deploy (Commit + Production)
```powershell
.\deploy-full.ps1 "your commit message"
```
**Use this for**: Committing finished features to GitHub and production

---

## ⚡ Your Workflow

1. **Code** → Make changes
2. **Quick Deploy** → `.\deploy-quick.ps1` → Test in production
3. **Iterate** → Fix, redeploy, test again
4. **Full Deploy** → `.\deploy-full.ps1 "message"` → Commit & production

---

## 🌐 Production URLs

- **App**: https://weddingbazaarph.web.app
- **API**: https://weddingbazaar-web.onrender.com
- **Console**: https://console.firebase.google.com/project/weddingbazaarph/overview

---

## 📦 What Just Deployed

**Date**: January 2025  
**Status**: ✅ LIVE  
**Changes**:
- Contact info section removed from Add Service Form
- Form streamlined to 4 steps
- All changes tested in production

**Next Steps**: Test the form at https://weddingbazaarph.web.app

---

## 💡 Pro Tips

- Deploy often, test immediately
- Use quick deploy for iterations
- Full deploy when feature is stable
- Always check browser console after deploy
- Test on mobile devices in production

---

**You're all set for hosting-driven development!** 🎉
