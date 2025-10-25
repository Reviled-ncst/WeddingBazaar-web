# 🔴 CRITICAL ISSUE FOUND: Upload Endpoint Missing

## Issue Summary
**The image upload feature is not working because the backend endpoint `/api/vendors/:vendorId/upload-image` DOES NOT EXIST.**

The frontend code in `VendorProfile.tsx` is trying to upload to:
```javascript
const response = await fetch(`${apiUrl}/api/vendors/${vendorId}/upload-image`, {
  method: 'POST',
  body: formData,
});
```

But this endpoint was never implemented in the backend!

## Root Cause
- ❌ No `/upload-image` endpoint in `backend-deploy/routes/vendors.cjs`
- ❌ No multer configuration for file uploads
- ❌ No Cloudinary integration in backend
- ❌ Frontend is calling a non-existent API endpoint

## Current Backend Routes (vendors.cjs)
```
GET  /api/vendors/featured
GET  /api/vendors
GET  /api/vendors/:vendorId
GET  /api/vendors/:vendorId/services
```

**Missing**: `POST /api/vendors/:vendorId/upload-image`

## Solution Options

### Option 1: Quick Fix - Use Cloudinary Directly from Frontend (RECOMMENDED)
**Pros:**
- ✅ No backend changes needed
- ✅ Works immediately
- ✅ Leverages existing Cloudinary service
- ✅ Simpler architecture for file uploads

**Cons:**
- ⚠️ Cloudinary API key exposed in frontend (use unsigned uploads)
- ⚠️ Need to update database separately

**Implementation:**
1. Use existing `cloudinaryService.ts` in frontend
2. Upload image directly to Cloudinary
3. Get image URL from Cloudinary response
4. Update vendor profile with new image URL via existing API

### Option 2: Complete Backend Implementation
**Pros:**
- ✅ More secure (API keys hidden)
- ✅ Centralized upload logic
- ✅ Better control and validation

**Cons:**
- ❌ Requires backend deployment
- ❌ Need to install multer, cloudinary packages
- ❌ More complex setup

**Implementation:**
1. Install `multer` and `cloudinary` in backend
2. Create upload endpoint with file handling
3. Upload to Cloudinary from backend
4. Update database with new image URL
5. Return success response

## Recommended Fix (Option 1 - Frontend Direct Upload)

### Step 1: Check Cloudinary Configuration
Verify `.env` has:
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
```

### Step 2: Update VendorProfile.tsx Upload Handler
Change from backend upload to direct Cloudinary upload:

```typescript
const handleImageUpload = async (file: File) => {
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    alert('❌ Please select a valid image file (JPG, PNG, GIF, etc.)');
    return;
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    alert('❌ Image must be smaller than 10MB');
    return;
  }

  try {
    setIsUploadingImage(true);
    console.log('🔄 Uploading to Cloudinary...', { fileName: file.name });

    // Upload directly to Cloudinary
    const imageUrl = await cloudinaryService.uploadImage(file, 'vendor-profiles');
    console.log('✅ Cloudinary upload successful:', imageUrl);

    // Update profile with new image URL
    const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
    const response = await fetch(`${apiUrl}/api/vendor-profile/${vendorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_image: imageUrl
      }),
    });

    if (!response.ok) {
      throw new Error(`Profile update failed: ${response.statusText}`);
    }

    // Refresh profile data
    await refetch();
    
    alert('✅ Profile image uploaded successfully!');
    
  } catch (error) {
    console.error('❌ Image upload error:', error);
    alert('❌ Failed to upload image. Please try again.');
  } finally {
    setIsUploadingImage(false);
  }
};
```

### Step 3: Verify Cloudinary Service Exists
Check `src/services/cloudinaryService.ts` has the upload function.

### Step 4: Test the Fix
1. Log in as vendor
2. Go to Profile page
3. Click "Upload Profile Image"
4. Select an image
5. Verify:
   - Console shows "Uploading to Cloudinary"
   - Image appears in Cloudinary dashboard
   - Image URL is returned
   - Profile updates with new image
   - Image displays on page

## Alternative: Complete Backend Solution (If Needed Later)

### Backend Changes Required

#### 1. Install Dependencies
```bash
cd backend-deploy
npm install multer cloudinary
```

#### 2. Create Cloudinary Config
File: `backend-deploy/config/cloudinary.cjs`
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

#### 3. Add Upload Endpoint
File: `backend-deploy/routes/vendors.cjs`
```javascript
const multer = require('multer');
const cloudinary = require('../config/cloudinary.cjs');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload vendor profile image
router.post('/:vendorId/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { vendorId } = req.params;
    const folder = req.body.folder || 'vendor-profiles';

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Upload to Cloudinary using buffer
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    // Update vendor profile with new image URL
    await sql`
      UPDATE vendors 
      SET profile_image = ${result.secure_url}
      WHERE id = ${vendorId}
    `;

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

#### 4. Add Environment Variables to Render
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Next Steps

**RECOMMENDED PATH:**
1. ✅ Implement Option 1 (Frontend direct upload)
2. ✅ Test upload flow works
3. ✅ Verify images save to database
4. ✅ Consider backend implementation later if needed for security

**IF YOU WANT BACKEND UPLOAD:**
1. Create the backend endpoint
2. Install dependencies
3. Configure Cloudinary
4. Deploy backend
5. Test upload flow

## Testing Checklist
- [ ] Cloudinary credentials configured
- [ ] Upload button works
- [ ] File validation works (10MB limit, image types only)
- [ ] Image uploads to Cloudinary
- [ ] Image URL returned successfully
- [ ] Profile updates with new image URL
- [ ] Image displays on profile page
- [ ] Error handling works (large files, wrong types)
- [ ] Loading states display correctly

## Current Status
🔴 **BLOCKED**: Upload endpoint does not exist
🟡 **SOLUTION READY**: Frontend direct upload implementation ready
🟢 **EASY FIX**: Can be fixed in 5-10 minutes with Option 1
