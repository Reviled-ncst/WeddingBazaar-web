# Document Upload Issue - Troubleshooting Guide

## Issue Report
**User**: Vendor (Alison Ortega, ID: 2-2025-002)  
**Problem**: Cannot upload documents/images in Add Service form  
**Status**: Investigating  

---

## System Status Check

### ✅ What's Working
- Firebase authentication: ✅ SUCCESS
- Vendor login: ✅ SUCCESS  
- Cloudinary service initialized: ✅ SUCCESS
- Cloudinary config: ✅ Valid (cloud: dht64xt1g, preset: weddingbazaarus)
- Backend API: ✅ Connected

### ⏳ What We're Checking
- File input functionality
- Cloudinary upload endpoint
- Error handling in upload process

---

## Possible Causes

### 1. **Browser File Picker Not Opening**
**Symptoms**:
- Click upload area → nothing happens
- No file selection dialog

**Causes**:
- Input element disabled
- JavaScript event not firing
- Browser permissions

**Fix**: Check if `disabled={isUploading}` is blocking

### 2. **File Picker Works But Upload Fails**
**Symptoms**:
- Can select file
- See "Uploading..." message
- Then error alert appears

**Causes**:
- Cloudinary API error
- CORS issue
- Invalid upload preset
- File size/type restriction

**Fix**: Check console for Cloudinary error response

### 3. **Silent Failure**
**Symptoms**:
- Select file
- Nothing happens (no loading, no error)

**Causes**:
- JavaScript error in upload handler
- Event listener not attached
- State update failing

**Fix**: Check browser console for JavaScript errors

---

## Debugging Steps

### Step 1: Check Browser Console
Open DevTools (F12) → Console tab

**Look for**:
```javascript
// Success indicators
📤 [AddServiceForm] Uploading image: filename.jpg Size: 12345
🌤️ [Cloudinary] Starting upload...
✅ [AddServiceForm] Image uploaded successfully

// Error indicators
❌ [AddServiceForm] Failed to upload image
❌ [AddServiceForm] Image upload failed
🌤️ [Cloudinary] Error response body
```

### Step 2: Test File Picker
1. Click the upload area
2. Check if file dialog opens
3. Select an image file (JPG/PNG)
4. Watch console for messages

### Step 3: Check Network Tab
1. Open DevTools → Network tab
2. Try uploading an image
3. Look for requests to `api.cloudinary.com`
4. Check if request fails (red color)

### Step 4: Verify Cloudinary Config
Console should show on page load:
```javascript
🌤️ [Cloudinary] Initialized with: {
  cloudName: "dht64xt1g",
  uploadPreset: "weddingbazaarus"
}
```

---

## Quick Fixes to Try

### Fix 1: Clear Upload State
If stuck in "uploading" state, refresh the page.

### Fix 2: Try Different File
- Use small image (< 1MB)
- Use common format (JPG or PNG)
- Check file name (no special characters)

### Fix 3: Check Browser Permissions
- Allow file access for the site
- Check if any extensions block uploads
- Try in incognito mode

### Fix 4: Network Issues
- Check internet connection
- Try different network
- Check if Cloudinary is accessible

---

## Code Verification

### Upload Handler Location
**File**: `src/pages/users/vendor/services/components/AddServiceForm.tsx`  
**Function**: `handleImageUpload` (line ~702)

### Key Code Sections

1. **File Input**:
```tsx
<input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) => handleImageUpload(e.target.files)}
  disabled={isUploading}  // Check this!
/>
```

2. **Upload Logic**:
```typescript
const handleImageUpload = async (files: FileList | null, isMain = false) => {
  if (!files) return;  // Early return if no files
  
  setIsUploading(true);  // Show loading state
  
  // Cloudinary upload...
  const result = await cloudinaryService.uploadImage(file, 'vendor-services');
}
```

3. **Cloudinary Service**:
```typescript
async uploadImage(file: File, folder: string = 'vendor-profiles') {
  // Validates file type and size
  // Uploads to Cloudinary
  // Returns secure URL
}
```

---

## Expected Behavior

### Upload Flow
```
1. User clicks upload area
   ↓
2. File picker opens
   ↓
3. User selects image(s)
   ↓
4. Console shows: "📤 Uploading image..."
   ↓
5. UI shows spinning loader
   ↓
6. Cloudinary upload happens
   ↓
7. Console shows: "✅ Image uploaded successfully"
   ↓
8. Image preview appears in form
```

### On Error
```
1. Upload fails
   ↓
2. Console shows: "❌ Failed to upload"
   ↓
3. Alert popup: "Image Upload Failed"
   ↓
4. User can retry
```

---

## Information Needed

To diagnose the issue, please provide:

1. **Exact error message** (from alert or console)
2. **Console logs** when clicking upload
3. **Network tab** - any failed requests?
4. **What happens** when you click the upload area:
   - Nothing?
   - File picker opens?
   - Loading then error?
   - Silent failure?

---

## Environment Check

### Cloudinary Configuration
- ✅ Cloud Name: `dht64xt1g`
- ✅ Upload Preset: `weddingbazaarus`
- ✅ Preset should allow unsigned uploads
- ✅ Should accept all image formats

### Browser Compatibility
- ✅ Modern browsers (Chrome, Firefox, Edge, Safari)
- ✅ File API support required
- ✅ FormData API support required
- ✅ Fetch API support required

---

## Next Steps

### If File Picker Doesn't Open
→ Input element issue - need to fix disabled state or event handler

### If File Picker Opens But Upload Fails
→ Cloudinary API issue - need console error details

### If Silent Failure
→ JavaScript error - need to check console for exceptions

---

**Please share**:
1. Browser console output (all errors/logs)
2. What exactly happens when you click upload
3. Any error messages you see

This will help pinpoint the exact issue!
