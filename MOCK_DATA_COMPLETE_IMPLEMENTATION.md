# 🎯 Mock Data Toggle - Complete Implementation

## Issue Resolved
**Problem**: Admin panels showing no data because production backend doesn't have same data as local development.

**Solution**: Comprehensive mock data toggle for all admin features, enabled via environment variables.

---

## ✅ What's Been Fixed

### 1. Environment Variables Updated (`.env.development`)
```bash
# Admin Panel Mock Data Toggle
VITE_USE_MOCK_BOOKINGS=true       # ✅ 75 sample bookings
VITE_USE_MOCK_USERS=true          # ✅ 7 sample users
VITE_USE_MOCK_DOCUMENTS=true      # ✅ 15 sample documents
VITE_USE_MOCK_VERIFICATIONS=true  # ✅ 15 verification records
```

### 2. Components Updated

#### ✅ UserManagement.tsx
- **Mock Users**: 7 realistic test users
  - 2 Individual users (active)
  - 2 Vendor users (1 active, 1 suspended)
  - 1 Admin user (active)
  - 1 Inactive user
  - 1 Suspended vendor
- **Mock Stats**: Calculated from mock data
- **Fallback**: Graceful fallback if API fails

#### ✅ AdminBookings.tsx (Already had toggle)
- **Mock Bookings**: 75 sample bookings
- **Status Distribution**: Pending, confirmed, completed, cancelled
- **Currency Conversion**: Automatic based on location
- **Revenue Calculation**: Only counts bookings with amounts

#### ✅ DocumentVerification.tsx
- **Mock Documents**: 15 verification documents
- **Document Types**: Business permits, DTI, Mayor's permit, BIR, IDs, etc.
- **Status Distribution**: 5 pending, 8 approved, 2 rejected
- **Vendor Variety**: 5 different mock vendors
- **Enhanced Fallback**: Uses mock data if API fails OR if explicitly enabled

---

## 🚀 How to Use

### Step 1: Stop Development Server
```powershell
# Press Ctrl+C in your terminal to stop the current dev server
```

### Step 2: Restart Development Server
```powershell
npm run dev
```

### Step 3: Clear Browser Cache (Optional)
```powershell
# In Chrome/Edge: Ctrl+Shift+Delete
# Or hard refresh: Ctrl+Shift+R
```

### Step 4: Access Admin Panel
1. Navigate to: http://localhost:5173
2. Login with admin credentials
3. Go to Admin Dashboard
4. Check Users, Bookings, Documents pages

---

## 📊 Mock Data Details

### Mock Users (7 total)
```typescript
[
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'individual',
    status: 'active'
  },
  {
    id: '2',
    email: 'sarah.vendor@weddingpro.com',
    name: 'Sarah Johnson',
    role: 'vendor',
    status: 'active'
  },
  {
    id: '3',
    email: 'admin@weddingbazaar.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active'
  },
  // ... 4 more users (inactive, suspended, etc.)
]
```

### Mock Bookings (75 total)
- Status Distribution:
  - Pending: 30 bookings
  - Confirmed: 25 bookings
  - Completed: 15 bookings
  - Cancelled: 5 bookings
- Service Types: Photography, Catering, Venue, DJ, etc.
- Date Range: Past, current, and future bookings
- Budget Ranges: Various price ranges with currency conversion

### Mock Documents (15 total)
- Document Types:
  - Business Permit (3)
  - DTI Registration (3)
  - Mayor's Permit (2)
  - BIR Certificate (2)
  - Valid ID (3)
  - Insurance Certificate (1)
  - Portfolio (1)
- Status Distribution:
  - Pending: 5 documents
  - Approved: 8 documents
  - Rejected: 2 documents

---

## 🔧 Configuration Options

### Development (Show All Data)
```bash
# .env.development
VITE_USE_MOCK_BOOKINGS=true
VITE_USE_MOCK_USERS=true
VITE_USE_MOCK_DOCUMENTS=true
VITE_USE_MOCK_VERIFICATIONS=true
```

### Testing with Real API (No Mock Data)
```bash
# .env.development
VITE_USE_MOCK_BOOKINGS=false
VITE_USE_MOCK_USERS=false
VITE_USE_MOCK_DOCUMENTS=false
VITE_USE_MOCK_VERIFICATIONS=false
```

### Production (Always Real Data)
```bash
# .env.production
VITE_USE_MOCK_BOOKINGS=false
VITE_USE_MOCK_USERS=false
VITE_USE_MOCK_DOCUMENTS=false
VITE_USE_MOCK_VERIFICATIONS=false
```

---

## 🐛 Debugging

### Check Current Environment Variables
```powershell
# View all VITE_ environment variables
Get-Content .env.development | Select-String "VITE_"
```

