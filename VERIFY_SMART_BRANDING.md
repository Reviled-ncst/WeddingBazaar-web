# 🔍 Quick Verification Guide: Smart Branding

## Test in Production

**Live URL**: https://weddingbazaarph.web.app

---

## ✅ What to Check

### 1. **Homepage / Services Page**
**URL**: `/individual/services` or just `/`

Look for:
- ✅ "🧠 Smart Wedding Planning" (not 🤖 AI)
- ✅ "Smart Assist" button (top right)
- ✅ "Get Smart Recommendations" button

**How to test**:
1. Visit homepage
2. Scroll to service discovery section
3. Check all button labels and headings
4. Should see brain icon (🧠) not robot (🤖)

---

### 2. **Decision Support System Modal**
**How to open**: Click any "Smart" button on services page

Look for:
- ✅ "Smart recommendations incoming" (loading message)
- ✅ "Analyzing services intelligently..." (loading spinner)
- ✅ "Smart Wedding Assistant" (header)
- ✅ "Why We Recommend This" (not "AI Reasoning")

**How to test**:
1. Click "🧠 Smart Assist" button
2. Watch loading messages
3. Check modal header
4. Look at recommendation cards

---

### 3. **Timeline Pages** (If Available)
**URL**: `/individual/timeline`

Look for:
- ✅ "Smart Insights" (not "AI Insights")
- ✅ "Smart planning with personalized insights"
- ✅ "Smart analysis of your timeline in progress"

**How to test**:
1. Navigate to timeline/planning page
2. Check page description
3. Look for insights section
4. Verify terminology

---

### 4. **Security/Verification Pages** (Admin/Vendor)
**URL**: Varies (admin/vendor sections)

Look for:
- ✅ "Extracting information intelligently..."
- ✅ "Loading face recognition models..."

**How to test**:
1. Access document upload features (if available)
2. Check verification flows
3. Verify loading messages

---

## 🚫 Red Flags (Should NOT See)

❌ "AI" anywhere in user-facing text  
❌ "Artificial Intelligence"  
❌ "AI-powered"  
❌ "AI recommendations"  
❌ 🤖 Robot icon  
❌ "AI Wedding Planning"  
❌ "AI Assist"  
❌ "AI Insights"  

---

## ✅ What You SHOULD See

✅ "Smart" or "Intelligent"  
✅ "Smart Wedding Planning"  
✅ "Smart recommendations"  
✅ "Smart Assist"  
✅ "Smart Insights"  
✅ 🧠 Brain icon  
✅ "Analyzing intelligently"  
✅ "Smart analysis"  

---

## 🔧 Quick Browser Test

### Clear Cache First (Important!)
```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)

Or force refresh:
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Test Checklist
1. [ ] Clear browser cache
2. [ ] Visit https://weddingbazaarph.web.app
3. [ ] Navigate to services page
4. [ ] Check all button labels
5. [ ] Open DSS modal
6. [ ] Verify loading messages
7. [ ] Check recommendation cards
8. [ ] Test timeline page (if available)
9. [ ] Search for "AI" using browser search (Ctrl+F)
10. [ ] Should find ZERO instances of "AI" in visible text

---

## 🎯 Success Criteria

**PASS** if:
- No "AI" text visible anywhere
- All icons are 🧠 (brain) not 🤖 (robot)
- Buttons say "Smart" not "AI"
- Loading messages say "intelligently" or "smart"
- Modal headers use "Smart" terminology

**FAIL** if:
- You see "AI" anywhere in the UI
- Robot icons (🤖) are present
- Buttons say "AI Assist" or "Get AI Recommendations"
- Loading messages mention "AI"

---

## 📱 Mobile Testing

Test on mobile devices:
1. Open https://weddingbazaarph.web.app on phone
2. Navigate to services
3. Check all buttons (they may be abbreviated)
4. Open DSS modal
5. Verify terminology

---

## 🐛 What If I Find "AI"?

If you find any "AI" references:

1. **Take a screenshot**
2. **Note the page URL**
3. **Note the exact location** (button, header, modal, etc.)
4. **Report it** - we may have missed a file

---

## ⚡ Quick Test Commands

### Search for "AI" in built files
```powershell
# In project root
Get-ChildItem -Path .\dist -Recurse -Filter *.js | Select-String -Pattern '\bAI\b' -CaseSensitive
```

### Should return: NO MATCHES (or only in code comments/variables)

---

## 📊 Expected Results

After testing, you should see:
- ✅ "Smart Wedding Planning"
- ✅ "Smart Assist"
- ✅ "Smart recommendations"
- ✅ "Analyzing intelligently"
- ✅ "Smart analysis"
- ✅ Brain icons (🧠)
- ✅ Professional, intelligent-sounding copy
- ✅ No "AI" mentions

---

**Last Verified**: November 5, 2025  
**Deployment**: Production (Firebase)  
**Status**: ✅ LIVE
