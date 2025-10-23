# Image Gallery Debug Guide

## Status
✅ **Debug version deployed** to production with console logging

## How to Check the Issue

### Step 1: Open a Service Detail Page
1. Go to https://weddingbazaarph.web.app
2. Navigate to a service (e.g., "Baker", "Flower", "Catering Services")
3. Click on any service to open the ServicePreview page

### Step 2: Open Browser Console
- **Windows/Linux**: Press `F12` or `Ctrl + Shift + I`
- **Mac**: Press `Cmd + Option + I`
- Click on the "Console" tab

### Step 3: Look for Debug Logs

You should see logs like this:

```
🖼️ Service data received: {id: "SRV-0002", vendor_id: "2-2025-001", ...}
📸 Images array: ["https://res.cloudinary.com/..."]
🔢 Images type: object
✅ Is array? true

🎨 ServicePreview render:
  - service.images: ["https://res.cloudinary.com/..."]
  - filtered images: ["https://res.cloudinary.com/..."]
  - hasImages: true
  - images.length: 1
```

### Step 4: Analyze the Logs

Check the following:

1. **Is `service.images` an array?**
   - If it says `"Is array? false"`, the backend is not sending an array
   - If it says `"Is array? true"`, the data is correct

2. **Are the filtered images empty?**
   - If `filtered images: []` but `service.images` has data, there's a filtering issue
   - If both are empty, the backend has no images

3. **Is `hasImages` true?**
   - If `hasImages: false` but images exist, the logic is broken
   - If `hasImages: true`, the images should display

4. **Check image URLs**
   - Do the URLs look valid? (Should start with `https://res.cloudinary.com/` or `https://images.unsplash.com/`)
   - Are there any `null` or empty strings?

## Sample Data from Your JSON

From the `services (3).json` you provided:

### Service: "Flower" (SRV-00003)
```json
"images": ["https://res.cloudinary.com/dht64xt1g/image/upload/v1761016234/fqzy2y5jh5tsuldudlnp.webp"]
```
✅ Should display 1 image

### Service: "Catering Services" (SRV-00004)
```json
"images": ["https://res.cloudinary.com/dht64xt1g/image/upload/v1761016025/jp9mmzuinpk0yiqp8die.jpg"]
```
✅ Should display 1 image

### Service: "Baker" (SRV-0002)
```json
"images": ["https://res.cloudinary.com/dht64xt1g/image/upload/v1761017444/ftyfcqstbhldl3ipecjv.webp"]
```
✅ Should display 1 image

### Service: "Test Wedding Photography" (SRV-0001)
```json
"images": ["https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800"]
```
✅ Should display 1 image

## Possible Issues & Solutions

### Issue 1: Backend returning images as string instead of array
**Symptom**: `"Is array? false"`, `"Images type: string"`

**Solution**: Backend needs to parse the JSON array from PostgreSQL
```javascript
// Backend should do:
service.images = typeof service.images === 'string' 
  ? JSON.parse(service.images) 
  : service.images;
```

### Issue 2: Images array is stringified JSON
**Symptom**: `"Images array: "[\"url1\",\"url2\"]"` (notice the quotes)

**Solution**: Backend is double-stringifying the array

### Issue 3: Cloudinary URLs are broken
**Symptom**: Images show but don't load (404 errors)

**Solution**: Check Cloudinary account and image upload process

### Issue 4: CORS issues with Cloudinary
**Symptom**: Console shows CORS errors

**Solution**: Cloudinary needs proper CORS settings

## What to Report Back

After checking the console, please tell me:

1. **What does the console show?**
   - Copy/paste the exact logs you see
   
2. **Do you see the placeholder "No images available"?**
   - If yes, that confirms `hasImages` is false
   
3. **Do you see any error messages?**
   - JavaScript errors
   - Network errors (in Network tab)
   - Image loading errors

4. **Which service are you testing?**
   - Service ID (e.g., "SRV-0002")
   - Service name (e.g., "Baker")

## Quick Test URLs

Try these direct service links:
- Baker: `https://weddingbazaarph.web.app/service/SRV-0002`
- Flower: `https://weddingbazaarph.web.app/service/SRV-00003`
- Catering: `https://weddingbazaarph.web.app/service/SRV-00004`
- Photography: `https://weddingbazaarph.web.app/service/SRV-0001`

---

**Debug Deployed**: October 22, 2025
**URL**: https://weddingbazaarph.web.app
**Next**: Share console logs so I can fix the root cause
