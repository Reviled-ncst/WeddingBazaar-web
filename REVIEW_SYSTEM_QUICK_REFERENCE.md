# 🎯 Review System - Quick Reference Guide

## 📋 For Developers

### How to Use the Review Service

```typescript
// Import the service
import { reviewService } from '@/shared/services/reviewService';

// Submit a review
const result = await reviewService.submitReview({
  bookingId: '1761577140',
  vendorId: '2-2025-001',
  rating: 5,
  comment: 'Amazing service!',
  images: [] // optional Cloudinary URLs
});

// Check if booking has been reviewed
const hasReview = await reviewService.hasBookingBeenReviewed('1761577140');
// Returns true if reviewed, false if not
```

---

## 🔧 Database Setup

### Run Migration (REQUIRED Before Testing)
```bash
# Connect to production database
node create-reviews-table.cjs
```

### Verify Table Exists
```sql
-- Check if reviews table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'reviews';

-- Check schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews';
```

---

## 🧪 Testing in Production

### 1. Create Test Booking
```sql
-- Mark existing booking as completed
UPDATE bookings 
SET status = 'completed',
    couple_completed = TRUE,
    vendor_completed = TRUE,
    fully_completed = TRUE
WHERE id = '1761577140';
```

### 2. Test Review Submission
```bash
# Using curl
curl -X POST https://weddingbazaar-web.onrender.com/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bookingId": "1761577140",
    "vendorId": "2-2025-001",
    "rating": 5,
    "comment": "Test review"
  }'
```

### 3. Verify Review Created
```sql
SELECT * FROM reviews WHERE booking_id = '1761577140';
```

### 4. Check Vendor Rating Updated
```sql
SELECT rating, total_reviews FROM vendors WHERE id = '2-2025-001';
```

---

## 🎨 UI States

### State 1: Completed Booking (No Review)
```
[Completed ✓]
[⭐ Rate & Review]  ← Button visible
```

### State 2: Completed Booking (Already Reviewed)
```
[Completed ✓]
                    ← Button hidden
```

### State 3: Rating Modal Open
```
┌─────────────────────────────┐
│ Rate Your Experience        │
│                             │
│ ⭐⭐⭐⭐⭐ (5 stars)         │
│                             │
│ ┌─────────────────────────┐ │
│ │ Great service! Would... │ │
│ └─────────────────────────┘ │
│                             │
│ [Cancel] [Submit Review]    │
└─────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Error: "Authentication required"
**Cause**: No JWT token found  
**Fix**: Login again or check localStorage for token
```javascript
// Check if token exists
console.log(localStorage.getItem('auth_token'));
```

### Error: "You have already reviewed this booking"
**Cause**: User already submitted a review  
**Fix**: This is expected behavior (duplicate prevention)

### Error: "Booking not found"
**Cause**: Invalid booking ID  
**Fix**: Verify booking exists and belongs to user

### Error: "You can only review completed bookings"
**Cause**: Booking status is not 'completed'  
**Fix**: Complete the booking first (two-sided completion)

### Button still shows after review
**Cause**: Review status check failed or didn't refresh  
**Fix**: Refresh page or check console for errors

---

## 📊 Monitoring

### Check Review Count
```sql
SELECT COUNT(*) as total_reviews FROM reviews;
```

### Check Average Ratings
```sql
SELECT vendor_id, AVG(rating)::numeric(3,2) as avg_rating, COUNT(*) as review_count
FROM reviews
GROUP BY vendor_id;
```

### Recent Reviews
```sql
SELECT r.*, u.email as reviewer_email, v.business_name as vendor_name
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN vendors v ON r.vendor_id = v.id
ORDER BY r.created_at DESC
LIMIT 10;
```

---

## 🚀 Deployment Commands

### Deploy Backend (Render Auto-Deploys)
```bash
git add backend-deploy/
git commit -m "Update review endpoints"
git push origin main
# Render auto-deploys from main branch
```

### Deploy Frontend (Firebase)
```bash
npm run build
firebase deploy --only hosting
```

### Check Deployment Status
```bash
# Backend health check
curl https://weddingbazaar-web.onrender.com/api/health

# Frontend access
open https://weddingbazaarph.web.app/individual/bookings
```

---

## 📝 Code Snippets

### Add Review Button to Any Component
```tsx
import { reviewService } from '@/shared/services/reviewService';
import { useState, useEffect } from 'react';

const [hasReview, setHasReview] = useState(false);

useEffect(() => {
  const checkReview = async () => {
    const reviewed = await reviewService.hasBookingBeenReviewed(bookingId);
    setHasReview(reviewed);
  };
  checkReview();
}, [bookingId]);

// Render button conditionally
{!hasReview && (
  <button onClick={() => handleRateBooking(booking)}>
    Rate & Review
  </button>
)}
```

### Check Multiple Bookings
```tsx
const checkMultipleReviews = async (bookingIds: string[]) => {
  const results = await Promise.all(
    bookingIds.map(id => reviewService.hasBookingBeenReviewed(id))
  );
  return bookingIds.reduce((acc, id, index) => {
    acc[id] = results[index];
    return acc;
  }, {} as Record<string, boolean>);
};
```

---

## 🎯 Best Practices

### 1. Always Check Review Status Before Showing Button
```typescript
// ✅ Good
const hasReview = await reviewService.hasBookingBeenReviewed(bookingId);
if (!hasReview) {
  // Show button
}

// ❌ Bad
// Always showing button without checking
```

### 2. Handle Errors Gracefully
```typescript
try {
  const result = await reviewService.submitReview(reviewData);
  if (result.success) {
    setSuccessMessage('Review submitted!');
    setHasReview(true); // Hide button immediately
  } else {
    setErrorMessage(result.error);
  }
} catch (error) {
  setErrorMessage('Failed to submit review');
}
```

### 3. Update State Immediately After Submission
```typescript
// ✅ Good - Hide button immediately
const onSubmit = async () => {
  const result = await reviewService.submitReview(reviewData);
  if (result.success) {
    setReviewedBookings(prev => new Set([...prev, bookingId]));
  }
};

// ❌ Bad - Wait for refetch
const onSubmit = async () => {
  await reviewService.submitReview(reviewData);
  await loadBookings(); // Slow, shows button briefly
};
```

---

## 📞 Quick Links

- **Backend API**: https://weddingbazaar-web.onrender.com/api/reviews
- **Frontend**: https://weddingbazaarph.web.app/individual/bookings
- **GitHub Repo**: https://github.com/Reviled-ncst/WeddingBazaar-web
- **Render Dashboard**: https://dashboard.render.com
- **Firebase Console**: https://console.firebase.google.com/project/weddingbazaarph

---

**Last Updated**: October 28, 2025  
**Version**: 1.0.0 (Initial Release)
