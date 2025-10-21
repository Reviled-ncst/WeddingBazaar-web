# 🔄 IMPORTANT: Clear Browser Cache Instructions

## ⚠️ CRITICAL: Frontend Has Been Updated

The frontend has been deployed with critical fixes. **You MUST clear your browser cache** to see the changes!

---

## 🌐 How to Hard Refresh (Clear Cache and Reload)

### **Windows / Linux:**
- **Chrome / Edge / Firefox:** Press `Ctrl + Shift + R`
- **Or:** Press `Ctrl + F5`

### **macOS:**
- **Chrome / Edge:** Press `Cmd + Shift + R`
- **Safari:** Press `Cmd + Option + R`
- **Firefox:** Press `Cmd + Shift + R`

### **Alternative Method (Full Cache Clear):**

#### Chrome / Edge:
1. Press `F12` to open DevTools
2. **Right-click** the refresh button (next to URL bar)
3. Select **"Empty Cache and Hard Reload"**

#### Firefox:
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select **"Cached Web Content"**
3. Click **"Clear Now"**

#### Safari:
1. Go to **Safari → Preferences → Advanced**
2. Enable **"Show Develop menu"**
3. Click **Develop → Empty Caches**
4. Reload the page

---

## 🧪 Verify the Fix is Active

After hard refresh, open the browser console (`F12` → Console tab) and check for these logs:

### ✅ **Success Logs (What You Should See):**
```
✅ [QuoteModal] Found pre-parsed serviceItems array: (7) [{...}, {...}, ...]
✅ [QuoteModal] Transformed quote data with 7 service items from pre-parsed array
```

### ❌ **Old Logs (Means Cache Not Cleared):**
```
⚠️ [QuoteModal] No vendor_notes found in booking!
📋 [QuoteModal] Using mock quote data from booking: {...}
```

---

## 📊 Expected Result After Cache Clear

### **BEFORE (Old Cached Version):**
- Modal shows only 1 service: "Wedding Service"
- Currency may show $ instead of ₱
- Total may be incorrect

### **AFTER (New Deployed Version):**
- Modal shows **all 7 itemized services:**
  1. Full-Day Photography Coverage - ₱15,000
  2. Professional Videography - ₱12,000
  3. Photo Editing & Enhancement - ₱5,000
  4. Wedding Album (30 pages) - ₱8,000
  5. Digital Photo Files (High-Res) - ₱3,000
  6. On-Site Printing Service - ₱4,000
  7. Drone Aerial Shots - ₱3,000
- Currency is **₱** (Philippine Peso)
- Total is **₱50,000**
- Downpayment is **₱15,000**
- Balance is **₱35,000**

---

## 🚀 Quick Verification Steps

1. **Hard refresh** the page: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. Log in as the couple with a quote
3. Go to **My Bookings**
4. Find the booking with status **"Quote Sent"**
5. Click **"View Quote"** button
6. Check the console for `✅ Found pre-parsed serviceItems array`
7. Verify the modal shows all 7 services with ₱ currency

---

## ⏰ Browser Cache Lifespan

- **Firebase Hosting:** Cache headers set to 1 hour max
- **Browser Cache:** May persist longer depending on browser settings
- **Service Worker:** May cache resources (disable in DevTools if needed)

---

## 🔧 If Hard Refresh Doesn't Work

### **Option 1: Clear Browser Cache Manually**
1. Open browser settings
2. Go to **Privacy and Security**
3. Click **"Clear browsing data"**
4. Select **"Cached images and files"**
5. Choose **"All time"** or **"Last hour"**
6. Click **"Clear data"**

### **Option 2: Use Incognito/Private Mode**
- **Chrome/Edge:** `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
- **Firefox:** `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- **Safari:** `Cmd+Shift+N`

### **Option 3: Disable Cache in DevTools**
1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Check **"Disable cache"**
4. Keep DevTools open and reload the page

---

## 📝 Deployment Details

- **Deployment Time:** 2025-06-01
- **Hosting:** Firebase Hosting (https://weddingbazaarph.web.app)
- **CDN:** Firebase CDN (multiple edge locations)
- **Cache Invalidation:** Automatic on deploy
- **Browser Cache:** Requires manual clear (hard refresh)

---

## ⚠️ Known Issue: Aggressive Browser Caching

Some browsers aggressively cache JavaScript bundles. If you still see old behavior after hard refresh:

1. **Check bundle hash in URL:**
   - Old: `index-ABC123XYZ.js`
   - New: `index-BXnY6R5h.js` (latest)

2. **Force reload specific bundle:**
   - Open DevTools → Network tab
   - Find `index-*.js` file
   - Right-click → **"Open in new tab"** (force reload)

3. **Clear Service Worker cache:**
   - DevTools → Application → Service Workers
   - Click **"Unregister"** next to active service worker
   - Reload page

---

## ✅ Confirmation

After hard refresh, you should see:
- ✅ All 7 itemized services in quote modal
- ✅ Correct currency symbol (₱)
- ✅ Correct total amounts
- ✅ Proper console logs indicating new version

---

**Remember:** Always hard refresh after a deployment to ensure you're testing the latest version!

**Created:** 2025-06-01  
**Purpose:** Ensure users see the latest deployed changes