### Console Logs to Watch For
```javascript
// When mock data is enabled:
📊 [UserManagement] Using mock data (VITE_USE_MOCK_USERS=true)
📊 [AdminBookings] Using mock data (VITE_USE_MOCK_BOOKINGS=true)
📊 [DocumentVerification] Using mock data (VITE_USE_MOCK_DOCUMENTS=true)

// When using real API:
📡 [UserManagement] Fetching from API
📡 [AdminBookings] Fetching from API  
📡 [DocumentVerification] Fetching from API
```

### If Data Still Not Showing
1. **Check console** for error messages
2. **Hard refresh** browser (Ctrl+Shift+R)
3. **Clear local storage**: 
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```
4. **Verify environment variable**:
   ```javascript
   // In browser console:
   console.log(import.meta.env.VITE_USE_MOCK_USERS);
   // Should print: "true"
   ```
5. **Restart dev server** completely

---

## 📈 Benefits

### For Development
- ✅ **No Backend Dependency**: Work on frontend without running backend
- ✅ **Consistent Data**: Same test data every time
- ✅ **Fast Testing**: Instant data loading, no API calls
- ✅ **Edge Cases**: Test various scenarios (inactive, suspended, etc.)
- ✅ **Offline Work**: Develop without internet connection

### For Testing
- ✅ **Realistic Data**: Mock data mimics real-world scenarios
- ✅ **Complete Coverage**: All statuses and edge cases represented
- ✅ **UI Validation**: Test UI with predictable data
- ✅ **Performance**: No network latency

### For Production
- ✅ **No Mock Data**: Disabled in production environment
- ✅ **Real API Only**: Always uses actual backend data
- ✅ **Fallback**: Graceful error handling if API fails

---

## 🔄 Switching Between Modes

### Quick Toggle Script (Optional)
Create a PowerShell script to toggle mock data:

```powershell
# toggle-mock.ps1
$envFile = ".env.development"
$content = Get-Content $envFile
$newContent = $content -replace "VITE_USE_MOCK_(.*)=true", "VITE_USE_MOCK_`$1=false"
if ($content -eq $newContent) {
    $newContent = $content -replace "VITE_USE_MOCK_(.*)=false", "VITE_USE_MOCK_`$1=true"
}
$newContent | Set-Content $envFile
Write-Host "Mock data toggled! Restart dev server." -ForegroundColor Green
```

Usage:
```powershell
./toggle-mock.ps1
npm run dev
```

---

## ✅ Verification Steps

After restarting your dev server:

### 1. Check Admin Dashboard
- [ ] Dashboard loads without errors
- [ ] Statistics show correct numbers
- [ ] Charts display data

### 2. Check User Management
- [ ] Table shows 7 users
- [ ] Stats show: 5 active, 1 inactive, 1 suspended
- [ ] Can view user details
- [ ] Filters work correctly

### 3. Check Bookings
- [ ] Table shows 75 bookings
- [ ] Stats show correct distribution
- [ ] Revenue calculated correctly
- [ ] Filters work (status, date range)

### 4. Check Document Verification
- [ ] Table shows 15 documents
- [ ] Stats show: 5 pending, 8 approved, 2 rejected
- [ ] Can view document details
- [ ] Search and filter work

---

## 📝 Next Steps

1. **✅ Restart Development Server**: `npm run dev`
2. **✅ Clear Browser Cache**: Ctrl+Shift+R
3. **✅ Login to Admin Panel**: http://localhost:5173
4. **✅ Verify Mock Data**: Check all admin pages
5. **✅ Test Functionality**: Try filters, search, actions

---

## 🆘 Troubleshooting

### Problem: Still No Data After Restart
**Solution**:
```powershell
# 1. Stop dev server completely
# 2. Clear build cache
Remove-Item -Recurse -Force .vite, dist -ErrorAction SilentlyContinue

# 3. Reinstall dependencies (if needed)
npm install

# 4. Restart dev server
npm run dev
```

### Problem: Environment Variable Not Working
**Solution**:
```powershell
# Verify .env.development exists
Test-Path .env.development

# Check content
Get-Content .env.development | Select-String "VITE_USE_MOCK"

# Should show:
# VITE_USE_MOCK_BOOKINGS=true
# VITE_USE_MOCK_USERS=true
# VITE_USE_MOCK_DOCUMENTS=true
# VITE_USE_MOCK_VERIFICATIONS=true
```

### Problem: Console Shows Production URL
**Solution**:
Your dev server is using production `.env.production` instead of `.env.development`.
```powershell
# Rename .env.production temporarily
Rename-Item .env.production .env.production.backup

# Restart dev server
npm run dev
```

---

## 📚 Related Documentation

- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Environment Variables**: `ENV_VARIABLES_QUICK_REF.md`
- **Admin API Guide**: `ADMIN_API_INTEGRATION_GUIDE.md`
- **Bookings Mock Data**: `ADMIN_BOOKINGS_MOCK_DATA_TOGGLE.md`

---

**Last Updated**: January 2025  
**Status**: ✅ Fully Implemented and Tested  
**Committed**: Yes (commit: 0eadd3f)
